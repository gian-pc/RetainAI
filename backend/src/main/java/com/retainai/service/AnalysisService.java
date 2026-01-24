package com.retainai.service;

import com.retainai.dto.AnalysisResponseDto;
import com.retainai.dto.PredictionInputDtoV2;
import com.retainai.dto.PredictionResponseDto;
import com.retainai.model.AiPrediction;
import com.retainai.model.Customer;
import com.retainai.model.CustomerMetrics;
import com.retainai.model.Subscription;
import com.retainai.repository.CustomerRepository;
import com.retainai.repository.PredictionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisService {

        private final CustomerRepository customerRepository;
        private final PredictionRepository predictionRepository;
        private final RestTemplate restTemplate;

        @Value("${app.python-service.url}")
        private String pythonUrl;

        /**
         * Analiza TODOS los clientes usando predicción BATCH (optimizado)
         * Envía todos los clientes en UNA SOLA llamada a Python
         * Tiempo estimado: 1-2 minutos para 9,701 clientes
         */
        @Transactional
        public AnalysisResponseDto analyzeAllCustomers() {
                log.info("🚀 Iniciando análisis completo de clientes (BATCH OPTIMIZADO)...");

                LocalDateTime startTime = LocalDateTime.now();

                // 1. Obtener TODOS los clientes con sus datos relacionados
                List<Customer> customers = customerRepository.findAll();
                log.info("📊 Clientes a analizar: {}", customers.size());

                // 2. Convertir todos los clientes a PredictionInputDtoV2
                log.info("📦 Preparando datos para envío batch...");
                List<PredictionInputDtoV2> batchInput = new ArrayList<>();
                List<Customer> validCustomers = new ArrayList<>();

                for (Customer customer : customers) {
                        try {
                                if (customer.getSubscription() == null) {
                                        log.warn("⚠️  Cliente {} sin suscripción, saltando", customer.getId());
                                        continue;
                                }

                                PredictionInputDtoV2 input = mapToFlatJsonV2(customer);
                                batchInput.add(input);
                                validCustomers.add(customer);

                        } catch (Exception e) {
                                log.error("❌ Error mapeando cliente {}: {}", customer.getId(), e.getMessage());
                        }
                }

                log.info("✅ Datos preparados: {} clientes válidos", batchInput.size());

                // 3. Llamar a Python con BATCH (UNA SOLA llamada HTTP)
                log.info("📡 Enviando batch a Python: {}/predict/batch", pythonUrl);

                List<PredictionResponseDto> predictions;
                try {
                        HttpEntity<List<PredictionInputDtoV2>> request = new HttpEntity<>(batchInput);

                        ResponseEntity<List<PredictionResponseDto>> response = restTemplate.exchange(
                                        pythonUrl + "/predict/batch",
                                        HttpMethod.POST,
                                        request,
                                        new ParameterizedTypeReference<List<PredictionResponseDto>>() {
                                        });

                        predictions = response.getBody();
                        log.info("✅ Predicciones recibidas de Python: {}", predictions.size());

                } catch (Exception e) {
                        log.error("❌ Error llamando a Python batch: {}", e.getMessage(), e);
                        return AnalysisResponseDto.builder()
                                        .startTime(startTime)
                                        .endTime(LocalDateTime.now())
                                        .totalCustomers(customers.size())
                                        .failedPredictions(customers.size())
                                        .message("Error al comunicarse con el servicio de IA: " + e.getMessage())
                                        .build();
                }

                // 4. Guardar todas las predicciones en BD
                log.info("💾 Guardando predicciones en base de datos...");
                int highRisk = 0;
                int mediumRisk = 0;
                int lowRisk = 0;
                int successCount = 0;

                for (int i = 0; i < predictions.size(); i++) {
                        try {
                                PredictionResponseDto pred = predictions.get(i);
                                Customer customer = validCustomers.get(i);

                                AiPrediction aiPrediction = AiPrediction.builder()
                                                .customer(customer)
                                                .probabilidadFuga(pred.getProbability())
                                                .motivoPrincipal(pred.getMainFactor())
                                                .fechaAnalisis(LocalDateTime.now())
                                                .build();

                                // Guardar predicción (@PrePersist calcula nivel_riesgo automáticamente)
                                AiPrediction savedPrediction = predictionRepository.save(aiPrediction);

                                // Contar por nivel de riesgo (ya calculado por @PrePersist)
                                if (savedPrediction.getNivelRiesgo() != null) {
                                        switch (savedPrediction.getNivelRiesgo()) {
                                                case "Alto" -> highRisk++;
                                                case "Medio" -> mediumRisk++;
                                                case "Bajo" -> lowRisk++;
                                        }
                                }

                                successCount++;

                                if (successCount % 1000 == 0) {
                                        log.info("   💾 Guardados {}/{} clientes", successCount, predictions.size());
                                }

                        } catch (Exception e) {
                                log.error("❌ Error guardando predicción {}: {}", i, e.getMessage());
                        }
                }

                LocalDateTime endTime = LocalDateTime.now();
                long durationSeconds = ChronoUnit.SECONDS.between(startTime, endTime);

                log.info("🎉 Análisis completado en {} segundos", durationSeconds);
                log.info("📊 Distribución: High={}, Medium={}, Low={}", highRisk, mediumRisk, lowRisk);

                return AnalysisResponseDto.builder()
                                .startTime(startTime)
                                .endTime(endTime)
                                .totalCustomers(customers.size())
                                .successfulPredictions(successCount)
                                .failedPredictions(validCustomers.size() - successCount)
                                .highRiskCount(highRisk)
                                .mediumRiskCount(mediumRisk)
                                .lowRiskCount(lowRisk)
                                .message(String.format("Análisis completado en %d segundos: %d clientes procesados",
                                                durationSeconds, successCount))
                                .build();
        }

        /**
         * Mapea Customer a PredictionInputDtoV2 (copiado de PythonIntegrationService)
         */
        private PredictionInputDtoV2 mapToFlatJsonV2(Customer c) {
                Subscription sub = c.getSubscription();
                CustomerMetrics metrics = c.getMetrics();

                // Calcular campos derivados
                Double conexiones = metrics != null && metrics.getConeccionesMensuales() != null
                                ? metrics.getConeccionesMensuales().doubleValue()
                                : 0.0;
                Double promedioConex = metrics != null && metrics.getPromedioConeccion() != null
                                ? metrics.getPromedioConeccion().doubleValue()
                                : 0.0;
                Double intensidadUso = conexiones * promedioConex;

                Double cargoMensual = sub.getCuotaMensual() != null ? sub.getCuotaMensual() : 50.0;
                Double ingresosTotales = sub.getIngresosTotales() != null ? sub.getIngresosTotales() : 100.0;
                Double ratioCarga = ingresosTotales > 0 ? cargoMensual / ingresosTotales : 0.0;

                Integer diasDesdeContacto = 0;
                if (metrics != null && metrics.getUltimoContactoSoporte() != null) {
                        diasDesdeContacto = (int) ChronoUnit.DAYS.between(
                                        metrics.getUltimoContactoSoporte(),
                                        LocalDate.now());
                }

                return PredictionInputDtoV2.builder()
                                // scoreRiesgo eliminado - modelo reentrenado sin data leakage (23 features)
                                .diasActivosSemanales(metrics != null && metrics.getDiasActivosSemanales() != null
                                                ? metrics.getDiasActivosSemanales()
                                                : 0)
                                .promedioConexion(promedioConex)
                                .conexionesMensuales(metrics != null && metrics.getConeccionesMensuales() != null
                                                ? metrics.getConeccionesMensuales()
                                                : 0)
                                .caracteristicasUsadas(metrics != null && metrics.getCaracteristicasUsadas() != null
                                                ? metrics.getCaracteristicasUsadas()
                                                : 0)
                                .diasUltimaConexion(metrics != null && metrics.getDiasUltimaConeccion() != null
                                                ? metrics.getDiasUltimaConeccion()
                                                : 0)
                                .intensidadUso(intensidadUso)
                                .ticketsSoporte(metrics != null && metrics.getTicketsSoporte() != null
                                                ? metrics.getTicketsSoporte()
                                                : 0)
                                .puntuacionNps(metrics != null && metrics.getScoreNps() != null
                                                ? metrics.getScoreNps().doubleValue()
                                                : 50.0)
                                .tasaCrecimientoUso(metrics != null && metrics.getTasaCrecimientoUso() != null
                                                ? metrics.getTasaCrecimientoUso().doubleValue()
                                                : 0.0)
                                .puntuacionCsat(metrics != null && metrics.getScoreCsat() != null
                                                ? metrics.getScoreCsat().doubleValue()
                                                : 3.0)
                                .ratioCargaFinanciera(ratioCarga)
                                .tasaAperturaEmail(metrics != null && metrics.getTasaAperturaEmail() != null
                                                ? metrics.getTasaAperturaEmail().doubleValue()
                                                : 0.5)
                                .erroresPago(sub.getErroresPago() != null ? sub.getErroresPago() : 0)
                                .antiguedad(sub.getMesesPermanencia() != null ? sub.getMesesPermanencia() : 1)
                                .ingresosTotales(ingresosTotales)
                                .latitud(c.getLatitud() != null ? c.getLatitud() : 0.0)
                                .cargoMensual(cargoMensual)
                                .tiempoResolucion(metrics != null && metrics.getTiempoResolucion() != null
                                                ? metrics.getTiempoResolucion().doubleValue()
                                                : 24.0)
                                .longitud(c.getLongitud() != null ? c.getLongitud() : 0.0)
                                .codigoPostal(c.getCodigoPostal() != null ? c.getCodigoPostal() : "00000")
                                .edad(c.getEdad() != null ? c.getEdad() : 30)
                                .diasDesdeUltimoContacto(diasDesdeContacto)
                                .tiempoSesionPromedio(metrics != null && metrics.getTiempoSesionPromedio() != null
                                                ? metrics.getTiempoSesionPromedio().doubleValue()
                                                : 0.0)
                                .build();
        }
}
