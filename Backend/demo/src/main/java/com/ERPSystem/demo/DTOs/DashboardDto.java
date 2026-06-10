package com.ERPSystem.demo.DTOs;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

public class DashboardDto {
    @Getter
    @Setter
    @Builder
    public static class KpiResponse {
        private BigDecimal ytdRevenue;
        private long totalOrders;
        private long activeCustomers;
        private long totalInventoryUnits;
        private long lowStockCount;
        private long overdueInvoices;
        private long pendingApprovals;
        private long openTickets;
    }
    @Getter @Setter @Builder
    public static class RevenuePoint {
        private String month;       // "Jan", "Feb", …
        private BigDecimal revenue;
        private BigDecimal expenses;
        private BigDecimal profit;
    }

    @Getter @Setter @Builder
    public static class RegionShare {
        private String name;        // region name
        private double value;       // percentage share, e.g. 42.0
    }

    @Getter @Setter @Builder
    public static class InventoryCategory {
        private String category;
        private long inStock;
        private long lowStock;
        private long outOfStock;
    }

    @Getter @Setter @Builder
    public static class ActivityItem {
        private Long id;
        private String user;
        private String action;
        private String time;
        private String type;
    }

}
