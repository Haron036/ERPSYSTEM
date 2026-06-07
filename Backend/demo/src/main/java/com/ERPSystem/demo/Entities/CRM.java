package com.ERPSystem.demo.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "CRM")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class CRM {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String leadCode;   // e.g. L-501

    @NotBlank
    @Column(nullable = false)
    private String companyName;

    @Enumerated(EnumType.STRING)
    private LeadSource source;

    @Enumerated(EnumType.STRING)
    private LeadStage stage = LeadStage.DISCOVERY;

    @Column(precision = 15, scale = 2)
    private BigDecimal estimatedValue;

    private String ownerName;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist  void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate   void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum LeadSource { INBOUND, OUTBOUND, REFERRAL, TRADE_SHOW, WEBINAR }
    public enum LeadStage  { DISCOVERY, QUALIFIED, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST }
}
