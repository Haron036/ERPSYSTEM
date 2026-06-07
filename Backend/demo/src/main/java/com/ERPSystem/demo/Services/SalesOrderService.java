package com.ERPSystem.demo.Services;

import com.ERPSystem.demo.DTOs.SalesOrderDto;
import com.ERPSystem.demo.Entities.Customer;
import com.ERPSystem.demo.Entities.SalesOrder;
import com.ERPSystem.demo.Exceptions.ResourceNotFoundException;
import com.ERPSystem.demo.Repositories.CustomerRepository;
import com.ERPSystem.demo.Repositories.SalesOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class SalesOrderService {

    private final SalesOrderRepository orderRepo;
    private final CustomerRepository customerRepo;
    private final AtomicLong codeSeq = new AtomicLong(10300);

    public List<SalesOrderDto.Response> findAll() {
        return orderRepo.findAll().stream().map(this::toResponse).toList();
    }

    public SalesOrderDto.Response findById(Long id) {
        return toResponse(orderRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id)));
    }

    public SalesOrderDto.Response create(SalesOrderDto.Request req) {
        Customer customer = customerRepo.findById(req.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + req.getCustomerId()));

        String num = "SO-" + codeSeq.incrementAndGet();
        SalesOrder order = SalesOrder.builder()
                .orderNumber(num)
                .customer(customer)
                .orderDate(req.getOrderDate())
                .total(req.getTotal())
                .status(req.getStatus() != null ? req.getStatus() : SalesOrder.OrderStatus.PROCESSING)
                .paymentStatus(req.getPaymentStatus() != null ? req.getPaymentStatus() : SalesOrder.PaymentStatus.PENDING)
                .notes(req.getNotes())
                .build();
        return toResponse(orderRepo.save(order));
    }

    public SalesOrderDto.Response updateStatus(Long id, SalesOrder.OrderStatus status) {
        SalesOrder order = orderRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
        order.setStatus(status);
        return toResponse(orderRepo.save(order));
    }

    public void delete(Long id) {
        if (!orderRepo.existsById(id)) throw new ResourceNotFoundException("Order not found: " + id);
        orderRepo.deleteById(id);
    }

    private SalesOrderDto.Response toResponse(SalesOrder o) {
        return SalesOrderDto.Response.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .customerName(o.getCustomer().getName())
                .orderDate(o.getOrderDate())
                .total(o.getTotal())
                .status(o.getStatus().name())
                .paymentStatus(o.getPaymentStatus().name())
                .createdAt(o.getCreatedAt())
                .build();
    }

}
