package com.ERPSystem.demo.DTOs;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class LeaveRequestDto {
    @Getter
    @Setter
    public static class Request {
        @NotNull
        private Long employeeId;

        @NotNull
        private String leaveType;   // ANNUAL | SICK | MATERNITY | PATERNITY | UNPAID

        @NotNull
        private LocalDate startDate;

        @NotNull
        private LocalDate endDate;

        private String reason;
    }

    @Getter
    @Setter
    @Builder
    public static class Response {
        private Long          id;
        private String        leaveNumber;
        private Long          employeeId;
        private String        employeeName;
        private String        employeeEmail;
        private String        department;
        private String        leaveType;
        private LocalDate     startDate;
        private LocalDate endDate;
        private int           daysRequested;
        private String        reason;
        private String        status;
        private LocalDateTime createdAt;
    }

}
