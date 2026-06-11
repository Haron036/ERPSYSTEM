package com.ERPSystem.demo.Controller;

import com.ERPSystem.demo.DTOs.NotificationDto;
import com.ERPSystem.demo.Entities.PurchaseOrder;
import com.ERPSystem.demo.Entities.SupportTicket;
import com.ERPSystem.demo.Repositories.ProductRepository;
import com.ERPSystem.demo.Repositories.PurchaseOrderRepository;
import com.ERPSystem.demo.Repositories.SalesOrderRepository;
import com.ERPSystem.demo.Repositories.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final ProductRepository productRepo;
    private final SalesOrderRepository salesOrderRepo;
    private final PurchaseOrderRepository purchaseOrderRepo;
    private final SupportTicketRepository ticketRepo;

    @GetMapping
    public List<NotificationDto> getAll() {
        List<NotificationDto> notifs = new ArrayList<>();

        // Low stock alerts
        productRepo.findAll().stream()
                .filter(p -> p.getStockQuantity() <= p.getReorderPoint())
                .forEach(p -> notifs.add(new NotificationDto(
                        "Low stock alert",
                        "SKU #" + p.getSku() + " below reorder point (" + p.getStockQuantity() + " left)",
                        "warning"
                )));

        // Open tickets
        ticketRepo.findAll().stream()
                .filter(t -> t.getStatus() == SupportTicket.TicketStatus.OPEN)
                .limit(3)
                .forEach(t -> notifs.add(new NotificationDto(
                        "Open support ticket",
                        t.getTicketNumber() + " — " + t.getSubject(),
                        "info"
                )));

        // Pending PO approvals
        purchaseOrderRepo.findAll().stream()
                .filter(p -> p.getStatus() == PurchaseOrder.PoStatus.PENDING_APPROVAL)
                .forEach(p -> notifs.add(new NotificationDto(
                        "Approval required",
                        p.getPoNumber() + " awaiting your sign-off",
                        "info"
                )));

        return notifs;
    }
}
