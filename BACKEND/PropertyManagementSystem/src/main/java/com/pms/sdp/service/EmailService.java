package com.pms.sdp.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${application.name:RevStay}")
    private String applicationName;
    
    /**
     * Sends a welcome email to newly registered users
     * @param toEmail recipient email address
     * @param fullName recipient full name
     * @param username recipient username
     */
    @Async
    public void sendWelcomeEmail(String toEmail, String fullName, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, applicationName);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to RevStay!");
            
            // Prepare the evaluation context for the template
            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("username", username);
            
            // Process the template and send the email
            String emailContent = templateEngine.process("welcome", context);
            helper.setText(emailContent, true);
            
            mailSender.send(message);
            log.info("Welcome email sent successfully to: {}", toEmail);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send welcome email to: {}", toEmail, e);
        }
    }
    
    /**
     * Send booking confirmation email to buyer
     */
    @Async
    public void sendBookingConfirmationToBuyer(String buyerEmail, String propertyTitle, Double amount) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, applicationName);
            helper.setTo(buyerEmail);
            helper.setSubject("Booking Confirmation: " + propertyTitle);
            
            Context context = new Context();
            context.setVariable("propertyTitle", propertyTitle);
            context.setVariable("amount", amount);
            
            String emailContent = templateEngine.process("booking-confirmation", context);
            helper.setText(emailContent, true);
            
            mailSender.send(message);
            log.info("Booking confirmation email sent successfully to: {}", buyerEmail);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send booking confirmation email to: {}", buyerEmail, e);
        }
    }

    /**
     * Send booking notification email to seller
     */
    @Async
    public void sendBookingNotificationToSeller(String sellerEmail, String propertyTitle, String buyerName, Double amount) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, applicationName);
            helper.setTo(sellerEmail);
            helper.setSubject("New Booking Notification: " + propertyTitle);
            
            Context context = new Context();
            context.setVariable("propertyTitle", propertyTitle);
            context.setVariable("buyerName", buyerName);
            context.setVariable("amount", amount);
            
            String emailContent = templateEngine.process("booking-notification", context);
            helper.setText(emailContent, true);
            
            mailSender.send(message);
            log.info("Booking notification email sent successfully to seller: {}", sellerEmail);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send booking notification email to seller: {}", sellerEmail, e);
        }
    }

    /**
     * Send booking status update email to buyer
     */
    @Async
    public void sendBookingStatusUpdateToBuyer(String buyerEmail, String propertyTitle, String status) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, applicationName);
            helper.setTo(buyerEmail);
            helper.setSubject("Booking Status Update: " + propertyTitle);
            
            Context context = new Context();
            context.setVariable("propertyTitle", propertyTitle);
            context.setVariable("status", status);
            
            String emailContent = templateEngine.process("booking-status-update", context);
            helper.setText(emailContent, true);
            
            mailSender.send(message);
            log.info("Booking status update email sent successfully to buyer: {}", buyerEmail);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send booking status update email to buyer: {}", buyerEmail, e);
        }
    }

    /**
     * Send booking status update email to seller
     */
    @Async
    public void sendBookingStatusUpdateToSeller(String sellerEmail, String propertyTitle, String status) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, applicationName);
            helper.setTo(sellerEmail);
            helper.setSubject("Booking Status Update: " + propertyTitle);
            
            Context context = new Context();
            context.setVariable("propertyTitle", propertyTitle);
            context.setVariable("status", status);
            
            String emailContent = templateEngine.process("booking-status-update-seller", context);
            helper.setText(emailContent, true);
            
            mailSender.send(message);
            log.info("Booking status update email sent successfully to seller: {}", sellerEmail);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send booking status update email to seller: {}", sellerEmail, e);
        }
    }
}