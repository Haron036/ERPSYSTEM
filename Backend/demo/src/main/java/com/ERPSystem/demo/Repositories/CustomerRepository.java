package com.ERPSystem.demo.Repositories;

import com.ERPSystem.demo.Entities.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByCustomerCode(String code);
    boolean existsByEmail(String email);
    List<Customer> findByStatus(Customer.CustomerStatus status);
}
