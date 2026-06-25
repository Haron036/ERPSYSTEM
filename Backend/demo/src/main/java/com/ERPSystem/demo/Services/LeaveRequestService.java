package com.ERPSystem.demo.Services;

import com.ERPSystem.demo.DTOs.LeaveRequestDto;
import com.ERPSystem.demo.Entities.Employee;
import com.ERPSystem.demo.Entities.LeaveRequest;
import com.ERPSystem.demo.Exceptions.ResourceNotFoundException;
import com.ERPSystem.demo.Repositories.AppUserRepository;
import com.ERPSystem.demo.Repositories.EmployeeRepository;
import com.ERPSystem.demo.Repositories.LeaveRequestRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRepo;
    private final EmployeeRepository     employeeRepo;
    private final AppUserRepository      userRepo;
    private final EmailService           emailService;

    // Auto-increment seeded from DB on startup (same pattern as PurchaseOrderService)
    private final AtomicLong codeSeq = new AtomicLong(0);

    @PostConstruct
    void initSeq() {
        leaveRepo.findAll().stream()
                .map(LeaveRequest::getLeaveNumber)
                .filter(n -> n != null && n.startsWith("LV-"))
                .mapToLong(n -> {
                    try { return Long.parseLong(n.substring(3)); }
                    catch (NumberFormatException e) { return 0L; }
                })
                .max()
                .ifPresentOrElse(codeSeq::set, () -> codeSeq.set(0));
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    public List<LeaveRequestDto.Response> findAll() {
        return leaveRepo.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    public List<LeaveRequestDto.Response> findByEmployee(Long employeeId) {
        return leaveRepo.findByEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream().map(this::toResponse).toList();
    }

    public LeaveRequestDto.Response findById(Long id) {
        return toResponse(leaveRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found: " + id)));
    }

    // ── Create ────────────────────────────────────────────────────────────────

    public LeaveRequestDto.Response create(LeaveRequestDto.Request req) {
        Employee employee = employeeRepo.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee not found: " + req.getEmployeeId()));

        LeaveRequest lr = LeaveRequest.builder()
                .leaveNumber("LV-" + String.format("%04d", codeSeq.incrementAndGet()))
                .employee(employee)
                .leaveType(LeaveRequest.LeaveType.valueOf(req.getLeaveType()))
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .reason(req.getReason())
                .status(LeaveRequest.LeaveStatus.PENDING_APPROVAL)
                .build();

        LeaveRequest saved = leaveRepo.save(lr);

        // Notify approvers that a new leave request needs action
        // Finds all ADMIN/MANAGER users and emails them
        userRepo.findAll().stream()
                .filter(u -> u.getRole() != null &&
                        (u.getRole().name().equals("ADMIN") || u.getRole().name().equals("MANAGER")))
                .forEach(approver ->
                        emailService.notifyApproversOfPending(
                                approver.getEmail(),
                                approver.getFullName(),
                                saved.getLeaveNumber(),
                                req.getLeaveType().charAt(0) +
                                        req.getLeaveType().substring(1).toLowerCase() + " Leave",
                                employee.getName()
                        )
                );

        return toResponse(saved);
    }

    // ── Cancel ────────────────────────────────────────────────────────────────

    public LeaveRequestDto.Response cancel(Long id) {
        LeaveRequest lr = leaveRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found: " + id));

        if (lr.getStatus() != LeaveRequest.LeaveStatus.PENDING_APPROVAL) {
            throw new IllegalStateException(
                    "Only PENDING_APPROVAL requests can be cancelled. Current: " + lr.getStatus());
        }

        lr.setStatus(LeaveRequest.LeaveStatus.CANCELLED);
        return toResponse(leaveRepo.save(lr));
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private LeaveRequestDto.Response toResponse(LeaveRequest lr) {
        int days = (lr.getStartDate() != null && lr.getEndDate() != null)
                ? (int) ChronoUnit.DAYS.between(lr.getStartDate(), lr.getEndDate()) + 1
                : 0;

        Employee emp = lr.getEmployee();
        return LeaveRequestDto.Response.builder()
                .id(lr.getId())
                .leaveNumber(lr.getLeaveNumber())
                .employeeId(emp != null ? emp.getId() : null)
                .employeeName(emp != null ? emp.getName() : "—")
                .employeeEmail(emp != null ? emp.getEmail() : null)
                .department(emp != null ? emp.getDepartment() : null)
                .leaveType(lr.getLeaveType() != null ? lr.getLeaveType().name() : null)
                .startDate(lr.getStartDate())
                .endDate(lr.getEndDate())
                .daysRequested(days)
                .reason(lr.getReason())
                .status(lr.getStatus() != null ? lr.getStatus().name() : null)
                .createdAt(lr.getCreatedAt())
                .build();
    }
}