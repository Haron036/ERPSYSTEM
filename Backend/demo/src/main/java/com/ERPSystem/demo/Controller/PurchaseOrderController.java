package com.ERPSystem.demo.Controller;

import com.ERPSystem.demo.DTOs.PurchaseOrderDto;
import com.ERPSystem.demo.Entities.PurchaseOrder;
import com.ERPSystem.demo.Services.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService service;

    @GetMapping
    public List<PurchaseOrderDto.Response> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public PurchaseOrderDto.Response getById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<PurchaseOrderDto.Response> create(@Valid @RequestBody PurchaseOrderDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public PurchaseOrderDto.Response updateStatus(@PathVariable Long id,
                                                  @RequestParam PurchaseOrder.PoStatus status) {
        return service.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
