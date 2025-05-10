package com.pms.sdp.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return null;
            }

            // Generate a unique public ID for the image
            String publicId = "pms/profile/" + UUID.randomUUID().toString();

            // Upload parameters
            Map<String, Object> params = ObjectUtils.asMap(
                    "public_id", publicId,
                    "overwrite", true,
                    "resource_type", "auto",
                    "folder", "property_management_system"
            );

            // Upload file to Cloudinary
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
            
            // Get secure URL of the uploaded image
            String imageUrl = (String) uploadResult.get("secure_url");
            log.info("Image uploaded successfully to Cloudinary. URL: {}", imageUrl);
            
            return imageUrl;
            
        } catch (IOException e) {
            log.error("Error uploading image to Cloudinary", e);
            return null;
        }
    }

    public boolean deleteImage(String publicId) {
        try {
            if (publicId == null || publicId.isEmpty()) {
                return false;
            }

            // Extract public ID from the URL
            if (publicId.contains("/")) {
                String[] parts = publicId.split("/");
                publicId = parts[parts.length - 1].split("\\.")[0];
            }

            // Delete image from Cloudinary
            Map<?, ?> deleteResult = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            String result = (String) deleteResult.get("result");
            
            return "ok".equals(result);
            
        } catch (IOException e) {
            log.error("Error deleting image from Cloudinary", e);
            return false;
        }
    }
}