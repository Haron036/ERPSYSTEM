package com.ERPSystem.demo.DTOs;

import com.ERPSystem.demo.Entities.CRM;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CRMDto {
    @Getter
    @Setter
    public static class Request {
        @NotBlank
        private String companyName;
        private CRM.LeadSource source;
        private CRM.LeadStage stage;
        @Positive
        private BigDecimal estimatedValue;
        private String ownerName;
    }

    @Getter @Setter @Builder
    public static class Response {
        private Long id;
        private String leadCode;
        private String companyName;
        private String source;
        private String stage;
        private BigDecimal estimatedValue;
        private String ownerName;
        private LocalDateTime createdAt;
    }

}
