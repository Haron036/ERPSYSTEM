package com.ERPSystem.demo.Services;

import com.ERPSystem.demo.Entities.Employee;
import com.ERPSystem.demo.Exceptions.ConflictException;
import com.ERPSystem.demo.Exceptions.ResourceNotFoundException;
import com.ERPSystem.demo.Repositories.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.ERPSystem.demo.DTOs.EmployeeDto;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor

public class EmployeeService {

    private final EmployeeRepository repo;
    private final AtomicLong codeSeq = new AtomicLong(100);

    public List<EmployeeDto.Response> findAll() {
        return repo.findAll().stream().map(this::toResponse).toList();
    }

    public EmployeeDto.Response findById(Long id) {
        return toResponse(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id)));
    }

    public EmployeeDto.Response create(EmployeeDto.Request req) {
        if (repo.existsByEmail(req.getEmail()))
            throw new ConflictException("Email already in use: " + req.getEmail());

        String code = "EMP-" + String.format("%03d", codeSeq.incrementAndGet());
        Employee emp = Employee.builder()
                .employeeCode(code)
                .name(req.getName())
                .role(req.getRole())
                .department(req.getDepartment())
                .email(req.getEmail())
                .status(req.getStatus() != null ? req.getStatus() : Employee.EmployeeStatus.ACTIVE)
                .joinedDate(req.getJoinedDate())
                .build();
        return toResponse(repo.save(emp));
    }

    public EmployeeDto.Response update(Long id, EmployeeDto.Request req) {
        Employee emp = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
        emp.setName(req.getName());
        emp.setRole(req.getRole());
        emp.setDepartment(req.getDepartment());
        emp.setEmail(req.getEmail());
        if (req.getStatus() != null) emp.setStatus(req.getStatus());
        if (req.getJoinedDate() != null) emp.setJoinedDate(req.getJoinedDate());
        return toResponse(repo.save(emp));
    }

    public void delete(Long id) {
        if (!repo.existsById(id))
            throw new ResourceNotFoundException("Employee not found: " + id);
        repo.deleteById(id);
    }

    private EmployeeDto.Response toResponse(Employee e) {
        return EmployeeDto.Response.builder()
                .id(e.getId())
                .employeeCode(e.getEmployeeCode())
                .name(e.getName())
                .role(e.getRole())
                .department(e.getDepartment())
                .email(e.getEmail())
                .status(e.getStatus().name())
                .joinedDate(e.getJoinedDate())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
