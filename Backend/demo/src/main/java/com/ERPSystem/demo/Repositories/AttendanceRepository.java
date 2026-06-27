package com.ERPSystem.demo.Repositories;

import com.ERPSystem.demo.Entities.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<AttendanceRecord, Long> {

    // Fetch one specific record for an employee on a given day
    Optional<AttendanceRecord> findByEmployeeIdAndDate(Long employeeId, LocalDate date);

    // All records for a specific employee in a date range (for monthly grid)
    List<AttendanceRecord> findByEmployeeIdAndDateBetweenOrderByDateAsc(
            Long employeeId, LocalDate start, LocalDate end);

    // All records for all employees in a date range (admin heatmap)
    @Query("""
        SELECT a FROM AttendanceRecord a
        JOIN FETCH a.employee e
        WHERE a.date BETWEEN :start AND :end
        ORDER BY e.name ASC, a.date ASC
    """)
    List<AttendanceRecord> findAllInRange(
            @Param("start") LocalDate start,
            @Param("end")   LocalDate end);

    // Check if a record already exists (prevent duplicates)
    boolean existsByEmployeeIdAndDate(Long employeeId, LocalDate date);

    // All approved leave records for auto-population by scheduler
    @Query("""
        SELECT a FROM AttendanceRecord a
        WHERE a.date = :date AND a.status = :status
    """)
    List<AttendanceRecord> findByDateAndStatus(
            @Param("date")   LocalDate date,
            @Param("status") AttendanceRecord.AttendanceStatus status);


}
