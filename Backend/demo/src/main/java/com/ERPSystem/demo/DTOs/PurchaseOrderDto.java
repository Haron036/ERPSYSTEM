package com.ERPSystem.demo.DTOs;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PurchaseOrderDto {
    @Getter
    @Setter
    public static class Request {
        @NotNull
        private Long supplierId;
        @NotNull
        private LocalDate orderDate;
        @Positive
        private BigDecimal total;
        private String notes;
    }

    @Getter @Setter @Builder
    public static class Response {
        private Long id;
        private String poNumber;
        private String supplierName;
        private LocalDate orderDate;
        private BigDecimal total;
        private String status;
        private LocalDateTime createdAt;
    }

}
