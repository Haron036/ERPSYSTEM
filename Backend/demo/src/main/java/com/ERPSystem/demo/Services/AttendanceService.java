package com.ERPSystem.demo.Services;

import com.ERPSystem.demo.DTOs.AttendanceDto;
import com.ERPSystem.demo.Entities.AttendanceRecord;
import com.ERPSystem.demo.Entities.Employee;
import com.ERPSystem.demo.Entities.LeaveRequest;
import com.ERPSystem.demo.Exceptions.ResourceNotFoundException;
import com.ERPSystem.demo.Repositories.AttendanceRepository;
import com.ERPSystem.demo.Repositories.EmployeeRepository;
import com.ERPSystem.demo.Repositories.LeaveRequestRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final AttendanceRepository attendanceRepo;
    private final EmployeeRepository employeeRepo;
    private final LeaveRequestRepository leaveRepo;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    // ── Clock In ──────────────────────────────────────────────────────────────

    @Transactional
    public AttendanceDto.ClockResponse clockIn(Long employeeId) {
        LocalDate today = LocalDate.now();

        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + employeeId));

        // Prevent double clock-in
        if (attendanceRepo.existsByEmployeeIdAndDate(employeeId, today)) {
            AttendanceRecord existing = attendanceRepo
                    .findByEmployeeIdAndDate(employeeId, today).orElseThrow();
            if (existing.getCheckInTime() != null) {
                throw new IllegalStateException(
                        "Already clocked in today at " + existing.getCheckInTime().format(TIME_FMT));
            }
        }

        AttendanceRecord record = AttendanceRecord.builder()
                .employee(employee)
                .date(today)
                .status(AttendanceRecord.AttendanceStatus.PRESENT)
                .checkInTime(LocalTime.now())
                .build();

        AttendanceRecord saved = attendanceRepo.save(record);
        log.info("Clock-in: {} on {}", employee.getName(), today);

        return toClockResponse(saved, "Clocked in successfully");
    }

    // ── Clock Out ─────────────────────────────────────────────────────────────

    @Transactional
    public AttendanceDto.ClockResponse clockOut(Long employeeId) {
        LocalDate today = LocalDate.now();

        AttendanceRecord record = attendanceRepo
                .findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new IllegalStateException(
                        "No clock-in record found for today. Please clock in first."));

        if (record.getCheckOutTime() != null) {
            throw new IllegalStateException(
                    "Already clocked out today at " + record.getCheckOutTime().format(TIME_FMT));
        }

        record.setCheckOutTime(LocalTime.now());
        AttendanceRecord saved = attendanceRepo.save(record);
        log.info("Clock-out: {} on {}", record.getEmployee().getName(), today);

        return toClockResponse(saved, "Clocked out successfully");
    }

    // ── Today's status for the clock-in panel ─────────────────────────────────

    public AttendanceDto.TodayStatus getTodayStatus(Long employeeId) {
        return attendanceRepo.findByEmployeeIdAndDate(employeeId, LocalDate.now())
                .map(r -> AttendanceDto.TodayStatus.builder()
                        .clockedIn(r.getCheckInTime() != null)
                        .clockedOut(r.getCheckOutTime() != null)
                        .checkInTime(r.getCheckInTime())
                        .checkOutTime(r.getCheckOutTime())
                        .status(r.getStatus().name())
                        .build())
                .orElse(AttendanceDto.TodayStatus.builder()
                        .clockedIn(false)
                        .clockedOut(false)
                        .status(null)
                        .build());
    }

    // ── Monthly heatmap grid ──────────────────────────────────────────────────

    public AttendanceDto.MonthlyGrid getMonthlyGrid(int year, int month) {
        YearMonth ym       = YearMonth.of(year, month);
        LocalDate start    = ym.atDay(1);
        LocalDate end      = ym.atEndOfMonth();
        int       daysInMonth = ym.lengthOfMonth();

        // Fetch all attendance records for the month in one query
        List<AttendanceRecord> allRecords = attendanceRepo.findAllInRange(start, end);

        // Group by employeeId → date → record
        Map<Long, Map<LocalDate, AttendanceRecord>> byEmployee = allRecords.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getEmployee().getId(),
                        Collectors.toMap(AttendanceRecord::getDate, r -> r)
                ));

        // Fetch all active employees
        List<Employee> employees = employeeRepo.findAll().stream()
                .filter(e -> e.getStatus() != Employee.EmployeeStatus.TERMINATED)
                .sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName()))
                .toList();

        List<AttendanceDto.EmployeeRow> rows = new ArrayList<>();

        for (Employee emp : employees) {
            Map<LocalDate, AttendanceRecord> empRecords =
                    byEmployee.getOrDefault(emp.getId(), Map.of());

            List<AttendanceDto.DayCell> days = new ArrayList<>();

            for (int day = 1; day <= daysInMonth; day++) {
                LocalDate date = ym.atDay(day);
                DayOfWeek dow  = date.getDayOfWeek();
                boolean isWeekend = dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY;

                AttendanceRecord rec = empRecords.get(date);

                AttendanceDto.DayCell cell;
                if (isWeekend) {
                    cell = AttendanceDto.DayCell.builder()
                            .day(day).status("WEEKEND").build();
                } else if (rec != null) {
                    cell = AttendanceDto.DayCell.builder()
                            .day(day)
                            .status(rec.getStatus().name())
                            .checkInTime(rec.getCheckInTime() != null
                                    ? rec.getCheckInTime().format(TIME_FMT) : null)
                            .checkOutTime(rec.getCheckOutTime() != null
                                    ? rec.getCheckOutTime().format(TIME_FMT) : null)
                            .build();
                } else {
                    // Past weekday with no record = ABSENT; future = NO_DATA
                    String status = date.isBefore(LocalDate.now()) ? "ABSENT" : "NO_DATA";
                    cell = AttendanceDto.DayCell.builder()
                            .day(day).status(status).build();
                }
                days.add(cell);
            }

            rows.add(AttendanceDto.EmployeeRow.builder()
                    .employeeId(emp.getId())
                    .employeeName(emp.getName())
                    .employeeCode(emp.getEmployeeCode())
                    .department(emp.getDepartment())
                    .days(days)
                    .build());
        }

        return AttendanceDto.MonthlyGrid.builder()
                .year(year).month(month).daysInMonth(daysInMonth).rows(rows)
                .build();
    }

    // ── Scheduler: auto-mark ON_LEAVE from approved leaves ───────────────────

    @Scheduled(cron = "0 1 0 * * *")  // 00:01 AM every day
    @Transactional
    public void autoMarkLeaveAttendance() {
        LocalDate today = LocalDate.now();
        DayOfWeek dow   = today.getDayOfWeek();
        if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) return;

        leaveRepo.findByStatus(LeaveRequest.LeaveStatus.APPROVED).stream()
                .filter(lr -> !lr.getStartDate().isAfter(today) && !lr.getEndDate().isBefore(today))
                .forEach(lr -> {
                    Long empId = lr.getEmployee().getId();
                    if (!attendanceRepo.existsByEmployeeIdAndDate(empId, today)) {
                        AttendanceRecord rec = AttendanceRecord.builder()
                                .employee(lr.getEmployee())
                                .date(today)
                                .status(AttendanceRecord.AttendanceStatus.ON_LEAVE)
                                .notes("Auto-marked from approved leave " + lr.getLeaveNumber())
                                .build();
                        attendanceRepo.save(rec);
                        log.info("Auto-marked ON_LEAVE: {} for {}", lr.getEmployee().getName(), today);
                    }
                });
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private AttendanceDto.ClockResponse toClockResponse(AttendanceRecord r, String message) {
        return AttendanceDto.ClockResponse.builder()
                .recordId(r.getId())
                .employeeId(r.getEmployee().getId())
                .employeeName(r.getEmployee().getName())
                .date(r.getDate())
                .status(r.getStatus().name())
                .checkInTime(r.getCheckInTime())
                .checkOutTime(r.getCheckOutTime())
                .message(message)
                .build();
    }
}
