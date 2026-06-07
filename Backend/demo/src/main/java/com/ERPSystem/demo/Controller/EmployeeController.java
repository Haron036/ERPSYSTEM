package com.ERPSystem.demo.Controller;

import com.ERPSystem.demo.Services.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.ERPSystem.demo.DTOs.EmployeeDto;
import java.util.List;
@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor

public class EmployeeController {

    private final EmployeeService service;

    @GetMapping
    public List<EmployeeDto.Response> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public EmployeeDto.Response getById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<EmployeeDto.Response> create(@Valid @RequestBody EmployeeDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public EmployeeDto.Response update(@PathVariable Long id, @Valid @RequestBody EmployeeDto.Request req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
