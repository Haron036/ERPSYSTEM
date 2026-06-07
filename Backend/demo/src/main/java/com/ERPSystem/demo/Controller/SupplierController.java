package com.ERPSystem.demo.Controller;

import com.ERPSystem.demo.DTOs.SupplierDto;
import com.ERPSystem.demo.Services.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor

public class SupplierController {
    private final SupplierService service;

    @GetMapping
    public List<SupplierDto.Response> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public SupplierDto.Response getById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<SupplierDto.Response> create(@Valid @RequestBody SupplierDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public SupplierDto.Response update(@PathVariable Long id, @Valid @RequestBody SupplierDto.Request req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
