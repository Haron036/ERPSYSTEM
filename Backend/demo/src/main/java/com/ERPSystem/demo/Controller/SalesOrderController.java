package com.ERPSystem.demo.Controller;

import com.ERPSystem.demo.DTOs.SalesOrderDto;
import com.ERPSystem.demo.Entities.SalesOrder;
import com.ERPSystem.demo.Services.SalesOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales-orders")
@RequiredArgsConstructor
public class SalesOrderController {
    private final SalesOrderService service;

    @GetMapping
    public List<SalesOrderDto.Response> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public SalesOrderDto.Response getById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<SalesOrderDto.Response> create(@Valid @RequestBody SalesOrderDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public SalesOrderDto.Response updateStatus(@PathVariable Long id,
                                               @RequestParam SalesOrder.OrderStatus status) {
        return service.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
