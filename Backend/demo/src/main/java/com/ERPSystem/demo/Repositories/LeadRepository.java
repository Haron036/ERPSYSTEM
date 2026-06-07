package com.ERPSystem.demo.Repositories;

import com.ERPSystem.demo.Entities.CRM;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeadRepository extends JpaRepository<CRM, Long> {
    Optional<CRM> findByLeadCode(String code);
    List<CRM> findByStage(CRM.LeadStage stage);
}
