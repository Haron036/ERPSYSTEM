package com.ERPSystem.demo.Repositories;

import com.ERPSystem.demo.Entities.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Optional<PurchaseOrder> findByPoNumber(String poNumber);
    List<PurchaseOrder> findBySupplierId(Long supplierId);
    List<PurchaseOrder> findByStatus(PurchaseOrder.PoStatus status);
    List<PurchaseOrder> findTop5ByOrderByCreatedAtDesc();
}
