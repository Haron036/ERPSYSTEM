package com.ERPSystem.demo.DTOs;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

public class SupplierDto {
    @Getter
    @Setter
    public static class Request {
        @NotBlank
        private String name;
        private String contactPerson;
        @Email
        private String email;
        private String country;
        @DecimalMin("0.0") @DecimalMax("5.0") private BigDecimal rating;
        private String leadTime;
    }

    @Getter @Setter @Builder
    public static class Response {
        private Long id;
        private String supplierCode;
        private String name;
        private String contactPerson;
        private String email;
        private String country;
        private BigDecimal rating;
        private String leadTime;
    }
}
