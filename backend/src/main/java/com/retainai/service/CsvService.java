package com.retainai.service;

import com.retainai.dto.BatchPredictionResponseDTO;
import com.retainai.dto.PredictionInputDtoV2;
import com.retainai.dto.PredictionResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CsvService {

    private final RestTemplate restTemplate;

    @Value("${app.python-service.url}")
    private String pythonUrl;

    /**
     * Parsea un archivo CSV y extrae los IDs de clientes
     * Formato esperado: primera columna = customer_id
     */
    public List<String> parseCustomerIds(MultipartFile file) throws IOException {
        List<String> customerIds = new ArrayList<>();

        log.info("📄 Parseando archivo CSV: {}", file.getOriginalFilename());

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream()))) {

            String line;
            boolean isHeader = true;
            int lineNumber = 0;

            while ((line = reader.readLine()) != null) {
                lineNumber++;

                // Skip header
                if (isHeader) {
                    isHeader = false;
                    log.info("   Header: {}", line);
                    continue;
                }

                // Parse line
                String[] columns = line.split(",");
                if (columns.length > 0 && !columns[0].trim().isEmpty()) {
                    String customerId = columns[0].trim();
                    customerIds.add(customerId);
                    log.debug("   Línea {}: {}", lineNumber, customerId);
                }
            }
        }

        log.info("✅ Parseados {} customer IDs", customerIds.size());
        return customerIds;
    }

    /**
     * Parsea un CSV con datos completos y hace predicción directa sin consultar BD
     * Formato esperado: 24 columnas del modelo
     */
    public BatchPredictionResponseDTO parseAndPredictDirect(MultipartFile file) throws IOException {
        List<BatchPredictionResponseDTO.PredictionResult> results = new ArrayList<>();
        int successCount = 0;
        int errorCount = 0;

        log.info("📄 Parseando CSV con datos completos: {}", file.getOriginalFilename());

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream()))) {

            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new IOException("CSV vacío");
            }

            log.info("   Header: {}", headerLine);
            String[] headers = headerLine.split(",");

            String line;
            int lineNumber = 1;

            while ((line = reader.readLine()) != null) {
                lineNumber++;
                try {
                    String[] values = line.split(",");

                    if (values.length < 25) {
                        throw new IllegalArgumentException("Se esperan 25 columnas (1 ID + 24 features), se recibieron " + values.length);
                    }

                    // Construir DTO con los valores del CSV (índice 0 = customer_id, 1-24 = features)
                    PredictionInputDtoV2 payload = PredictionInputDtoV2.builder()
                            .scoreRiesgo(parseDouble(values[1]))
                            .diasActivosSemanales(parseInt(values[2]))
                            .promedioConexion(parseDouble(values[3]))
                            .conexionesMensuales(parseInt(values[4]))
                            .caracteristicasUsadas(parseInt(values[5]))
                            .diasUltimaConexion(parseInt(values[6]))
                            .intensidadUso(parseDouble(values[7]))
                            .ticketsSoporte(parseInt(values[8]))
                            .puntuacionNps(parseDouble(values[9]))
                            .tasaCrecimientoUso(parseDouble(values[10]))
                            .puntuacionCsat(parseDouble(values[11]))
                            .ratioCargaFinanciera(parseDouble(values[12]))
                            .tasaAperturaEmail(parseDouble(values[13]))
                            .erroresPago(parseInt(values[14]))
                            .antiguedad(parseInt(values[15]))
                            .ingresosTotales(parseDouble(values[16]))
                            .latitud(parseDouble(values[17]))
                            .cargoMensual(parseDouble(values[18]))
                            .tiempoResolucion(parseDouble(values[19]))
                            .longitud(parseDouble(values[20]))
                            .codigoPostal(values[21])
                            .edad(parseInt(values[22]))
                            .diasDesdeUltimoContacto(parseInt(values[23]))
                            .tiempoSesionPromedio(parseDouble(values[24]))
                            .build();

                    // Llamar a Python
                    PredictionResponseDto prediction = restTemplate.postForObject(
                            pythonUrl + "/predict",
                            payload,
                            PredictionResponseDto.class);

                    // Agregar resultado exitoso
                    results.add(BatchPredictionResponseDTO.PredictionResult.builder()
                            .customerId(values[0])
                            .risk(prediction.getNivelRiesgo())
                            .probability(prediction.getProbability())
                            .mainFactor(prediction.getMainFactor())
                            .nextBestAction(prediction.getNextBestAction())
                            .error(null)
                            .build());

                    successCount++;
                    log.info("   ✅ Línea {}: {} - {} ({}%)", lineNumber, values[0], prediction.getNivelRiesgo(),
                            String.format("%.1f", prediction.getProbability() * 100));

                } catch (Exception e) {
                    errorCount++;
                    results.add(BatchPredictionResponseDTO.PredictionResult.builder()
                            .customerId("Línea " + lineNumber)
                            .error(e.getMessage())
                            .build());
                    log.warn("   ⚠️  Error en línea {}: {}", lineNumber, e.getMessage());
                }
            }
        }

        log.info("✅ Predicción directa completada: {} éxitos, {} errores", successCount, errorCount);

        return BatchPredictionResponseDTO.builder()
                .totalProcessed(successCount + errorCount)
                .successCount(successCount)
                .errorCount(errorCount)
                .results(results)
                .build();
    }

    private Double parseDouble(String value) {
        if (value == null || value.trim().isEmpty()) return 0.0;
        return Double.parseDouble(value.trim());
    }

    private Integer parseInt(String value) {
        if (value == null || value.trim().isEmpty()) return 0;
        return Integer.parseInt(value.trim());
    }
}
