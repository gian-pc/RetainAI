package com.retainai.controller;

import com.retainai.dto.BatchPredictionResponseDTO;
import com.retainai.dto.PredictionResponseDto;
import com.retainai.service.CsvService;
import com.retainai.service.PythonIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class PredictionController {

    private final PythonIntegrationService pythonIntegrationService;
    private final CsvService csvService;

    /**
     * Predicción individual
     * POST: /api/customers/{id}/predict
     */
    @PostMapping("/{id}/predict")
    public ResponseEntity<PredictionResponseDto> predictChurn(@PathVariable String id) {
        log.info("🔮 Predicción individual para cliente: {}", id);
        PredictionResponseDto response = pythonIntegrationService.predictChurnForCustomer(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Predicción por lotes (Batch Prediction)
     * POST: /api/customers/predict/batch
     * 
     * Acepta un archivo CSV con customer_ids y retorna predicciones para todos
     */
    @PostMapping("/predict/batch")
    public ResponseEntity<BatchPredictionResponseDTO> predictBatch(
            @RequestParam("file") MultipartFile file) {

        log.info("📦 Iniciando predicción batch para archivo: {}", file.getOriginalFilename());

        // 1. Validar archivo
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archivo vacío");
        }

        if (!file.getOriginalFilename().endsWith(".csv")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se aceptan archivos CSV");
        }

        try {
            // 2. Parsear CSV y extraer customer IDs
            List<String> customerIds = csvService.parseCustomerIds(file);
            log.info("📋 Procesando {} clientes", customerIds.size());

            // 3. Obtener predicciones para cada cliente
            List<BatchPredictionResponseDTO.PredictionResult> results = new ArrayList<>();
            int successCount = 0;
            int errorCount = 0;

            for (String customerId : customerIds) {
                try {
                    // Llamar al servicio de predicción
                    PredictionResponseDto prediction = pythonIntegrationService.predictChurnForCustomer(customerId);

                    // Crear resultado exitoso
                    BatchPredictionResponseDTO.PredictionResult result = BatchPredictionResponseDTO.PredictionResult
                            .builder()
                            .customerId(customerId)
                            .risk(prediction.getRisk())
                            .probability(prediction.getProbability())
                            .mainFactor(prediction.getMainFactor())
                            .nextBestAction(prediction.getNextBestAction())
                            .error(null)
                            .build();

                    results.add(result);
                    successCount++;

                } catch (Exception e) {
                    // Crear resultado con error
                    BatchPredictionResponseDTO.PredictionResult result = BatchPredictionResponseDTO.PredictionResult
                            .builder()
                            .customerId(customerId)
                            .risk(null)
                            .probability(null)
                            .mainFactor(null)
                            .nextBestAction(null)
                            .error(e.getMessage())
                            .build();

                    results.add(result);
                    errorCount++;

                    log.warn("⚠️  Error procesando cliente {}: {}", customerId, e.getMessage());
                }
            }

            // 4. Construir respuesta
            BatchPredictionResponseDTO response = BatchPredictionResponseDTO.builder()
                    .totalProcessed(customerIds.size())
                    .successCount(successCount)
                    .errorCount(errorCount)
                    .results(results)
                    .build();

            log.info("✅ Batch completado: {} éxitos, {} errores", successCount, errorCount);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error procesando archivo CSV", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error procesando archivo: " + e.getMessage());
        }
    }

    /**
     * Predicción directa con datos completos (sin consultar BD)
     * POST: /api/customers/predict/direct
     *
     * Acepta un CSV con las 24 columnas completas y predice directamente
     */
    @PostMapping("/predict/direct")
    public ResponseEntity<BatchPredictionResponseDTO> predictDirect(
            @RequestParam("file") MultipartFile file) {

        log.info("🆕 Predicción directa para clientes nuevos: {}", file.getOriginalFilename());

        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archivo vacío");
        }

        if (!file.getOriginalFilename().endsWith(".csv")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se aceptan archivos CSV");
        }

        try {
            // Parsear CSV con datos completos y enviar a Python
            BatchPredictionResponseDTO response = csvService.parseAndPredictDirect(file);

            log.info("✅ Predicción directa completada: {} éxitos, {} errores",
                response.getSuccessCount(), response.getErrorCount());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error en predicción directa", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error procesando archivo: " + e.getMessage());
        }
    }
}