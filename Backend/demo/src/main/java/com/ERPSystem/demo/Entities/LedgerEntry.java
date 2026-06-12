package com.ERPSystem.demo.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ledger_entries")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LedgerEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate entryDate;

    @NotBlank
    private String account;

    @Column(precision = 15, scale = 2)
    private BigDecimal debit  = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal credit = BigDecimal.ZERO;

    private String reference;
    private String memo;

    @Enumerated(EnumType.STRING)
    private EntryType entryType;

    // ── 🛠️ FIXED: Added columnDefinition to backfill existing records on Render ──
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            columnDefinition = "varchar(255) default 'PENDING_APPROVAL'"
    )
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING_APPROVAL;

    private String submittedByEmail;
    private String submittedByName;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate  void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum EntryType      { REVENUE, EXPENSE, TRANSFER, JOURNAL }
    public enum ApprovalStatus { PENDING_APPROVAL, APPROVED, REJECTED }
}