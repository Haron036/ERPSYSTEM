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
}
