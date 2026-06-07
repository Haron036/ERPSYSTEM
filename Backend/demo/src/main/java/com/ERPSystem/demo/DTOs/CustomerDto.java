package com.ERPSystem.demo.DTOs;

import com.ERPSystem.demo.Entities.Customer;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CustomerDto {
    @Getter
    @Setter
    public static class Request {
        @NotBlank
        private String name;
        private String contactPerson;
        @Email
        private String email;
        private String country;
        private Customer.CustomerStatus status;
    }

    @Getter @Setter @Builder
    public static class Response {
        private Long id;
        private String customerCode;
        private String name;
        private String contactPerson;
        private String email;
        private String country;
        private BigDecimal lifetimeValue;
        private String status;
        private LocalDateTime createdAt;
    }
}
