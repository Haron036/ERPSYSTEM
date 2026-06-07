package com.ERPSystem.demo.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

public class ProductDto {
    @Getter
    @Setter
    public static class Request {
        @NotBlank
        private String sku;
        @NotBlank private String name;
        private String category;
        private Long supplierId;
        @PositiveOrZero
        private Integer stockQuantity;
        @PositiveOrZero private Integer reorderPoint;
        @Positive
        private BigDecimal unitPrice;
    }

    @Getter @Setter @Builder
    public static class Response {
        private Long id;
        private String sku;
        private String name;
        private String category;
        private String supplierName;
        private Integer stockQuantity;
        private Integer reorderPoint;
        private BigDecimal unitPrice;
        private boolean lowStock;
    }
}
