package com.ERPSystem.demo.Services;

import com.ERPSystem.demo.DTOs.DashboardDto;
import com.ERPSystem.demo.Entities.Customer;
import com.ERPSystem.demo.Entities.PurchaseOrder;
import com.ERPSystem.demo.Entities.SupportTicket;
import com.ERPSystem.demo.Repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LedgerEntryRepository ledgerRepo;
    private final SalesOrderRepository salesRepo;
    private final CustomerRepository customerRepo;
    private final ProductRepository productRepo;
    private final SupportTicketRepository ticketRepo;
    private final PurchaseOrderRepository poRepo;

    public DashboardDto.KpiResponse getKpis() {
        BigDecimal revenue = ledgerRepo.getBalanceForAccount("4000 · Sales Revenue");

        long openTickets = ticketRepo.findByStatus(SupportTicket.TicketStatus.OPEN).size()
                + ticketRepo.findByStatus(SupportTicket.TicketStatus.IN_PROGRESS).size();

        long pendingApprovals = poRepo.findByStatus(PurchaseOrder.PoStatus.PENDING_APPROVAL).size();

        return DashboardDto.KpiResponse.builder()
                .ytdRevenue(revenue != null ? revenue.abs() : BigDecimal.ZERO)
                .totalOrders(salesRepo.count())
                .activeCustomers(customerRepo.findByStatus(Customer.CustomerStatus.ACTIVE).size())
                .totalInventoryUnits(productRepo.findAll().stream()
                        .mapToLong(p -> p.getStockQuantity()).sum())
                .lowStockCount(productRepo.findLowStockProducts().size())
                .overdueInvoices(customerRepo.findByStatus(Customer.CustomerStatus.OVERDUE).size())
                .pendingApprovals(pendingApprovals)
                .openTickets(openTickets)
                .build();
    }

}
