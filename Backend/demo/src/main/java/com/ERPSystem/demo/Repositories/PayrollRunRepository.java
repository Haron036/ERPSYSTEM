package com.ERPSystem.demo.Repositories;

import com.ERPSystem.demo.Entities.PayrollRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PayrollRunRepository extends JpaRepository<PayrollRun, Long> {

    List<PayrollRun> findByYearAndMonthOrderByEmployee_NameAsc(int year, int month);

    Optional<PayrollRun> findByEmployeeIdAndYearAndMonth(Long employeeId, int year, int month);

    boolean existsByEmployeeIdAndYearAndMonth(Long employeeId, int year, int month);

    @Query("""
        SELECT p FROM PayrollRun p
        WHERE p.employee.id = :employeeId
        ORDER BY p.year DESC, p.month DESC
    """)
    List<PayrollRun> findByEmployeeIdOrderByPeriodDesc(@Param("employeeId") Long employeeId);


}
