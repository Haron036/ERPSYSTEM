package com.ERPSystem.demo.Services;

import com.ERPSystem.demo.DTOs.PayrollDto;
import com.ERPSystem.demo.Entities.Employee;
import com.ERPSystem.demo.Entities.PayrollRun;
import com.ERPSystem.demo.Entities.SalaryStructure;
import com.ERPSystem.demo.Exceptions.ResourceNotFoundException;
import com.ERPSystem.demo.Repositories.EmployeeRepository;
import com.ERPSystem.demo.Repositories.PayrollRunRepository;
import com.ERPSystem.demo.Repositories.SalaryStructureRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final SalaryStructureRepository salaryRepo;
    private final PayrollRunRepository payrollRepo;
    private final EmployeeRepository employeeRepo;
    private final KenyaPayrollCalculator calculator;

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    // ── Salary structure ──────────────────────────────────────────────────────

    @Transactional
    public PayrollDto.SalaryResponse setSalary(Long employeeId, PayrollDto.SalaryRequest req) {
        Employee emp = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + employeeId));

        SalaryStructure ss = salaryRepo.findByEmployeeId(employeeId)
                .orElse(SalaryStructure.builder().employee(emp).build());

        ss.setBasicSalary(req.getBasicSalary());
        ss.setHouseAllowance(orZero(req.getHouseAllowance()));
        ss.setTransportAllowance(orZero(req.getTransportAllowance()));
        ss.setOtherAllowances(orZero(req.getOtherAllowances()));
        ss.setHelbDeduction(orZero(req.getHelbDeduction()));
        ss.setOtherDeductions(orZero(req.getOtherDeductions()));

        salaryRepo.save(ss);
        return toSalaryResponse(ss);
    }

    public PayrollDto.SalaryResponse getSalary(Long employeeId) {
        SalaryStructure ss = salaryRepo.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No salary structure set for employee: " + employeeId));
        return toSalaryResponse(ss);
    }

    public List<PayrollDto.SalaryResponse> getAllSalaries() {
        return salaryRepo.findAll().stream().map(this::toSalaryResponse).toList();
    }

    // ── Bulk payroll run ──────────────────────────────────────────────────────

    @Transactional
    public PayrollDto.RunSummary runPayroll(int year, int month) {
        List<SalaryStructure> allSalaries = salaryRepo.findAll();

        if (allSalaries.isEmpty()) {
            throw new IllegalStateException(
                    "No salary structures found. Set up salaries before running payroll.");
        }

        List<PayrollDto.Payslip> payslips = new ArrayList<>();

        for (SalaryStructure ss : allSalaries) {
            Employee emp = ss.getEmployee();

            // Skip terminated employees
            if (emp.getStatus() == Employee.EmployeeStatus.TERMINATED) continue;

            // Recompute if already exists (idempotent re-run)
            PayrollRun run = payrollRepo
                    .findByEmployeeIdAndYearAndMonth(emp.getId(), year, month)
                    .orElse(PayrollRun.builder().employee(emp).year(year).month(month).build());

            KenyaPayrollCalculator.PayrollResult result = calculator.compute(
                    ss.getBasicSalary(),
                    ss.getHouseAllowance(),
                    ss.getTransportAllowance(),
                    ss.getOtherAllowances(),
                    ss.getHelbDeduction(),
                    ss.getOtherDeductions()
            );

            run.setBasicSalary(ss.getBasicSalary());
            run.setHouseAllowance(ss.getHouseAllowance());
            run.setTransportAllowance(ss.getTransportAllowance());
            run.setOtherAllowances(ss.getOtherAllowances());
            run.setGrossSalary(result.grossSalary());
            run.setNssfEmployee(result.nssfEmployee());
            run.setNssfEmployer(result.nssfEmployer());
            run.setNhif(result.nhif());
            run.setPayeTax(result.payeTax());
            run.setHousingLevy(result.housingLevy());
            run.setHelbDeduction(result.helbDeduction());
            run.setOtherDeductions(result.otherDeductions());
            run.setTotalDeductions(result.totalDeductions());
            run.setNetPay(result.netPay());
            run.setTotalEmployerCost(result.totalEmployerCost());
            run.setStatus(PayrollRun.PayrollStatus.DRAFT);

            payrollRepo.save(run);
            payslips.add(toPayslip(run));
        }

        return buildSummary(year, month, payslips);
    }

    // ── Fetch runs ────────────────────────────────────────────────────────────

    public PayrollDto.RunSummary getRunSummary(int year, int month) {
        List<PayrollRun> runs = payrollRepo
                .findByYearAndMonthOrderByEmployee_NameAsc(year, month);
        List<PayrollDto.Payslip> payslips = runs.stream().map(this::toPayslip).toList();
        return buildSummary(year, month, payslips);
    }

    public PayrollDto.Payslip getPayslip(Long employeeId, int year, int month) {
        PayrollRun run = payrollRepo
                .findByEmployeeIdAndYearAndMonth(employeeId, year, month)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No payroll run found for employee " + employeeId +
                                " in " + month + "/" + year));
        return toPayslip(run);
    }

    // ── Approve payroll run ───────────────────────────────────────────────────

    @Transactional
    public PayrollDto.RunSummary approveRun(int year, int month) {
        List<PayrollRun> runs = payrollRepo
                .findByYearAndMonthOrderByEmployee_NameAsc(year, month);
        runs.forEach(r -> r.setStatus(PayrollRun.PayrollStatus.APPROVED));
        payrollRepo.saveAll(runs);
        return buildSummary(year, month, runs.stream().map(this::toPayslip).toList());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private BigDecimal orZero(BigDecimal v) {
        return v == null ? ZERO : v;
    }

    private String monthLabel(int year, int month) {
        return Month.of(month).getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + year;
    }

    private PayrollDto.RunSummary buildSummary(int year, int month,
                                               List<PayrollDto.Payslip> payslips) {
        BigDecimal totalGross    = payslips.stream().map(PayrollDto.Payslip::getGrossSalary)
                .reduce(ZERO, BigDecimal::add);
        BigDecimal totalNssf     = payslips.stream().map(PayrollDto.Payslip::getNssfEmployee)
                .reduce(ZERO, BigDecimal::add);
        BigDecimal totalNhif     = payslips.stream().map(PayrollDto.Payslip::getNhif)
                .reduce(ZERO, BigDecimal::add);
        BigDecimal totalPaye     = payslips.stream().map(PayrollDto.Payslip::getPayeTax)
                .reduce(ZERO, BigDecimal::add);
        BigDecimal totalHousing  = payslips.stream().map(PayrollDto.Payslip::getHousingLevy)
                .reduce(ZERO, BigDecimal::add);
        BigDecimal totalDed      = payslips.stream().map(PayrollDto.Payslip::getTotalDeductions)
                .reduce(ZERO, BigDecimal::add);
        BigDecimal totalNet      = payslips.stream().map(PayrollDto.Payslip::getNetPay)
                .reduce(ZERO, BigDecimal::add);
        BigDecimal totalCost     = payslips.stream().map(PayrollDto.Payslip::getTotalEmployerCost)
                .reduce(ZERO, BigDecimal::add);

        return PayrollDto.RunSummary.builder()
                .year(year).month(month)
                .monthLabel(monthLabel(year, month))
                .employeeCount(payslips.size())
                .totalGross(totalGross)
                .totalNssf(totalNssf)
                .totalNhif(totalNhif)
                .totalPaye(totalPaye)
                .totalHousingLevy(totalHousing)
                .totalDeductions(totalDed)
                .totalNetPay(totalNet)
                .totalEmployerCost(totalCost)
                .payslips(payslips)
                .build();
    }

    private PayrollDto.SalaryResponse toSalaryResponse(SalaryStructure ss) {
        BigDecimal gross = ss.getBasicSalary()
                .add(ss.getHouseAllowance())
                .add(ss.getTransportAllowance())
                .add(ss.getOtherAllowances());
        Employee emp = ss.getEmployee();
        return PayrollDto.SalaryResponse.builder()
                .employeeId(emp.getId())
                .employeeName(emp.getName())
                .employeeCode(emp.getEmployeeCode())
                .department(emp.getDepartment())
                .basicSalary(ss.getBasicSalary())
                .houseAllowance(ss.getHouseAllowance())
                .transportAllowance(ss.getTransportAllowance())
                .otherAllowances(ss.getOtherAllowances())
                .helbDeduction(ss.getHelbDeduction())
                .otherDeductions(ss.getOtherDeductions())
                .grossSalary(gross)
                .build();
    }

    private PayrollDto.Payslip toPayslip(PayrollRun r) {
        Employee emp = r.getEmployee();
        return PayrollDto.Payslip.builder()
                .id(r.getId())
                .employeeId(emp.getId())
                .employeeName(emp.getName())
                .employeeCode(emp.getEmployeeCode())
                .department(emp.getDepartment())
                .role(emp.getRole())
                .year(r.getYear())
                .month(r.getMonth())
                .monthLabel(monthLabel(r.getYear(), r.getMonth()))
                .basicSalary(r.getBasicSalary())
                .houseAllowance(r.getHouseAllowance())
                .transportAllowance(r.getTransportAllowance())
                .otherAllowances(r.getOtherAllowances())
                .grossSalary(r.getGrossSalary())
                .nssfEmployee(r.getNssfEmployee())
                .nssfEmployer(r.getNssfEmployer())
                .nhif(r.getNhif())
                .payeTax(r.getPayeTax())
                .housingLevy(r.getHousingLevy())
                .helbDeduction(r.getHelbDeduction())
                .otherDeductions(r.getOtherDeductions())
                .totalDeductions(r.getTotalDeductions())
                .netPay(r.getNetPay())
                .totalEmployerCost(r.getTotalEmployerCost())
                .status(r.getStatus().name())
                .build();
    }


}
