package com.ERPSystem.demo.Controller;

import com.ERPSystem.demo.DTOs.AttendanceDto;
import com.ERPSystem.demo.Services.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService service;

    // Employee clocks themselves in
    @PostMapping("/clock-in/{employeeId}")
    public AttendanceDto.ClockResponse clockIn(@PathVariable Long employeeId) {
        return service.clockIn(employeeId);
    }

    // Employee clocks themselves out
    @PostMapping("/clock-out/{employeeId}")
    public AttendanceDto.ClockResponse clockOut(@PathVariable Long employeeId) {
        return service.clockOut(employeeId);
    }

    // What is today's status for this employee? (drives the UI panel)
    @GetMapping("/today/{employeeId}")
    public AttendanceDto.TodayStatus getTodayStatus(@PathVariable Long employeeId) {
        return service.getTodayStatus(employeeId);
    }

    // Full monthly heatmap grid — defaults to current month
    @GetMapping("/monthly")
    public AttendanceDto.MonthlyGrid getMonthlyGrid(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getYear()}")   int year,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getMonthValue()}") int month) {
        return service.getMonthlyGrid(year, month);
    }
    }
