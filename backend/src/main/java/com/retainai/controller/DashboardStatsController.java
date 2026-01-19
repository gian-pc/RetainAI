package com.retainai.controller;

import com.retainai.dto.ContractAnalysisDTO;
import com.retainai.dto.CustomerSegmentDTO;
import com.retainai.dto.DashboardStatsDto;
import com.retainai.dto.HeatmapPointDto;
import com.retainai.dto.SupportAnalysisDTO;
import com.retainai.service.BiDashboardService;
import com.retainai.service.DashboardService;
import com.retainai.service.InsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardStatsController {

    private final DashboardService stats;
    private final BiDashboardService biService;
    private final InsightsService insightsService;
    private final com.retainai.service.AlertsService alertsService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getDashBoardStats() {
        return ResponseEntity.ok(stats.getDashboardStats());
    }

    /**
     * Endpoint para obtener datos geográficos del heatmap de churn
     * GET /api/dashboard/heatmap
     * Retorna lista de puntos con coordenadas y nivel de riesgo
     */
    @GetMapping("/heatmap")
    public ResponseEntity<List<HeatmapPointDto>> getHeatmapData() {
        return ResponseEntity.ok(stats.getHeatmapData());
    }

    /**
     * Endpoint para obtener alertas críticas dinámicas
     * GET /api/dashboard/alerts
     * Retorna lista de alertas calculadas desde la BD
     */
    @GetMapping("/alerts")
    public ResponseEntity<List<com.retainai.dto.CriticalAlertDto>> getCriticalAlerts() {
        return ResponseEntity.ok(alertsService.getCriticalAlerts());
    }

    // ========== ENDPOINTS DE BI (consumen Python backend) ==========

    /**
     * Obtiene estadísticas de BI desde el backend de Python
     * GET /api/dashboard/bi/stats
     */
    @GetMapping("/bi/stats")
    public ResponseEntity<Map<String, Object>> getBiStats() {
        return ResponseEntity.ok(biService.getDashboardStatsFromPython());
    }

    /**
     * Obtiene análisis de segmentación
     * GET /api/dashboard/bi/segments
     */
    @GetMapping("/bi/segments")
    public ResponseEntity<Map<String, Object>> getSegments() {
        return ResponseEntity.ok(biService.getSegmentationData());
    }

    /**
     * Obtiene datos geográficos para análisis de churn por zona
     * GET /api/dashboard/bi/geographic
     */
    @GetMapping("/bi/geographic")
    public ResponseEntity<Map<String, Object>> getGeographic() {
        return ResponseEntity.ok(biService.getGeographicData());
    }

    /**
     * Obtiene alertas de clientes en riesgo crítico
     * GET /api/dashboard/bi/alerts
     */
    @GetMapping("/bi/alerts")
    public ResponseEntity<Map<String, Object>> getAlerts() {
        return ResponseEntity.ok(biService.getAlerts());
    }

    /**
     * Obtiene análisis de cohortes por antigüedad
     * GET /api/dashboard/bi/cohorts
     */
    @GetMapping("/bi/cohorts")
    public ResponseEntity<Map<String, Object>> getCohorts() {
        return ResponseEntity.ok(biService.getCohortAnalysis());
    }

    /**
     * Obtiene análisis de engagement por servicios
     * GET /api/dashboard/bi/engagement
     */
    @GetMapping("/bi/engagement")
    public ResponseEntity<Map<String, Object>> getEngagement() {
        return ResponseEntity.ok(biService.getEngagementAnalysis());
    }

    /**
     * Obtiene análisis de sensibilidad al precio
     * GET /api/dashboard/bi/pricing
     */
    @GetMapping("/bi/pricing")
    public ResponseEntity<Map<String, Object>> getPricing() {
        return ResponseEntity.ok(biService.getPriceSensitivity());
    }

    /**
     * Obtiene top clientes en riesgo
     * GET /api/dashboard/bi/top-risk?limit=100
     */
    @GetMapping("/bi/top-risk")
    public ResponseEntity<Map<String, Object>> getTopRisk(
            @RequestParam(defaultValue = "100") int limit) {
        return ResponseEntity.ok(biService.getTopRiskCustomers(limit));
    }

    // ========== NUEVOS ENDPOINTS (consultan MySQL directamente) ==========

    /**
     * Obtiene análisis de contratos (Mensual vs Anual vs Bienal)
     * GET /api/dashboard/bi/contracts
     * Consulta MySQL directamente
     */
    @GetMapping("/bi/contracts")
    public ResponseEntity<Map<String, List<ContractAnalysisDTO>>> getContractAnalysis() {
        List<ContractAnalysisDTO> contracts = insightsService.getContractAnalysis();
        return ResponseEntity.ok(Map.of("contracts", contracts));
    }

    /**
     * Obtiene análisis de soporte por tickets
     * GET /api/dashboard/bi/support
     * Consulta MySQL directamente
     */
    @GetMapping("/bi/support")
    public ResponseEntity<Map<String, List<SupportAnalysisDTO>>> getSupportAnalysis() {
        List<SupportAnalysisDTO> support = insightsService.getSupportAnalysis();
        return ResponseEntity.ok(Map.of("support_analysis", support));
    }

    /**
     * Obtiene segmentación de clientes por revenue y riesgo
     * GET /api/dashboard/bi/segmentation
     * Consulta MySQL directamente
     */
    @GetMapping("/bi/segmentation")
    public ResponseEntity<Map<String, List<CustomerSegmentDTO>>> getCustomerSegmentation() {
        List<CustomerSegmentDTO> segments = insightsService.getCustomerSegmentation();
        return ResponseEntity.ok(Map.of("segments", segments));
    }
}