package com.ERPSystem.demo.DTOs;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class AttendanceDto {
    // ── What the heatmap endpoint returns ─────────────────────────────────────
    @Getter @Setter @Builder
    public static class MonthlyGrid {
        private int year;
        private int month;
        private int daysInMonth;
        private List<EmployeeRow> rows;
    }

    @Getter @Setter @Builder
    public static class EmployeeRow {
        private Long         employeeId;
        private String       employeeName;
        private String       employeeCode;
        private String       department;
        private List<DayCell> days;
    }

    @Getter @Setter @Builder
    public static class DayCell {
        private int    day;
        private String status;        // PRESENT | ABSENT | ON_LEAVE | WEEKEND | NO_DATA
        private String checkInTime;
        private String checkOutTime;
    }

    // ── Clock-in / clock-out response ─────────────────────────────────────────
    @Getter @Setter @Builder
    public static class ClockResponse {
        private Long      recordId;
        private Long      employeeId;
        private String    employeeName;
        private LocalDate date;
        private String    status;
        private LocalTime checkInTime;
        private LocalTime checkOutTime;
        private String    message;
    }

    // ── Today's status for the clock-in panel ─────────────────────────────────
    @Getter
    @Setter
    @Builder
    public static class TodayStatus {
        private boolean   clockedIn;
        private boolean   clockedOut;
        private LocalTime checkInTime;
        private LocalTime checkOutTime;
        private String    status;
    }

}
