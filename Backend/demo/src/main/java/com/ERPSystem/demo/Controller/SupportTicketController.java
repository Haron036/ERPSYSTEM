package com.ERPSystem.demo.Controller;

import com.ERPSystem.demo.DTOs.SupportTicketDto;
import com.ERPSystem.demo.Entities.SupportTicket;
import com.ERPSystem.demo.Services.SupportTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class SupportTicketController {
    private final SupportTicketService service;

    @GetMapping
    public List<SupportTicketDto.Response> getAll() { return service.findAll(); }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<SupportTicketDto.Response> create(@Valid @RequestBody SupportTicketDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public SupportTicketDto.Response updateStatus(@PathVariable Long id,
                                                  @RequestParam SupportTicket.TicketStatus status) {
        return service.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
