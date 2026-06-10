package com.ERPSystem.demo.Repositories;

import com.ERPSystem.demo.Entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);
    boolean existsBySku(String sku);
    List<Product> findByCategory(String category);
    @Query("SELECT p FROM Product p WHERE p.stockQuantity < p.reorderPoint")
    List<Product> findLowStockProducts();
    // Buckets each product row into inStock / lowStock / outOfStock using reorderPoint
// inStock  = stockQuantity > reorderPoint
// lowStock = 0 < stockQuantity <= reorderPoint
// outOfStock = stockQuantity = 0
    @Query("SELECT p.category, " +
            "SUM(CASE WHEN p.stockQuantity > p.reorderPoint THEN CAST(p.stockQuantity AS long) ELSE 0L END), " +
            "SUM(CASE WHEN p.stockQuantity > 0 AND p.stockQuantity <= p.reorderPoint THEN CAST(p.stockQuantity AS long) ELSE 0L END), " +
            "SUM(CASE WHEN p.stockQuantity = 0 THEN 1L ELSE 0L END) " +
            "FROM Product p " +
            "WHERE p.category IS NOT NULL " +
            "GROUP BY p.category " +
            "ORDER BY p.category")
    List<Object[]> inventoryStatusByCategory();

}
