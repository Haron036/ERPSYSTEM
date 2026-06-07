package com.ERPSystem.demo.DTOs;

import com.ERPSystem.demo.Entities.SupportTicket;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

public class SupportTicketDto {
    @Getter
    @Setter
    public static class Request {
        @NotNull
        private Long customerId;
        @NotBlank
        private String subject;
        private SupportTicket.Priority priority;
    }

    @Getter @Setter @Builder
    public static class Response {
        private Long id;
        private String ticketNumber;
        private String customerName;
        private String subject;
        private String priority;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

}
