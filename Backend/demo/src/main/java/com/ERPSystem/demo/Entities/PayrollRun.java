package com.ERPSystem.demo.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "payroll_runs",
        uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "year", "month"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private int year;

    @Column(nullable = false)
    private int month;  // 1–12

    // ── Earnings ──────────────────────────────────────────────────────────────
    @Column(precision = 12, scale = 2)
    private BigDecimal basicSalary;

    @Column(precision = 12, scale = 2)
    private BigDecimal houseAllowance;

    @Column(precision = 12, scale = 2)
    private BigDecimal transportAllowance;

    @Column(precision = 12, scale = 2)
    private BigDecimal otherAllowances;

    @Column(precision = 12, scale = 2)
    private BigDecimal grossSalary;          // basic + all allowances

    // ── Statutory deductions ─────────────────────────────────────────────────
    @Column(precision = 12, scale = 2)
    private BigDecimal nssfEmployee;         // employee NSSF contribution

    @Column(precision = 12, scale = 2)
    private BigDecimal nssfEmployer;         // employer NSSF contribution (cost)

    @Column(precision = 12, scale = 2)
    private BigDecimal nhif;                 // NHIF / SHIF deduction

    @Column(precision = 12, scale = 2)
    private BigDecimal payeTax;              // PAYE after personal relief

    @Column(precision = 12, scale = 2)
    private BigDecimal housingLevy;          // 1.5% of gross

    @Column(precision = 12, scale = 2)
    private BigDecimal helbDeduction;

    @Column(precision = 12, scale = 2)
    private BigDecimal otherDeductions;

    @Column(precision = 12, scale = 2)
    private BigDecimal totalDeductions;      // sum of all employee deductions

    @Column(precision = 12, scale = 2)
    private BigDecimal netPay;               // gross - total deductions

    // ── Employer cost ────────────────────────────────────────────────────────
    @Column(precision = 12, scale = 2)
    private BigDecimal totalEmployerCost;    // net + employer NSSF + employer housing levy

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PayrollStatus status = PayrollStatus.DRAFT;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate  void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum PayrollStatus { DRAFT, APPROVED, PAID }

}
