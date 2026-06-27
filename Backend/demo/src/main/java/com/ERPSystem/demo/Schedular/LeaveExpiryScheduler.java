package com.ERPSystem.demo.Schedular;

import com.ERPSystem.demo.Entities.Employee;
import com.ERPSystem.demo.Entities.LeaveRequest;
import com.ERPSystem.demo.Repositories.EmployeeRepository;
import com.ERPSystem.demo.Repositories.LeaveRequestRepository;
import com.ERPSystem.demo.Services.EmailService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class LeaveExpiryScheduler {
    private final LeaveRequestRepository leaveRepo;
    private final EmployeeRepository     employeeRepo;
    private final EmailService           emailService;

    @Scheduled(cron = "0 0 6 * * *")   // every day at 06:00 AM
    @Transactional
    public void processLeaveExpiry() {
        LocalDate today    = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        LocalDate dayAfter = today.plusDays(2);

        List<LeaveRequest> approvedLeaves =
                leaveRepo.findByStatus(LeaveRequest.LeaveStatus.APPROVED);

        for (LeaveRequest leave : approvedLeaves) {
            LocalDate endDate = leave.getEndDate();
            Employee  emp     = leave.getEmployee();

            if (endDate.isBefore(today)) {
                // Leave has ended → restore ACTIVE
                leave.setStatus(LeaveRequest.LeaveStatus.COMPLETED);
                leaveRepo.save(leave);
                emp.setStatus(Employee.EmployeeStatus.ACTIVE);
                employeeRepo.save(emp);
                log.info("Leave {} ended — {} restored to ACTIVE",
                        leave.getLeaveNumber(), emp.getName());
                emailService.sendLeaveExpired(
                        emp.getEmail(), emp.getName(),
                        leave.getLeaveNumber(), endDate);

            } else if (endDate.equals(dayAfter)) {
                // 2-day heads-up
                emailService.sendLeaveEndingReminder(
                        emp.getEmail(), emp.getName(),
                        leave.getLeaveNumber(), endDate, 2);
                log.info("2-day reminder → {} ({})", leave.getLeaveNumber(), emp.getName());

            } else if (endDate.equals(tomorrow)) {
                // 1-day heads-up
                emailService.sendLeaveEndingReminder(
                        emp.getEmail(), emp.getName(),
                        leave.getLeaveNumber(), endDate, 1);
                log.info("1-day reminder → {} ({})", leave.getLeaveNumber(), emp.getName());
            }
        }
    }

}
