package com.ERPSystem.demo.DTOs;

import com.ERPSystem.demo.Entities.Employee;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class EmployeeDto {
    @Getter
    @Setter
    public static class Request {
        @NotBlank
        private String name;
        @NotBlank
        private String role;
        @NotBlank
        private String department;
        @Email
        @NotBlank
        private String email;
        private Employee.EmployeeStatus status;
        private LocalDate joinedDate;
    }

    @Getter
    @Setter
    @Builder
    public static class Response {
        private Long id;
        private String employeeCode;
        private String name;
        private String role;
        private String department;
        private String email;
        private String status;
        private LocalDate joinedDate;
        private LocalDateTime createdAt;
    }
}