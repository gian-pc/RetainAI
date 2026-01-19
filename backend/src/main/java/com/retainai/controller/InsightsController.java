package com.retainai.controller;

import com.retainai.dto.PriorityInsightDto;
import com.retainai.service.InsightsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class InsightsController {

    private final InsightsService insightsService;

    /**
     * Obtiene los insights prioritarios del día
     * Analiza automáticamente los clientes de mayor riesgo y retorna acciones recomendadas
     *
     * @param limit Número de insights a retornar (default: 50)
     * @return Lista de insights ordenados por probabilidad de churn (mayor a menor)
     */
    @GetMapping("/priority")
    public ResponseEntity<List<PriorityInsightDto>> getPriorityInsights(
            @RequestParam(defaultValue = "50") int limit) {

        log.info("📊 Solicitando {} insights prioritarios", limit);

        try {
            List<PriorityInsightDto> insights = insightsService.generatePriorityInsights(limit);
            log.info("✅ Generados {} insights prioritarios", insights.size());
            return ResponseEntity.ok(insights);

        } catch (Exception e) {
            log.error("❌ Error generando insights prioritarios", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Fuerza un refresh del análisis (limpia caché)
     */
    @PostMapping("/refresh")
    public ResponseEntity<String> refreshInsights() {
        log.info("🔄 Forzando refresh de insights...");
        insightsService.clearCache();
        return ResponseEntity.ok("Cache cleared. Next request will regenerate insights.");
    }
}
