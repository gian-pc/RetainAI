package com.retainai.controller;

import com.retainai.dto.AnalysisResponseDto;
import com.retainai.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalysisController {

    private final AnalysisService analysisService;

    /**
     * Endpoint para analizar TODOS los clientes y guardar predicciones en ai_predictions
     * POST: /api/predictions/analyze-all
     *
     * Este endpoint:
     * 1. Obtiene todos los clientes de la BD
     * 2. Llama al modelo de IA para predecir cada uno
     * 3. Guarda los resultados en ai_predictions con timestamp
     * 4. Retorna estadísticas del análisis
     */
    @PostMapping("/analyze-all")
    public ResponseEntity<AnalysisResponseDto> analyzeAllCustomers() {
        log.info("📡 [API] Solicitud recibida: Analizar todos los clientes");

        try {
            AnalysisResponseDto response = analysisService.analyzeAllCustomers();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error ejecutando análisis completo: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(AnalysisResponseDto.builder()
                            .message("Error ejecutando análisis: " + e.getMessage())
                            .build());
        }
    }
}
