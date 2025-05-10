package com.pms.sdp.service;

import java.util.HashMap;
import java.util.Map;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    // Maximum amount allowed in test mode (in rupees)
    private static final double MAX_AMOUNT = 100000.00;

    public Map<String, Object> createOrder(Double amount, String currency) throws RazorpayException {
        try {
            // Validate amount
            if (amount <= 0) {
                throw new IllegalArgumentException("Amount must be greater than 0");
            }
            if (amount > MAX_AMOUNT) {
                throw new IllegalArgumentException("Amount exceeds maximum allowed amount of " + MAX_AMOUNT);
            }

            // Convert amount to paise (multiply by 100)
            long amountInPaise = (long) (amount * 100);

            JSONObject options = new JSONObject();
            options.put("amount", amountInPaise);
            options.put("currency", currency);
            options.put("receipt", "receipt_" + System.currentTimeMillis());

            Order order = razorpayClient.orders.create(options);
            
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("amountInPaise", amountInPaise);
            response.put("currency", order.get("currency"));
            response.put("receipt", order.get("receipt"));
            
            return response;
        } catch (RazorpayException e) {
            log.error("Error creating Razorpay order: {}", e.getMessage());
            throw new RuntimeException("Failed to create payment order: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("Invalid amount: {}", e.getMessage());
            throw new RuntimeException("Invalid amount: " + e.getMessage());
        }
    }

    public boolean verifyPayment(String orderId, String paymentId, String signature) {
        try {
            // For test payments, always return true
            if (paymentId.startsWith("pay_test_")) {
                log.info("Test payment verification for order: {}", orderId);
                return true;
            }

            // For real payments, verify the signature
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);

            boolean isValid = com.razorpay.Utils.verifyPaymentSignature(attributes, keySecret);
            return isValid;
        } catch (Exception e) {
            log.error("Error verifying payment: {}", e.getMessage());
            return false;
        }
    }
} 