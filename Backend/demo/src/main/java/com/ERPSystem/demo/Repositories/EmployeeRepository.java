package com.ERPSystem.demo.Repositories;

import com.ERPSystem.demo.Entities.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmployeeCode(String code);
    boolean existsByEmail(String email);
    List<Employee> findByDepartment(String department);
    List<Employee> findByStatus(Employee.EmployeeStatus status);
}
