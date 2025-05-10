package com.pms.sdp.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pms.sdp.service.PaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Map<String, Object>> createOrder(
            @RequestParam Double amount,
            @RequestParam(defaultValue = "INR") String currency
    ) {
        try {
            Map<String, Object> order = paymentService.createOrder(amount, currency);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to create order");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @RequestParam String orderId,
            @RequestParam String paymentId,
            @RequestParam String signature
    ) {
        boolean isValid = paymentService.verifyPayment(orderId, paymentId, signature);
        
        Map<String, Object> response = new HashMap<>();
        if (isValid) {
            response.put("status", "success");
            response.put("message", "Payment verified successfully");
        } else {
            response.put("status", "error");
            response.put("message", "Payment verification failed");
        }
        
        return ResponseEntity.ok(response);
    }

    // Test endpoint to simulate payment
    @PostMapping("/test-payment")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<Map<String, Object>> testPayment(
            @RequestParam String orderId
    ) {
        try {
            // Generate test payment ID and signature
            String testPaymentId = "pay_test_" + System.currentTimeMillis();
            String testSignature = "test_signature_" + System.currentTimeMillis();
            
            // Verify the payment
            boolean isValid = paymentService.verifyPayment(orderId, testPaymentId, testSignature);
            
            Map<String, Object> response = new HashMap<>();
            if (isValid) {
                response.put("status", "success");
                response.put("message", "Test payment verified successfully");
                response.put("paymentId", testPaymentId);
                response.put("signature", testSignature);
            } else {
                response.put("status", "error");
                response.put("message", "Test payment verification failed");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to process test payment");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
} 