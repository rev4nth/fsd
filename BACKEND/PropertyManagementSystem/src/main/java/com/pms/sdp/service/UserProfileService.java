package com.pms.sdp.service;

import com.pms.sdp.model.AppUser;
import com.pms.sdp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileService {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    public Map<String, Object> getUserProfile(String username) {
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Map<String, Object> userProfile = new HashMap<>();
        userProfile.put("username", user.getUsername());
        userProfile.put("fullName", user.getFullName());
        userProfile.put("email", user.getEmail());
        userProfile.put("role", user.getRole());
        userProfile.put("phone", user.getPhone());
        userProfile.put("address", user.getAddress());
        userProfile.put("profileImageUrl", user.getProfileImageUrl());

        return userProfile;
    }

    public Map<String, Object> updateProfileImage(String username, MultipartFile profileImage) {
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Map<String, Object> response = new HashMap<>();

        // Delete old image if exists
        if (user.getProfileImageUrl() != null && !user.getProfileImageUrl().isEmpty()) {
            cloudinaryService.deleteImage(user.getProfileImageUrl());
        }

        // Upload new image
        String imageUrl = cloudinaryService.uploadImage(profileImage);
        if (imageUrl != null) {
            user.setProfileImageUrl(imageUrl);
            user.setLastModifiedBy(username);
            user.setLastModifiedDate(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            
            userRepository.save(user);
            
            response.put("success", true);
            response.put("message", "Profile image updated successfully");
            response.put("profileImageUrl", imageUrl);
        } else {
            response.put("success", false);
            response.put("message", "Failed to update profile image");
        }

        return response;
    }

    public Map<String, Object> updateUserProfile(String username, Map<String, Object> profileData) {
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Map<String, Object> response = new HashMap<>();

        // Update user profile fields
        if (profileData.containsKey("fullName")) {
            user.setFullName((String) profileData.get("fullName"));
        }
        
        if (profileData.containsKey("email")) {
            String newEmail = (String) profileData.get("email");
            if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                response.put("success", false);
                response.put("message", "Email already exists");
                return response;
            }
            user.setEmail(newEmail);
        }
        
        if (profileData.containsKey("phone")) {
            user.setPhone((String) profileData.get("phone"));
        }
        
        if (profileData.containsKey("address")) {
            user.setAddress((String) profileData.get("address"));
        }

        user.setLastModifiedBy(username);
        user.setLastModifiedDate(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        
        userRepository.save(user);
        
        response.put("success", true);
        response.put("message", "Profile updated successfully");

        return response;
    }
}