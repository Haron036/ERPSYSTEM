package com.ERPSystem.demo.Repositories;

import com.ERPSystem.demo.Entities.ApprovalLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApprovalLogRepository extends JpaRepository<ApprovalLog, Long> {
    List<ApprovalLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
            ApprovalLog.EntityType type, Long entityId);

}
