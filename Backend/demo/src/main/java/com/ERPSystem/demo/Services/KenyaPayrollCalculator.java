package com.ERPSystem.demo.Services;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class KenyaPayrollCalculator {

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final RoundingMode RM = RoundingMode.HALF_UP;


    public BigDecimal[] nssfContributions(BigDecimal basicSalary) {
        BigDecimal tier1Ceiling = new BigDecimal("7000");
        BigDecimal tier2Ceiling = new BigDecimal("43000"); // 7000 + 36000
        BigDecimal rate = new BigDecimal("0.06");

        BigDecimal tier1 = basicSalary.min(tier1Ceiling).multiply(rate);
        BigDecimal tier2Base = basicSalary.min(tier2Ceiling).subtract(tier1Ceiling).max(ZERO);
        BigDecimal tier2 = tier2Base.multiply(rate);

        BigDecimal employee = tier1.add(tier2).setScale(2, RM);
        BigDecimal employer = employee; // employer matches
        return new BigDecimal[]{employee, employer};
    }

    // ── NHIF / SHIF ───────────────────────────────────────────────────────────
    // Graduated bands per KRA schedule (monthly gross)
    public BigDecimal nhif(BigDecimal grossSalary) {
        double gross = grossSalary.doubleValue();
        double contribution;
        if      (gross < 6_000)   contribution = 150;
        else if (gross < 7_999)   contribution = 300;
        else if (gross < 11_999)  contribution = 400;
        else if (gross < 14_999)  contribution = 500;
        else if (gross < 19_999)  contribution = 600;
        else if (gross < 24_999)  contribution = 750;
        else if (gross < 29_999)  contribution = 850;
        else if (gross < 34_999)  contribution = 900;
        else if (gross < 39_999)  contribution = 950;
        else if (gross < 44_999)  contribution = 1_000;
        else if (gross < 49_999)  contribution = 1_100;
        else if (gross < 59_999)  contribution = 1_200;
        else if (gross < 69_999)  contribution = 1_300;
        else if (gross < 79_999)  contribution = 1_400;
        else if (gross < 89_999)  contribution = 1_500;
        else if (gross < 99_999)  contribution = 1_600;
        else                      contribution = 1_700;
        return BigDecimal.valueOf(contribution);
    }

    public BigDecimal paye(BigDecimal taxableIncome) {
        if (taxableIncome.compareTo(ZERO) <= 0) return ZERO;

        double income = taxableIncome.doubleValue();
        double tax = 0;

        if (income > 800_000) {
            tax += (income - 800_000) * 0.35;
            income = 800_000;
        }
        if (income > 500_000) {
            tax += (income - 500_000) * 0.325;
            income = 500_000;
        }
        if (income > 32_333) {
            tax += (income - 32_333) * 0.30;
            income = 32_333;
        }
        if (income > 24_000) {
            tax += (income - 24_000) * 0.25;
            income = 24_000;
        }
        tax += income * 0.10;

        // Personal relief
        double personalRelief = 2_400;
        double netTax = Math.max(0, tax - personalRelief);

        return BigDecimal.valueOf(netTax).setScale(2, RM);
    }

    // ── Housing Levy ──────────────────────────────────────────────────────────
    // Affordable Housing Levy: 1.5% of gross (employee) + 1.5% employer match
    public BigDecimal housingLevy(BigDecimal grossSalary) {
        return grossSalary.multiply(new BigDecimal("0.015")).setScale(2, RM);
    }

    // ── Full payroll computation ──────────────────────────────────────────────
    public record PayrollResult(
            BigDecimal grossSalary,
            BigDecimal nssfEmployee,
            BigDecimal nssfEmployer,
            BigDecimal nhif,
            BigDecimal payeTax,
            BigDecimal housingLevy,
            BigDecimal helbDeduction,
            BigDecimal otherDeductions,
            BigDecimal totalDeductions,
            BigDecimal netPay,
            BigDecimal totalEmployerCost
    ) {}

    public PayrollResult compute(
            BigDecimal basicSalary,
            BigDecimal houseAllowance,
            BigDecimal transportAllowance,
            BigDecimal otherAllowances,
            BigDecimal helbDeduction,
            BigDecimal otherDeductions) {

        // Gross = basic + all allowances
        BigDecimal gross = basicSalary
                .add(houseAllowance)
                .add(transportAllowance)
                .add(otherAllowances);

        // NSSF based on basic (pensionable pay)
        BigDecimal[] nssf = nssfContributions(basicSalary);
        BigDecimal nssfEmp = nssf[0];
        BigDecimal nssfEr  = nssf[1];

        // NHIF based on gross
        BigDecimal nhifAmt = nhif(gross);

        // Housing levy
        BigDecimal housingLevyAmt = housingLevy(gross);

        // Taxable income = gross - NSSF - NHIF - housing levy (employee portions)
        BigDecimal taxableIncome = gross
                .subtract(nssfEmp)
                .subtract(nhifAmt)
                .subtract(housingLevyAmt)
                .max(ZERO);

        BigDecimal paye = paye(taxableIncome);

        // Total employee deductions
        BigDecimal totalDed = nssfEmp
                .add(nhifAmt)
                .add(paye)
                .add(housingLevyAmt)
                .add(helbDeduction)
                .add(otherDeductions);

        BigDecimal netPay = gross.subtract(totalDed).setScale(2, RM);

        // Total employer cost = net pay + employer NSSF + employer housing levy
        BigDecimal totalEmployerCost = gross
                .add(nssfEr)
                .add(housingLevyAmt)   // employer also pays 1.5%
                .setScale(2, RM);

        return new PayrollResult(
                gross.setScale(2, RM),
                nssfEmp,
                nssfEr,
                nhifAmt,
                paye,
                housingLevyAmt,
                helbDeduction.setScale(2, RM),
                otherDeductions.setScale(2, RM),
                totalDed.setScale(2, RM),
                netPay,
                totalEmployerCost
        );
    }

}
