package com.ERPSystem.demo.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "approval_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // What kind of record was acted on
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EntityType entityType;

    @Column(nullable = false)
    private Long entityId;

    @Column(nullable = false)
    private String entityRef;   // e.g. "PO-2845", "SO-10293"

    // Who acted
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", nullable = false)
    private AppUser actor;

    @Enumerated(EnumType.STRING)
    private Action action;      // APPROVED or REJECTED

    private String previousStatus;
    private String newStatus;
    private String comment;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }

    public enum EntityType { PURCHASE_ORDER, SALES_ORDER, LEDGER_ENTRY, LEAVE_REQUEST }
    public enum Action     { APPROVED, REJECTED }
}
