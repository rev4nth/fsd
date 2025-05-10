package com.pms.sdp.controller;

import com.pms.sdp.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    /**
     * Get all properties (ADMIN only)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllProperties() {
        List<Map<String, Object>> properties = propertyService.getAllProperties();
        return ResponseEntity.ok(properties);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<List<Map<String, Object>>> getMyProperties(Authentication authentication) {
        String username = authentication.getName();
        List<Map<String, Object>> properties = propertyService.getSellerProperties(username);
        return ResponseEntity.ok(properties);
    }

    /**
     * Get specific property (with access control)
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPropertyById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String username = authentication.getName();
        String role = getUserRole(authentication);
        Map<String, Object> property = propertyService.getPropertyById(id, username, role);
        return ResponseEntity.ok(property);
    }

    /**
     * Add a new property (SELLER only)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Map<String, Object>> addProperty(
            Authentication authentication,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("propertyType") String propertyType,
            @RequestParam("price") Double price,
            @RequestParam("location") String location,
            @RequestParam("bedrooms") Integer bedrooms,
            @RequestParam("bathrooms") Integer bathrooms,
            @RequestParam(value = "area", required = false) Double area,
            @RequestParam(value = "amenities", required = false) String amenities,
            @RequestParam(value = "images", required = false) List<MultipartFile> images
    ) {
        String username = authentication.getName();
        
        Map<String, Object> propertyData = new HashMap<>();
        propertyData.put("title", title);
        propertyData.put("description", description);
        propertyData.put("propertyType", propertyType);
        propertyData.put("price", price);
        propertyData.put("location", location);
        propertyData.put("bedrooms", bedrooms);
        propertyData.put("bathrooms", bathrooms);
        
        if (area != null) {
            propertyData.put("area", area);
        }
        
        if (amenities != null && !amenities.isEmpty()) {
            propertyData.put("amenities", amenities);
        }
        
        Map<String, Object> response = propertyService.addProperty(username, propertyData, images);
        return ResponseEntity.ok(response);
    }

    /**
     * Update property (with access control)
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateProperty(
            @PathVariable Long id,
            Authentication authentication,
            @RequestBody Map<String, Object> propertyData
    ) {
        String username = authentication.getName();
        String role = getUserRole(authentication);
        Map<String, Object> response = propertyService.updateProperty(id, username, role, propertyData);
        return ResponseEntity.ok(response);
    }

    /**
     * Update property images (with access control)
     */
    @PutMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> updatePropertyImages(
            @PathVariable Long id,
            Authentication authentication,
            @RequestParam("images") List<MultipartFile> images
    ) {
        String username = authentication.getName();
        String role = getUserRole(authentication);
        Map<String, Object> response = propertyService.updatePropertyImages(id, username, role, images);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete property (with access control)
     * Allows both ADMIN and the property owner (SELLER) to delete a property
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<Map<String, Object>> deleteProperty(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String username = authentication.getName();
        String role = getUserRole(authentication);
        Map<String, Object> response = propertyService.deleteProperty(id, username, role);
        return ResponseEntity.ok(response);
    }

    /**
     * Helper method to get user role from authentication
     */
    private String getUserRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
    }
}