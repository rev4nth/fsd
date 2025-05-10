package com.pms.sdp.config;

import com.pms.sdp.model.AppUser;
import com.pms.sdp.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void initAdminUser() {
        // Check if admin user already exists
        if (!userRepository.existsByUsername("admin")) {
            AppUser adminUser = new AppUser();
            adminUser.setUsername("admin");
            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setFullName("System Administrator");
            adminUser.setEmail("admin@propertyms.com");
            adminUser.setRole("ADMIN");
            adminUser.setPhone("1234567890");
            adminUser.setAddress("System Address");
            adminUser.setActive(true);
            adminUser.setCreatedBy("SYSTEM");
            adminUser.setCreatedDate(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            
            userRepository.save(adminUser);
        }
    }
}