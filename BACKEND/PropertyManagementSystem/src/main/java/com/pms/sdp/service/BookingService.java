package com.pms.sdp.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pms.sdp.exception.AccessDeniedException;
import com.pms.sdp.exception.ResourceNotFoundException;
import com.pms.sdp.model.AppUser;
import com.pms.sdp.model.Booking;
import com.pms.sdp.model.Property;
import com.pms.sdp.repository.BookingRepository;
import com.pms.sdp.repository.PropertyRepository;
import com.pms.sdp.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PaymentService paymentService;

    /**
     * Create a new booking
     */
    @Transactional
    public Map<String, Object> createBooking(String username, Long propertyId, Map<String, Object> bookingData) {
        AppUser buyer = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
        
        // Check if property is available
        if (!property.getIsAvailable()) {
            throw new IllegalStateException("Property is not available for booking");
        }

        // Validate property price
        if (property.getPrice() == null || property.getPrice() <= 0) {
            throw new IllegalStateException("Invalid property price");
        }
        
        Booking booking = new Booking();
        booking.setProperty(property);
        booking.setBuyer(buyer);
        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setAmount(property.getPrice());
        booking.setBookingDate(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        
        // Create Razorpay order
        try {
            Map<String, Object> order = paymentService.createOrder(property.getPrice(), "INR");
            booking.setTransactionId(order.get("orderId").toString());
        } catch (Exception e) {
            throw new RuntimeException("Failed to create payment order: " + e.getMessage());
        }
        
        // Set audit fields
        booking.setCreatedBy(username);
        booking.setCreatedDate(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        
        Booking savedBooking = bookingRepository.save(booking);
        
        // If booking is successful, mark property as unavailable
        property.setIsAvailable(false);
        propertyRepository.save(property);
        
        // Send email notifications asynchronously
        emailService.sendBookingConfirmationToBuyer(buyer.getEmail(), property.getTitle(), booking.getAmount());
        emailService.sendBookingNotificationToSeller(property.getSeller().getEmail(), 
                property.getTitle(), buyer.getFullName(), booking.getAmount());
        
        return convertBookingToDto(savedBooking);
    }

    /**
     * Update booking status
     */
    @Transactional
    public Map<String, Object> updateBookingStatus(String username, Long bookingId, String status, String paymentId, String signature) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        
        // Check if user has permission to update this booking
        if (!booking.getBuyer().getUsername().equals(username) && 
            !booking.getProperty().getSeller().getUsername().equals(username)) {
            throw new AccessDeniedException("You don't have permission to update this booking");
        }
        
        // Update booking status
        try {
            Booking.BookingStatus newStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
            
            // If status is CONFIRMED, verify payment
            if (newStatus == Booking.BookingStatus.CONFIRMED && paymentId != null && signature != null) {
                boolean isPaymentValid = paymentService.verifyPayment(
                    booking.getTransactionId(),
                    paymentId,
                    signature
                );
                
                if (!isPaymentValid) {
                    throw new IllegalStateException("Payment verification failed");
                }
                
                // Update payment details
                booking.setPaymentId(paymentId);
                booking.setPaymentSignature(signature);
            }
            
            booking.setStatus(newStatus);
            
            // If booking is cancelled, make property available again
            if (newStatus == Booking.BookingStatus.CANCELLED) {
                Property property = booking.getProperty();
                property.setIsAvailable(true);
                propertyRepository.save(property);
            }
            
            // Set audit fields
            booking.setLastModifiedBy(username);
            booking.setLastModifiedDate(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            
            Booking updatedBooking = bookingRepository.save(booking);
            
            // Send notifications based on status changes
            sendStatusUpdateNotifications(updatedBooking);
            
            return convertBookingToDto(updatedBooking);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid booking status: " + status);
        }
    }

    /**
     * Cancel a booking
     */
    @Transactional
    public Map<String, Object> cancelBooking(String username, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        
        // Check if user has permission to cancel this booking
        if (!booking.getBuyer().getUsername().equals(username)) {
            throw new AccessDeniedException("Only the buyer can cancel this booking");
        }
        
        // Check if booking is already cancelled or completed
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled");
        }
        
        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel a completed booking");
        }
        
        // Set status to CANCELLED
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        
        // Make property available again
        Property property = booking.getProperty();
        property.setIsAvailable(true);
        propertyRepository.save(property);
        
        // Set audit fields
        booking.setLastModifiedBy(username);
        booking.setLastModifiedDate(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        
        Booking updatedBooking = bookingRepository.save(booking);
        
        // Send notifications
        sendStatusUpdateNotifications(updatedBooking);
        
        return convertBookingToDto(updatedBooking);
    }

    /**
     * Get booking by id (with access control)
     */
    public Map<String, Object> getBookingById(String username, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        
        // Check if user has permission to view this booking
        if (!booking.getBuyer().getUsername().equals(username) && 
            !booking.getProperty().getSeller().getUsername().equals(username)) {
            throw new AccessDeniedException("You don't have permission to view this booking");
        }
        
        return convertBookingToDto(booking);
    }

    /**
     * Get bookings for a buyer
     */
    public List<Map<String, Object>> getBuyerBookings(String username) {
        AppUser buyer = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        List<Booking> bookings = bookingRepository.findByBuyer(buyer);
        return convertBookingsToDtoList(bookings);
    }

    /**
     * Get bookings for a seller's properties
     */
    public List<Map<String, Object>> getSellerBookings(String username) {
        AppUser seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        List<Booking> bookings = bookingRepository.findByPropertySeller(seller);
        return convertBookingsToDtoList(bookings);
    }

    /**
     * Private helper method to send notifications based on status changes
     */
    private void sendStatusUpdateNotifications(Booking booking) {
        String buyerEmail = booking.getBuyer().getEmail();
        String sellerEmail = booking.getProperty().getSeller().getEmail();
        String propertyTitle = booking.getProperty().getTitle();
        
        switch (booking.getStatus()) {
            case CONFIRMED:
                emailService.sendBookingStatusUpdateToBuyer(buyerEmail, propertyTitle, "confirmed");
                emailService.sendBookingStatusUpdateToSeller(sellerEmail, propertyTitle, "confirmed");
                break;
            case CANCELLED:
                emailService.sendBookingStatusUpdateToBuyer(buyerEmail, propertyTitle, "cancelled");
                emailService.sendBookingStatusUpdateToSeller(sellerEmail, propertyTitle, "cancelled");
                break;
            case COMPLETED:
                emailService.sendBookingStatusUpdateToBuyer(buyerEmail, propertyTitle, "completed");
                emailService.sendBookingStatusUpdateToSeller(sellerEmail, propertyTitle, "completed");
                break;
            default:
                break;
        }
    }

    /**
     * Helper method to convert Booking entity to DTO
     */
    private Map<String, Object> convertBookingToDto(Booking booking) {
        Map<String, Object> bookingDto = new HashMap<>();
        bookingDto.put("id", booking.getId());
        bookingDto.put("propertyId", booking.getProperty().getId());
        bookingDto.put("propertyTitle", booking.getProperty().getTitle());
        bookingDto.put("propertyLocation", booking.getProperty().getLocation());
        bookingDto.put("buyerUsername", booking.getBuyer().getUsername());
        bookingDto.put("buyerFullName", booking.getBuyer().getFullName());
        bookingDto.put("sellerUsername", booking.getProperty().getSeller().getUsername());
        bookingDto.put("sellerFullName", booking.getProperty().getSeller().getFullName());
        bookingDto.put("status", booking.getStatus().toString());
        bookingDto.put("amount", booking.getAmount());
        bookingDto.put("transactionId", booking.getTransactionId());
        bookingDto.put("bookingDate", booking.getBookingDate());
        bookingDto.put("createdDate", booking.getCreatedDate());
        
        return bookingDto;
    }

    /**
     * Helper method to convert a list of Booking entities to DTOs
     */
    private List<Map<String, Object>> convertBookingsToDtoList(List<Booking> bookings) {
        return bookings.stream()
                .map(this::convertBookingToDto)
                .collect(Collectors.toList());
    }
}