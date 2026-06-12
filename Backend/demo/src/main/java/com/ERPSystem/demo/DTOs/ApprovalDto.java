package com.ERPSystem.demo.DTOs;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ApprovalDto {
    // Request body for approve/reject
    @Getter
    @Setter
    public static class DecisionRequest {
        private String comment;   // optional comment
    }

    // One item in the pending queue
    @Getter @Setter @Builder
    public static class PendingItem {
        private Long   id;
        private String entityType;   // "PURCHASE_ORDER" etc.
        private String ref;          // "PO-2845"
        private String submittedBy;  // supplier / customer / employee name
        private String description;
        private BigDecimal amount;
        private LocalDate date;
        private String status;
        private LocalDateTime createdAt;
    }

    // One entry in the audit log
    @Getter @Setter @Builder
    public static class LogItem {
        private Long   id;
        private String entityType;
        private String entityRef;
        private String actor;
        private String action;
        private String previousStatus;
        private String newStatus;
        private String comment;
        private LocalDateTime createdAt;
    }
}
