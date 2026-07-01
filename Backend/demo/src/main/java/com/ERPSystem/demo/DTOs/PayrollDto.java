package com.ERPSystem.demo.DTOs;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

public class PayrollDto {

    // ── Salary structure request (admin sets this) ────────────────────────────
    @Getter
    @Setter
    public static class SalaryRequest {
        private BigDecimal basicSalary;
        private BigDecimal houseAllowance;
        private BigDecimal transportAllowance;
        private BigDecimal otherAllowances;
        private BigDecimal helbDeduction;
        private BigDecimal otherDeductions;
    }

    // ── Salary structure response ─────────────────────────────────────────────
    @Getter @Setter @Builder
    public static class SalaryResponse {
        private Long       employeeId;
        private String     employeeName;
        private String     employeeCode;
        private String     department;
        private BigDecimal basicSalary;
        private BigDecimal houseAllowance;
        private BigDecimal transportAllowance;
        private BigDecimal otherAllowances;
        private BigDecimal helbDeduction;
        private BigDecimal otherDeductions;
        private BigDecimal grossSalary;      // computed preview
    }

    // ── Full payslip (one employee, one month) ────────────────────────────────
    @Getter @Setter @Builder
    public static class Payslip {
        private Long       id;
        private Long       employeeId;
        private String     employeeName;
        private String     employeeCode;
        private String     department;
        private String     role;
        private int        year;
        private int        month;
        private String     monthLabel;       // e.g. "June 2026"

        // Earnings
        private BigDecimal basicSalary;
        private BigDecimal houseAllowance;
        private BigDecimal transportAllowance;
        private BigDecimal otherAllowances;
        private BigDecimal grossSalary;

        // Deductions
        private BigDecimal nssfEmployee;
        private BigDecimal nssfEmployer;
        private BigDecimal nhif;
        private BigDecimal payeTax;
        private BigDecimal housingLevy;
        private BigDecimal helbDeduction;
        private BigDecimal otherDeductions;
        private BigDecimal totalDeductions;

        // Net
        private BigDecimal netPay;
        private BigDecimal totalEmployerCost;
        private String     status;
    }

    // ── Bulk run summary ──────────────────────────────────────────────────────
    @Getter @Setter @Builder
    public static class RunSummary {
        private int        year;
        private int        month;
        private String     monthLabel;
        private int        employeeCount;
        private BigDecimal totalGross;
        private BigDecimal totalNssf;
        private BigDecimal totalNhif;
        private BigDecimal totalPaye;
        private BigDecimal totalHousingLevy;
        private BigDecimal totalDeductions;
        private BigDecimal totalNetPay;
        private BigDecimal totalEmployerCost;
        private List<Payslip> payslips;
    }

}
