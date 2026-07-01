package com.ERPSystem.demo.Repositories;

import com.ERPSystem.demo.Entities.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, Long> {
    Optional<SalaryStructure> findByEmployeeId(Long employeeId);
    boolean existsByEmployeeId(Long employeeId);

}
