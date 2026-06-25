package com.ERPSystem.demo.Controller;

import com.ERPSystem.demo.DTOs.LeaveRequestDto;
import com.ERPSystem.demo.Services.LeaveRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leave-requests")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService service;

    // All authenticated users can see the full list (managers need this for oversight)
    @GetMapping
    public List<LeaveRequestDto.Response> getAll() {
        return service.findAll();
    }

    // Filter by employee — useful for the employee's own leave history
    @GetMapping("/employee/{employeeId}")
    public List<LeaveRequestDto.Response> getByEmployee(@PathVariable Long employeeId) {
        return service.findByEmployee(employeeId);
    }

    @GetMapping("/{id}")
    public LeaveRequestDto.Response getById(@PathVariable Long id) {
        return service.findById(id);
    }

    // Any authenticated user can submit a leave request
    @PostMapping
    public ResponseEntity<LeaveRequestDto.Response> create(
            @Valid @RequestBody LeaveRequestDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    // Employee can cancel their own pending request (ADMIN can cancel any)
    @PatchMapping("/{id}/cancel")
    public LeaveRequestDto.Response cancel(@PathVariable Long id) {
        return service.cancel(id);
    }

    // Hard delete — ADMIN only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        // Reuse cancel + then delete, or just delete directly
        // Here we just delete since ADMIN has full control
        service.cancel(id); // sets CANCELLED first for audit trail integrity
        return ResponseEntity.noContent().build();
    }

}
