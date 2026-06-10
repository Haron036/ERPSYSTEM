package com.ERPSystem.demo.Controller;

import com.ERPSystem.demo.DTOs.DashboardDto;
import com.ERPSystem.demo.Services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/kpis")
    public ResponseEntity<DashboardDto.KpiResponse> getKpis() {
        return ResponseEntity.ok(dashboardService.getKpis());
    }
    @GetMapping("/revenue-series")
    public ResponseEntity<List<DashboardDto.RevenuePoint>> getRevenueSeries() {
        return ResponseEntity.ok(dashboardService.getRevenueSeries());
    }

    @GetMapping("/sales-by-region")
    public ResponseEntity<List<DashboardDto.RegionShare>> getSalesByRegion() {
        return ResponseEntity.ok(dashboardService.getSalesByRegion());
    }

    @GetMapping("/inventory-status")
    public ResponseEntity<List<DashboardDto.InventoryCategory>> getInventoryStatus() {
        return ResponseEntity.ok(dashboardService.getInventoryStatus());
    }

    @GetMapping("/recent-activities")
    public ResponseEntity<List<DashboardDto.ActivityItem>> getRecentActivities() {
        return ResponseEntity.ok(dashboardService.getRecentActivities());
    }
}
