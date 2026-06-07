package com.ERPSystem.demo.DTOs;

import com.ERPSystem.demo.Entities.SalesOrder;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class SalesOrderDto {
    @Getter
    @Setter
    public static class Request {
        @NotNull
        private Long customerId;
        @NotNull private LocalDate orderDate;
        @Positive
        private BigDecimal total;
        private SalesOrder.OrderStatus status;
        private SalesOrder.PaymentStatus paymentStatus;
        private String notes;
    }

    @Getter @Setter @Builder
    public static class Response {
        private Long id;
        private String orderNumber;
        private String customerName;
        private LocalDate orderDate;
        private BigDecimal total;
        private String status;
        private String paymentStatus;
        private LocalDateTime createdAt;
    }
}
