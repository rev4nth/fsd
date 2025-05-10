package com.pms.sdp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "properties")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Property {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, length = 1000)
    private String description;
    
    @Column(nullable = false)
    private String propertyType; // Apartment, House, Villa, etc.
    
    @Column(nullable = false)
    private Double price;
    
    @Column(nullable = false)
    private String location;
    
    @Column(nullable = false)
    private Integer bedrooms;
    
    @Column(nullable = false)
    private Integer bathrooms;
    
    private Double area; // in square feet/meters
    
    private String amenities; // Comma-separated list or JSON string
    
    // Multiple image URLs stored as comma-separated values
    @Column(length = 2000)
    private String imageUrls;
    
    private Boolean isAvailable = true;
    
    // Reference to the seller who created this property
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private AppUser seller;
    
    // Audit fields
    private String createdBy;
    private String createdDate;
    private String lastModifiedBy;
    private String lastModifiedDate;
}