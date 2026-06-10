package com.ERPSystem.demo.Repositories;

import com.ERPSystem.demo.Entities.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {
    Optional<SalesOrder> findByOrderNumber(String orderNumber);
    List<SalesOrder> findByCustomerId(Long customerId);
    List<SalesOrder> findByStatus(SalesOrder.OrderStatus status);

    @Query("SELECT c.country, SUM(so.total) " +
            "FROM SalesOrder so JOIN so.customer c " +
            "WHERE c.country IS NOT NULL " +
            "AND so.status <> com.ERPSystem.demo.Entities.SalesOrder.OrderStatus.CANCELLED " +
            "GROUP BY c.country " +
            "ORDER BY SUM(so.total) DESC")
    List<Object[]> revenueByCountry();

    // Activity feed — confirmed field: createdAt
    List<SalesOrder> findTop5ByOrderByCreatedAtDesc();

}
