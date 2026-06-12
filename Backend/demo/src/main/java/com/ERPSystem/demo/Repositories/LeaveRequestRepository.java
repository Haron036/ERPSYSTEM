package com.ERPSystem.demo.Repositories;

import com.ERPSystem.demo.Entities.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByStatus(LeaveRequest.LeaveStatus status);
    List<LeaveRequest> findByEmployeeId(Long employeeId);
    Optional<LeaveRequest> findByLeaveNumber(String leaveNumber);

}
