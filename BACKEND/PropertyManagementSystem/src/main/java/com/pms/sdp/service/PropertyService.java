package com.pms.sdp.service;

import com.pms.sdp.exception.AccessDeniedException;
import com.pms.sdp.exception.ResourceNotFoundException;
import com.pms.sdp.model.AppUser;
import com.pms.sdp.model.Property;
import com.pms.sdp.repository.PropertyRepository;
import com.pms.sdp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    /**
     * Get all properties (for ADMIN)
     */
    public List<Map<String, Object>> getAllProperties() {
        List<Property> properties = propertyRepository.findAll();
        return convertPropertiesToDtoList(properties);
    }

    /**
     * Get properties for a specific seller
     */
    public List<Map<String, Object>> getSellerProperties(String username) {
        AppUser seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        List<Property> properties = propertyRepository.findBySeller(seller);
        return convertPropertiesToDtoList(properties);
    }

    /**
     * Get property by id (with access control)
     */
    public Map<String, Object> getPropertyById(Long propertyId, String username, String role) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
        
        // If user is not admin and not the seller, deny access
        if (!role.equals("ADMIN") && !property.getSeller().getUsername().equals(username)) {
            throw new AccessDeniedException("You don't have permission to access this property");
        }
        
        return convertPropertyToDto(property);
    }

    /**
     * Add a new property
     */
    public Map<String, Object> addProperty(String username, Map<String, Object> propertyData, List<MultipartFile> images) {
        AppUser seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Property property = new Property();
        property.setSeller(seller);
        
        // Set property fields from request data
        updatePropertyFields(property, propertyData);
        
        // Handle image uploads
        String imageUrls = uploadPropertyImages(images);
        property.setImageUrls(imageUrls);
        
        // Set audit fields
        property.setCreatedBy(username);
        property.setCreatedDate(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        
        Property savedProperty = propertyRepository.save(property);
        
        Map<String, Object> response = convertPropertyToDto(savedProperty);
        response.put("message", "Property added successfully");
        
        return response;
    }

    /**
     * Update property (with access control)
     */
    public Map<String, Object> updateProperty(Long propertyId, String username, String role, Map<String, Object> propertyData) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
        
        // If user is not admin and not the seller, deny access
        if (!role.equals("ADMIN") && !property.getSeller().getUsername().equals(username)) {
            throw new AccessDeniedException("You don't have permission to update this property");
        }
        
        // Update property fields
        updatePropertyFields(property, propertyData);
        
        // Set audit fields
        property.setLastModifiedBy(username);
        property.setLastModifiedDate(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        
        Property updatedProperty = propertyRepository.save(property);
        
        Map<String, Object> response = convertPropertyToDto(updatedProperty);
        response.put("message", "Property updated successfully");
        
        return response;
    }

    /**
     * Update property images (with access control)
     */
    public Map<String, Object> updatePropertyImages(Long propertyId, String username, String role, List<MultipartFile> images) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
        
        // If user is not admin and not the seller, deny access
        if (!role.equals("ADMIN") && !property.getSeller().getUsername().equals(username)) {
            throw new AccessDeniedException("You don't have permission to update this property");
        }
        
        // Delete old images if they exist
        if (property.getImageUrls() != null && !property.getImageUrls().isEmpty()) {
            Arrays.stream(property.getImageUrls().split(","))
                  .forEach(url -> cloudinaryService.deleteImage(url));
        }
        
        // Upload new images
        String imageUrls = uploadPropertyImages(images);
        property.setImageUrls(imageUrls);
        
        // Set audit fields
        property.setLastModifiedBy(username);
        property.setLastModifiedDate(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        
        Property updatedProperty = propertyRepository.save(property);
        
        Map<String, Object> response = convertPropertyToDto(updatedProperty);
        response.put("message", "Property images updated successfully");
        
        return response;
    }

    /**
     * Delete property (with access control)
     */
    public Map<String, Object> deleteProperty(Long propertyId, String username, String role) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
        
        // If user is not admin and not the seller, deny access
        if (!role.equals("ADMIN") && !property.getSeller().getUsername().equals(username)) {
            throw new AccessDeniedException("You don't have permission to delete this property");
        }
        
        // Delete property images from Cloudinary
        if (property.getImageUrls() != null && !property.getImageUrls().isEmpty()) {
            Arrays.stream(property.getImageUrls().split(","))
                  .forEach(url -> cloudinaryService.deleteImage(url));
        }
        
        propertyRepository.delete(property);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Property deleted successfully");
        
        return response;
    }

    /**
     * Helper method to upload multiple property images
     */
    private String uploadPropertyImages(List<MultipartFile> images) {
        if (images == null || images.isEmpty()) {
            return "";
        }
        
        List<String> uploadedUrls = new ArrayList<>();
        
        for (MultipartFile image : images) {
            String imageUrl = cloudinaryService.uploadImage(image);
            if (imageUrl != null) {
                uploadedUrls.add(imageUrl);
            }
        }
        
        return String.join(",", uploadedUrls);
    }

    /**
     * Helper method to update property fields from request data
     */
    private void updatePropertyFields(Property property, Map<String, Object> propertyData) {
        if (propertyData.containsKey("title")) {
            property.setTitle((String) propertyData.get("title"));
        }
        
        if (propertyData.containsKey("description")) {
            property.setDescription((String) propertyData.get("description"));
        }
        
        if (propertyData.containsKey("propertyType")) {
            property.setPropertyType((String) propertyData.get("propertyType"));
        }
        
        if (propertyData.containsKey("price")) {
            property.setPrice(Double.valueOf(propertyData.get("price").toString()));
        }
        
        if (propertyData.containsKey("location")) {
            property.setLocation((String) propertyData.get("location"));
        }
        
        if (propertyData.containsKey("bedrooms")) {
            property.setBedrooms(Integer.valueOf(propertyData.get("bedrooms").toString()));
        }
        
        if (propertyData.containsKey("bathrooms")) {
            property.setBathrooms(Integer.valueOf(propertyData.get("bathrooms").toString()));
        }
        
        if (propertyData.containsKey("area")) {
            property.setArea(Double.valueOf(propertyData.get("area").toString()));
        }
        
        if (propertyData.containsKey("amenities")) {
            property.setAmenities((String) propertyData.get("amenities"));
        }
        
        if (propertyData.containsKey("isAvailable")) {
            property.setIsAvailable((Boolean) propertyData.get("isAvailable"));
        }
    }

    /**
     * Helper method to convert Property entity to DTO
     */
    private Map<String, Object> convertPropertyToDto(Property property) {
        Map<String, Object> propertyDto = new HashMap<>();
        propertyDto.put("id", property.getId());
        propertyDto.put("title", property.getTitle());
        propertyDto.put("description", property.getDescription());
        propertyDto.put("propertyType", property.getPropertyType());
        propertyDto.put("price", property.getPrice());
        propertyDto.put("location", property.getLocation());
        propertyDto.put("bedrooms", property.getBedrooms());
        propertyDto.put("bathrooms", property.getBathrooms());
        propertyDto.put("area", property.getArea());
        propertyDto.put("amenities", property.getAmenities());
        propertyDto.put("imageUrls", property.getImageUrls() != null && !property.getImageUrls().isEmpty() 
                ? Arrays.asList(property.getImageUrls().split(",")) 
                : Collections.emptyList());
        propertyDto.put("isAvailable", property.getIsAvailable());
        propertyDto.put("seller", property.getSeller().getUsername());
        propertyDto.put("sellerFullName", property.getSeller().getFullName());
        propertyDto.put("createdDate", property.getCreatedDate());
        
        return propertyDto;
    }

    /**
     * Helper method to convert a list of Property entities to DTOs
     */
    private List<Map<String, Object>> convertPropertiesToDtoList(List<Property> properties) {
        return properties.stream()
                .map(this::convertPropertyToDto)
                .collect(Collectors.toList());
    }
    
    public List<Map<String, Object>> getAvailableProperties(
            String location, String propertyType, Double minPrice, Double maxPrice, 
            Integer minBedrooms, Integer minBathrooms) {
        
        List<Property> allProperties = propertyRepository.findByIsAvailableTrue();
        
        // Apply filters
        List<Property> filteredProperties = allProperties.stream()
                .filter(p -> location == null || p.getLocation().toLowerCase().contains(location.toLowerCase()))
                .filter(p -> propertyType == null || p.getPropertyType().equalsIgnoreCase(propertyType))
                .filter(p -> minPrice == null || p.getPrice() >= minPrice)
                .filter(p -> maxPrice == null || p.getPrice() <= maxPrice)
                .filter(p -> minBedrooms == null || p.getBedrooms() >= minBedrooms)
                .filter(p -> minBathrooms == null || p.getBathrooms() >= minBathrooms)
                .collect(Collectors.toList());
        
        return convertPropertiesToDtoList(filteredProperties);
    }

    /**
     * Get property details by id (for public access)
     */
    public Map<String, Object> getPropertyDetailsById(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
        
        // Convert property to DTO with limited seller information for public view
        Map<String, Object> propertyDto = convertPropertyToDto(property);
        
        // Remove sensitive seller information, only keep necessary info
        if (propertyDto.containsKey("seller")) {
            propertyDto.remove("seller");
        }
        
        return propertyDto;
    }
}