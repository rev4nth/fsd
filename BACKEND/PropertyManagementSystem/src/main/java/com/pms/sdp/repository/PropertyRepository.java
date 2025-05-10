package com.pms.sdp.repository;

import com.pms.sdp.model.AppUser;
import com.pms.sdp.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    
    // Find all properties by seller
    List<Property> findBySeller(AppUser seller);
    
    // Find all properties by seller's username
    List<Property> findBySellerUsername(String username);
    
    // Find all available properties
    List<Property> findByIsAvailableTrue();
    
    // Find available properties by seller
    List<Property> findBySellerAndIsAvailableTrue(AppUser seller);
    
    // Additional queries like finding properties by type, location, price range, etc.
    List<Property> findByPropertyType(String propertyType);
    List<Property> findByLocation(String location);
    List<Property> findByPriceBetween(Double minPrice, Double maxPrice);
    List<Property> findByBedroomsGreaterThanEqual(Integer bedrooms);
    List<Property> findByBathroomsGreaterThanEqual(Integer bathrooms);
}