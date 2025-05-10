package com.pms.sdp.controller;

import com.pms.sdp.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserProfile(Authentication authentication) {
        String username = authentication.getName();
        Map<String, Object> profile = userProfileService.getUserProfile(username);
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> updateUserProfile(
            Authentication authentication,
            @RequestBody Map<String, Object> profileData
    ) {
        String username = authentication.getName();
        Map<String, Object> response = userProfileService.updateUserProfile(username, profileData);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> updateProfileImage(
            Authentication authentication,
            @RequestParam("profileImage") MultipartFile profileImage
    ) {
        String username = authentication.getName();
        Map<String, Object> response = userProfileService.updateProfileImage(username, profileImage);
        return ResponseEntity.ok(response);
    }
}