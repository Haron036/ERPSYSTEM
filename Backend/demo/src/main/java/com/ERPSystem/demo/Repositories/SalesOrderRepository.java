package com.ERPSystem.demo.Repositories;

import com.ERPSystem.demo.Entities.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {
    Optional<SalesOrder> findByOrderNumber(String orderNumber);
    List<SalesOrder> findByCustomerId(Long customerId);
    List<SalesOrder> findByStatus(SalesOrder.OrderStatus status);
}
