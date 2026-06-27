package com.ERPSystem.demo.Services;

import com.ERPSystem.demo.DTOs.EmployeeDto;
import com.ERPSystem.demo.Entities.AppUser;
import com.ERPSystem.demo.Entities.Employee;
import com.ERPSystem.demo.Exceptions.ConflictException;
import com.ERPSystem.demo.Exceptions.ResourceNotFoundException;
import com.ERPSystem.demo.Repositories.AppUserRepository;
import com.ERPSystem.demo.Repositories.EmployeeRepository;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository repo;
    private final AppUserRepository  userRepo;
    private final PasswordEncoder    encoder;
    private final AtomicLong codeSeq = new AtomicLong(100);

    // ── Seed sequence from DB on startup ──────────────────────────────────────

    @PostConstruct
    void initSeq() {
        repo.findAll().stream()
                .map(Employee::getEmployeeCode)
                .filter(n -> n != null && n.startsWith("EMP-"))
                .mapToLong(n -> {
                    try { return Long.parseLong(n.substring(4)); }
                    catch (NumberFormatException e) { return 0L; }
                })
                .max()
                .ifPresent(codeSeq::set);
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    public List<EmployeeDto.Response> findAll() {
        return repo.findAll().stream().map(this::toResponse).toList();
    }

    public EmployeeDto.Response findById(Long id) {
        return toResponse(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id)));
    }

    // ── Create ────────────────────────────────────────────────────────────────

    @Transactional
    public EmployeeDto.Response create(EmployeeDto.Request req) {
        if (repo.existsByEmail(req.getEmail()))
            throw new ConflictException("Email already in use: " + req.getEmail());

        // 1. Create the Employee record
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
        Employee saved = repo.save(emp);

        // 2. Auto-create a linked AppUser account if one doesn't already exist
        if (!userRepo.existsByEmail(req.getEmail())) {
            String defaultPassword = "rotech@" + code.toLowerCase(); // e.g. rotech@emp-102
            AppUser user = AppUser.builder()
                    .fullName(req.getName())
                    .email(req.getEmail())
                    .password(encoder.encode(defaultPassword))
                    .role(AppUser.Role.VIEWER)
                    .employee(saved)
                    .enabled(true)
                    .build();
            userRepo.save(user);
        }

        return toResponse(saved);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public EmployeeDto.Response update(Long id, EmployeeDto.Request req) {
        Employee emp = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
        emp.setName(req.getName());
        emp.setRole(req.getRole());
        emp.setDepartment(req.getDepartment());
        emp.setEmail(req.getEmail());
        if (req.getStatus() != null)    emp.setStatus(req.getStatus());
        if (req.getJoinedDate() != null) emp.setJoinedDate(req.getJoinedDate());
        return toResponse(repo.save(emp));
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    public void delete(Long id) {
        if (!repo.existsById(id))
            throw new ResourceNotFoundException("Employee not found: " + id);
        repo.deleteById(id);
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

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