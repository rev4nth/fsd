package com.pms.sdp.repository;

import com.pms.sdp.model.AppUser;
import com.pms.sdp.model.Booking;
import com.pms.sdp.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByBuyer(AppUser buyer);
    List<Booking> findByProperty(Property property);
    List<Booking> findByPropertySeller(AppUser seller);
}