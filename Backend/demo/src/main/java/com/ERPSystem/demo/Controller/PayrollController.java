package com.ERPSystem.demo.Controller;

import com.ERPSystem.demo.DTOs.PayrollDto;
import com.ERPSystem.demo.Services.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payroll")
@RequiredArgsConstructor

public class PayrollController {


    private final PayrollService service;

    // ── Salary structures ─────────────────────────────────────────────────────

    @GetMapping("/salaries")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public List<PayrollDto.SalaryResponse> getAllSalaries() {
        return service.getAllSalaries();
    }

    @GetMapping("/salary/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public PayrollDto.SalaryResponse getSalary(@PathVariable Long employeeId) {
        return service.getSalary(employeeId);
    }

    @PostMapping("/salary/{employeeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public PayrollDto.SalaryResponse setSalary(
            @PathVariable Long employeeId,
            @RequestBody PayrollDto.SalaryRequest req) {
        return service.setSalary(employeeId, req);
    }

    // ── Payroll runs ──────────────────────────────────────────────────────────

    @PostMapping("/run")
    @PreAuthorize("hasRole('ADMIN')")
    public PayrollDto.RunSummary runPayroll(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getYear()}")       int year,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getMonthValue()}") int month) {
        return service.runPayroll(year, month);
    }

    @GetMapping("/runs")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public PayrollDto.RunSummary getRunSummary(
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getYear()}")       int year,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().getMonthValue()}") int month) {
        return service.getRunSummary(year, month);
    }

    @PostMapping("/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public PayrollDto.RunSummary approveRun(
            @RequestParam int year,
            @RequestParam int month) {
        return service.approveRun(year, month);
    }

    @GetMapping("/runs/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public PayrollDto.Payslip getPayslip(
            @PathVariable Long employeeId,
            @RequestParam int year,
            @RequestParam int month) {
        return service.getPayslip(employeeId, year, month);
    }

}
