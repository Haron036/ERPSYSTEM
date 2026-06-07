package com.ERPSystem.demo.Repositories;

import com.ERPSystem.demo.Entities.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    Optional<SupportTicket> findByTicketNumber(String ticketNumber);
    List<SupportTicket> findByCustomerId(Long customerId);
    List<SupportTicket> findByStatus(SupportTicket.TicketStatus status);
}
