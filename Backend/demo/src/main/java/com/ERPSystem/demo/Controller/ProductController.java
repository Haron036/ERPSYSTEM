package com.ERPSystem.demo.Controller;

import com.ERPSystem.demo.DTOs.ProductDto;
import com.ERPSystem.demo.Services.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor

public class ProductController {

    private final ProductService service;

    @GetMapping
    public List<ProductDto.Response> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public ProductDto.Response getById(@PathVariable Long id) { return service.findById(id); }

    @GetMapping("/sku/{sku}")
    public ProductDto.Response getBySku(@PathVariable String sku) { return service.findBySku(sku); }

    @GetMapping("/low-stock")
    public List<ProductDto.Response> getLowStock() { return service.findLowStock(); }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ProductDto.Response> create(@Valid @RequestBody ProductDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ProductDto.Response update(@PathVariable Long id, @Valid @RequestBody ProductDto.Request req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

}
