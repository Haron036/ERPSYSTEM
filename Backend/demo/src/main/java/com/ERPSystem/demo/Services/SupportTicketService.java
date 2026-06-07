package com.ERPSystem.demo.Services;

import com.ERPSystem.demo.DTOs.SupportTicketDto;
import com.ERPSystem.demo.Entities.Customer;
import com.ERPSystem.demo.Entities.SupportTicket;
import com.ERPSystem.demo.Exceptions.ResourceNotFoundException;
import com.ERPSystem.demo.Repositories.CustomerRepository;
import com.ERPSystem.demo.Repositories.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor

public class SupportTicketService {

    private final SupportTicketRepository repo;
    private final CustomerRepository customerRepo;
    private final AtomicLong seq = new AtomicLong(8830);

    public List<SupportTicketDto.Response> findAll() {
        return repo.findAll().stream().map(this::map).toList();
    }

    public SupportTicketDto.Response create(SupportTicketDto.Request req) {
        Customer c = customerRepo.findById(req.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + req.getCustomerId()));
        SupportTicket t = SupportTicket.builder()
                .ticketNumber("T-" + seq.incrementAndGet())
                .customer(c)
                .subject(req.getSubject())
                .priority(req.getPriority() != null ? req.getPriority() : SupportTicket.Priority.MEDIUM)
                .status(SupportTicket.TicketStatus.OPEN)
                .build();
        return map(repo.save(t));
    }

    public SupportTicketDto.Response updateStatus(Long id, SupportTicket.TicketStatus status) {
        SupportTicket t = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
        t.setStatus(status);
        return map(repo.save(t));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Ticket not found: " + id);
        repo.deleteById(id);
    }

    private SupportTicketDto.Response map(SupportTicket t) {
        return SupportTicketDto.Response.builder()
                .id(t.getId()).ticketNumber(t.getTicketNumber())
                .customerName(t.getCustomer().getName()).subject(t.getSubject())
                .priority(t.getPriority().name()).status(t.getStatus().name())
                .createdAt(t.getCreatedAt()).updatedAt(t.getUpdatedAt()).build();
    }

}
