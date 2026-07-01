package com.ERPSystem.demo.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "salary_structures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class SalaryStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false, unique = true)
    private Employee employee;

    // ── Earnings ──────────────────────────────────────────────────────────────
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal basicSalary;          // pensionable pay

    @Builder.Default
    @Column(precision = 12, scale = 2)
    private BigDecimal houseAllowance = BigDecimal.ZERO;

    @Builder.Default
    @Column(precision = 12, scale = 2)
    private BigDecimal transportAllowance = BigDecimal.ZERO;

    @Builder.Default
    @Column(precision = 12, scale = 2)
    private BigDecimal otherAllowances = BigDecimal.ZERO;

    // ── Optional deductions set by admin ─────────────────────────────────────
    @Builder.Default
    @Column(precision = 12, scale = 2)
    private BigDecimal helbDeduction = BigDecimal.ZERO;   // monthly HELB repayment

    @Builder.Default
    @Column(precision = 12, scale = 2)
    private BigDecimal otherDeductions = BigDecimal.ZERO; // any other fixed deduction

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate  void onUpdate() { updatedAt = LocalDateTime.now(); }

}
