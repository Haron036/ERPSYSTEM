package com.ERPSystem.demo.Controller;

import com.ERPSystem.demo.DTOs.DashboardDto;
import com.ERPSystem.demo.Services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/kpis")
    public ResponseEntity<DashboardDto.KpiResponse> getKpis() {
        return ResponseEntity.ok(dashboardService.getKpis());
    }
}
