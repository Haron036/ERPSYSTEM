package com.ERPSystem.demo.Services;

import com.ERPSystem.demo.DTOs.DashboardDto;
import com.ERPSystem.demo.Entities.Customer;
import com.ERPSystem.demo.Entities.PurchaseOrder;
import com.ERPSystem.demo.Entities.SalesOrder;
import com.ERPSystem.demo.Entities.SupportTicket;
import com.ERPSystem.demo.Repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LedgerEntryRepository   ledgerRepo;
    private final SalesOrderRepository    salesRepo;
    private final CustomerRepository      customerRepo;
    private final ProductRepository       productRepo;
    private final SupportTicketRepository ticketRepo;
    private final PurchaseOrderRepository poRepo;

    // ── KPIs ──────────────────────────────────────────────────────────────────
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

    // ── Revenue Series ────────────────────────────────────────────────────────
    public List<DashboardDto.RevenuePoint> getRevenueSeries() {
        int year = java.time.LocalDate.now().getYear();

        String[] MONTH_LABELS = {"", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

        Map<Integer, BigDecimal> revenueMap = new LinkedHashMap<>();
        Map<Integer, BigDecimal> expenseMap = new LinkedHashMap<>();

        ledgerRepo.monthlyRevenue(year).forEach(row -> {
            int monthNum     = ((Number) row[1]).intValue();
            BigDecimal total = row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
            revenueMap.put(monthNum, total);
        });

        ledgerRepo.monthlyExpenses(year).forEach(row -> {
            int monthNum     = ((Number) row[1]).intValue();
            BigDecimal total = row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
            expenseMap.put(monthNum, total);
        });

        // Include months from expense map that revenue map may not have
        expenseMap.keySet().forEach(m -> revenueMap.putIfAbsent(m, BigDecimal.ZERO));

        return revenueMap.keySet().stream()
                .sorted()
                .map(m -> {
                    BigDecimal rev = revenueMap.getOrDefault(m, BigDecimal.ZERO);
                    BigDecimal exp = expenseMap.getOrDefault(m, BigDecimal.ZERO);
                    return DashboardDto.RevenuePoint.builder()
                            .month(MONTH_LABELS[m])
                            .revenue(rev)
                            .expenses(exp)
                            .profit(rev.subtract(exp))
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ── Sales by Region ───────────────────────────────────────────────────────
    public List<DashboardDto.RegionShare> getSalesByRegion() {
        List<Object[]> rows = salesRepo.revenueByCountry();

        BigDecimal grandTotal = rows.stream()
                .map(r -> r[1] != null ? (BigDecimal) r[1] : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (grandTotal.compareTo(BigDecimal.ZERO) == 0) return List.of();

        return rows.stream()
                .map(r -> {
                    String country      = r[0] != null ? (String) r[0] : "Unknown";
                    BigDecimal subtotal = r[1] != null ? (BigDecimal) r[1] : BigDecimal.ZERO;
                    double pct = subtotal
                            .divide(grandTotal, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .doubleValue();
                    return DashboardDto.RegionShare.builder()
                            .name(country)
                            .value(Math.round(pct * 10.0) / 10.0)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ── Inventory Status ──────────────────────────────────────────────────────
    public List<DashboardDto.InventoryCategory> getInventoryStatus() {
        return productRepo.inventoryStatusByCategory().stream()
                .map(r -> DashboardDto.InventoryCategory.builder()
                        .category((String) r[0])
                        .inStock(((Number) r[1]).longValue())
                        .lowStock(((Number) r[2]).longValue())
                        .outOfStock(((Number) r[3]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    // ── Recent Activities ─────────────────────────────────────────────────────
    public List<DashboardDto.ActivityItem> getRecentActivities() {

        // Carrier record — holds the raw timestamp alongside the DTO so we
        // can sort accurately before discarding it.
        record Stamped(LocalDateTime at, DashboardDto.ActivityItem item) {}

        List<Stamped> stamped = new ArrayList<>();

        // Purchase orders — fields: poNumber, status, supplier.name, createdAt
        for (PurchaseOrder po : poRepo.findTop5ByOrderByCreatedAtDesc()) {
            String verb = switch (po.getStatus()) {
                case APPROVED         -> "approved purchase order";
                case PENDING_APPROVAL -> "submitted purchase order";
                case RECEIVED         -> "received goods for";
                case IN_TRANSIT       -> "shipment dispatched for";
                case CANCELLED        -> "cancelled purchase order";
            };
            String actor = po.getSupplier() != null ? po.getSupplier().getName() : "System";
            stamped.add(new Stamped(
                    po.getCreatedAt(),
                    DashboardDto.ActivityItem.builder()
                            .user(actor)
                            .action(verb + " " + po.getPoNumber())
                            .time(timeAgo(po.getCreatedAt()))
                            .type("approval")
                            .build()
            ));
        }

        // Sales orders — confirmed fields: orderNumber, status, customer.name,
        //                                  total, createdAt
        for (SalesOrder so : salesRepo.findTop5ByOrderByCreatedAtDesc()) {
            String verb = switch (so.getStatus()) {
                case PROCESSING -> "created order";
                case PICKING    -> "picking started for";
                case FULFILLED  -> "fulfilled order";
                case QUOTED     -> "quoted order";
                case CANCELLED  -> "cancelled order";
            };
            String customer = so.getCustomer() != null ? so.getCustomer().getName() : "Unknown";
            stamped.add(new Stamped(
                    so.getCreatedAt(),
                    DashboardDto.ActivityItem.builder()
                            .user(customer)
                            .action(verb + " " + so.getOrderNumber()
                                    + " (KES " + so.getTotal().toPlainString() + ")")
                            .time(timeAgo(so.getCreatedAt()))
                            .type("invoice")
                            .build()
            ));
        }

        // Support tickets — confirmed fields: ticketNumber, status,
        //                                     customer.name, updatedAt
        for (SupportTicket t : ticketRepo.findTop5ByOrderByUpdatedAtDesc()) {
            String verb = switch (t.getStatus()) {
                case OPEN        -> "opened";
                case IN_PROGRESS -> "updated";
                case RESOLVED    -> "resolved";
                case CLOSED      -> "closed";
            };
            String actor = t.getCustomer() != null ? t.getCustomer().getName() : "System";
            stamped.add(new Stamped(
                    t.getUpdatedAt(),
                    DashboardDto.ActivityItem.builder()
                            .user(actor)
                            .action(verb + " support ticket " + t.getTicketNumber())
                            .time(timeAgo(t.getUpdatedAt()))
                            .type("crm")
                            .build()
            ));
        }

        // Sort all events newest-first, assign sequential IDs, return top 6
        return stamped.stream()
                .sorted(Comparator.comparing(Stamped::at,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(6)
                .map(s -> {
                    // IDs are positional — fine for a feed, no need for DB ids
                    return s.item();
                })
                .collect(Collectors.toList());
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private String timeAgo(LocalDateTime dt) {
        if (dt == null) return "recently";
        long minutes = ChronoUnit.MINUTES.between(dt, LocalDateTime.now());
        if (minutes < 1)  return "just now";
        if (minutes < 60) return minutes + "m ago";
        long hours = ChronoUnit.HOURS.between(dt, LocalDateTime.now());
        if (hours < 24)   return hours + "h ago";
        long days  = ChronoUnit.DAYS.between(dt, LocalDateTime.now());
        return days + "d ago";
    }
}