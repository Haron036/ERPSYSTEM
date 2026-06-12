package com.ERPSystem.demo.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String orderNumber;    // e.g. SO-10293

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    private LocalDate orderDate;

    @Column(precision = 15, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PROCESSING;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    private String notes;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist  void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate   void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum OrderStatus { PENDING_APPROVAL, QUOTED, PROCESSING, PICKING, FULFILLED, CANCELLED }
    public enum PaymentStatus { PENDING, PARTIAL, PAID }
}
