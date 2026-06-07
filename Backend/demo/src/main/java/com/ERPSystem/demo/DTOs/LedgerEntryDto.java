package com.ERPSystem.demo.DTOs;

import com.ERPSystem.demo.Entities.LedgerEntry;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class LedgerEntryDto {
    @Getter
    @Setter
    public static class Request {
        @NotNull
        private LocalDate entryDate;
        @NotBlank
        private String account;
        private BigDecimal debit;
        private BigDecimal credit;
        private String reference;
        private String memo;
        private LedgerEntry.EntryType entryType;
    }

    @Getter @Setter @Builder
    public static class Response {
        private Long id;
        private LocalDate entryDate;
        private String account;
        private BigDecimal debit;
        private BigDecimal credit;
        private String reference;
        private String memo;
        private String entryType;
        private LocalDateTime createdAt;
    }
}
