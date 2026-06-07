package com.ERPSystem.demo.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ledger_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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

    private String reference;   // e.g. INV-10295
    private String memo;

    @Enumerated(EnumType.STRING)
    private EntryType entryType;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist  void onCreate() { createdAt = LocalDateTime.now(); }

    public enum EntryType { REVENUE, EXPENSE, TRANSFER, JOURNAL }
}
