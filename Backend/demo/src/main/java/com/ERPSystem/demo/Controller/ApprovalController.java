package com.ERPSystem.demo.Controller;

import com.ERPSystem.demo.DTOs.ApprovalDto;
import com.ERPSystem.demo.Services.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService service;

    @GetMapping("/pending")
    public ResponseEntity<List<ApprovalDto.PendingItem>> getPending() {
        List<ApprovalDto.PendingItem> pendingItems = service.getAllPending();
        if (pendingItems == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(pendingItems);
    }

    // Only ADMIN or MANAGER can approve
    @PostMapping("/{entityType}/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Void> approve(
            @PathVariable String entityType,
            @PathVariable Long id,
            @RequestBody(required = false) ApprovalDto.DecisionRequest body) {
        service.approve(entityType, id,
                body != null ? body.getComment() : null);
        return ResponseEntity.ok().build();
    }

    // Only ADMIN or MANAGER can reject
    @PostMapping("/{entityType}/{id}/reject")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Void> reject(
            @PathVariable String entityType,
            @PathVariable Long id,
            @RequestBody(required = false) ApprovalDto.DecisionRequest body) {
        service.reject(entityType, id,
                body != null ? body.getComment() : null);
        return ResponseEntity.ok().build();
    }

    // Audit trail for a specific record
    @GetMapping("/log/{entityType}/{entityId}")
    public ResponseEntity<List<ApprovalDto.LogItem>> getLog(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        List<ApprovalDto.LogItem> logs = service.getLog(entityType, entityId);
        return ResponseEntity.ok(logs != null ? logs : List.of());
    }
    
}