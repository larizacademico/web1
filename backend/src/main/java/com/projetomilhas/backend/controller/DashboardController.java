package com.projetomilhas.backend.controller;

import com.projetomilhas.backend.dto.dashboard.CreditoPrevistoResponse;
import com.projetomilhas.backend.dto.dashboard.DashboardResumoResponse;
import com.projetomilhas.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/resumo")
    public ResponseEntity<DashboardResumoResponse> getResumo(Principal principal) {
        return ResponseEntity.ok(dashboardService.getResumo(principal.getName()));
    }

    @GetMapping("/pontos-por-programa")
    public ResponseEntity<List<Map<String, Object>>> getPontosPorPrograma(Principal principal) {
        return ResponseEntity.ok(dashboardService.getPontosPorPrograma(principal.getName()));
    }
}
