package com.ERPSystem.demo.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String leaveNumber;   // e.g. LV-0001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    private LeaveType leaveType = LeaveType.ANNUAL;

    private LocalDate startDate;
    private LocalDate endDate;

    private String reason;

    @Enumerated(EnumType.STRING)
    private LeaveStatus status = LeaveStatus.PENDING_APPROVAL;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate  void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum LeaveType   { ANNUAL, SICK, MATERNITY, PATERNITY, UNPAID }
    public enum LeaveStatus { PENDING_APPROVAL, APPROVED, REJECTED, CANCELLED }
}
