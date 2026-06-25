package com.ERPSystem.demo.Repositories;

import com.ERPSystem.demo.Entities.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    // Used by ApprovalService.getAllPending() — fetches the approvals queue
    List<LeaveRequest> findByStatus(LeaveRequest.LeaveStatus status);

    // Used by LeaveRequestService.findByEmployee() — employee leave history
    List<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    // Used by LeaveRequestService.findAll() — full list, newest first
    List<LeaveRequest> findAllByOrderByCreatedAtDesc();

    // Used by LeaveRequestService.initSeq() — seed the LV- number on startup
    Optional<LeaveRequest> findTopByLeaveNumberStartingWithOrderByLeaveNumberDesc(String prefix);

    // Used for duplicate/ref lookup
    Optional<LeaveRequest> findByLeaveNumber(String leaveNumber);
}