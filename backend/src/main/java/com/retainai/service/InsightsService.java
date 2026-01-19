package com.retainai.service;

import com.retainai.dto.ContractAnalysisDTO;
import com.retainai.dto.CustomerSegmentDTO;
import com.retainai.dto.PredictionResponseDto;
import com.retainai.dto.PriorityInsightDto;
import com.retainai.dto.SupportAnalysisDTO;
import com.retainai.model.Customer;
import com.retainai.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InsightsService {

    private final CustomerRepository customerRepository;
    private final PythonIntegrationService pythonService;
    private final PredictionCacheService predictionCacheService;

    /**
     * Genera insights prioritarios analizando CLIENTES ACTIVOS en riesgo de
     * abandonar.
     *
     * IMPORTANTE:
     * - Solo analiza clientes ACTIVOS (abandonoHistorico = false)
     * - NO incluye clientes que YA ABANDONARON (esos son para win-back, no
     * retención)
     * - El modelo IA predice probabilidad de churn futuro (0-100%)
     * - Cachea resultados por 15 minutos
     */
    @Cacheable(value = "priorityInsights", unless = "#result == null || #result.isEmpty()")
    public List<PriorityInsightDto> generatePriorityInsights(int limit) {
        log.info("🎯 Generando {} insights prioritarios (solo clientes ACTIVOS)...", limit);

        // 1. Obtener muestra MÁS PEQUEÑA de clientes ACTIVOS para mejorar performance
        // Reducimos de 3x a 2x para menos llamadas ML
        int candidateLimit = Math.min(limit * 2, 100); // Máximo 100 candidatos
        List<Customer> highRiskCustomers = customerRepository.findHighRiskCustomers(
                PageRequest.of(0, candidateLimit));

        log.info("📋 Encontrados {} candidatos de alto riesgo", highRiskCustomers.size());

        // 2. Analizar cada cliente con IA (con caché y early break)
        List<PriorityInsightDto> insights = new ArrayList<>();
        int processedCount = 0;
        int maxProcessAttempts = candidateLimit; // Limitar iteraciones

        for (Customer customer : highRiskCustomers) {
            // ⚡ OPTIMIZACIÓN: Break early si ya tenemos suficientes
            if (insights.size() >= limit) {
                log.info("✅ Ya tenemos {} insights, deteniendo análisis", insights.size());
                break;
            }

            // ⚡ OPTIMIZACIÓN: Limitar intentos de procesamiento
            if (processedCount++ >= maxProcessAttempts) {
                log.warn("⚠️ Alcanzado límite de {} intentos de procesamiento", maxProcessAttempts);
                break;
            }

            try {
                // Solo analizar clientes activos (no abandonados)
                boolean isActive = customer.getMetrics() == null ||
                        !Boolean.TRUE.equals(customer.getMetrics().getAbandonoHistorico());

                if (!isActive) {
                    continue; // Skip clientes que ya abandonaron
                }

                // Llamar a IA para análisis (CON CACHÉ)
                PredictionResponseDto prediction = null;
                try {
                    prediction = predictionCacheService.getPrediction(customer.getId());
                } catch (Exception mlError) {
                    // Si falla ML, continuar con siguiente cliente en lugar de romper todo
                    log.warn("⚠️ Error ML para cliente {}: {}", customer.getId(), mlError.getMessage());
                    continue;
                }

                // Solo incluir si el riesgo es Medium o High
                if (prediction != null &&
                        (prediction.getRisk().equals("High") || prediction.getRisk().equals("Medium"))) {

                    // Calcular priority score (0-100)
                    Double priorityScore = calculatePriorityScore(customer, prediction);

                    PriorityInsightDto insight = PriorityInsightDto.builder()
                            .customerId(customer.getId())
                            .customerName(customer.getId().substring(0, 8)) // Simplificado
                            .ciudad(customer.getCiudad())
                            .segmento(customer.getSegmento())
                            .risk(prediction.getRisk())
                            .probability(prediction.getProbability())
                            .mainFactor(prediction.getMainFactor())
                            .nextBestAction(prediction.getNextBestAction())
                            .monthlyRevenue(
                                    customer.getSubscription() != null ? customer.getSubscription().getCuotaMensual()
                                            : 0.0)
                            .tenure(customer.getSubscription() != null
                                    ? customer.getSubscription().getMesesPermanencia()
                                    : 0)
                            .contractType(
                                    customer.getSubscription() != null ? customer.getSubscription().getTipoContrato()
                                            : "N/A")
                            .priorityScore(priorityScore)
                            .build();

                    insights.add(insight);
                }

            } catch (Exception e) {
                log.warn("⚠️ Error analizando cliente {}: {}", customer.getId(), e.getMessage());
                // Continuar con el siguiente
            }
        }

        // 3. Ordenar por probabilidad de churn (descendente) - clientes con mayor
        // riesgo primero
        List<PriorityInsightDto> sorted = insights.stream()
                .sorted(Comparator.comparing(PriorityInsightDto::getProbability).reversed())
                .limit(limit)
                .collect(Collectors.toList());

        log.info("✅ Generados {} insights prioritarios", sorted.size());
        return sorted;
    }

    /**
     * Calcula score de prioridad simplemente como:
     * IMPACTO FINANCIERO = Probabilidad de Churn (IA) × Revenue Mensual (Real)
     *
     * Ejemplo:
     * - Cliente con 80% churn y $100/mes = Score: 80
     * - Cliente con 50% churn y $200/mes = Score: 100
     *
     * Esto prioriza clientes donde la pérdida es más costosa.
     * Todo lo demás (tenure, contrato, NPS, etc.) ya está en la probabilidad de la
     * IA.
     */
    private Double calculatePriorityScore(Customer customer, PredictionResponseDto prediction) {
        // La IA ya analizó TODO (tenure, contrato, NPS, tickets, etc.)
        // Solo necesitamos multiplicar por el impacto financiero
        double churnProbability = prediction.getProbability(); // 0-1

        double monthlyRevenue = 0.0;
        if (customer.getSubscription() != null && customer.getSubscription().getCuotaMensual() != null) {
            monthlyRevenue = customer.getSubscription().getCuotaMensual();
        }

        // Score = Probabilidad × Revenue
        // Representa la pérdida esperada mensual
        double score = churnProbability * monthlyRevenue;

        return Math.round(score * 100.0) / 100.0;
    }

    /**
     * Limpia el caché de insights
     */
    @CacheEvict(value = "priorityInsights", allEntries = true)
    public void clearCache() {
        log.info("🗑️  Cache de insights limpiado");
    }

    // ========== NUEVOS MÉTODOS PARA BI ANALYTICS ==========

    /**
     * Obtiene análisis de contratos (Mensual vs Anual vs Bienal)
     */
    public List<ContractAnalysisDTO> getContractAnalysis() {
        log.info("📊 Obteniendo análisis de contratos desde MySQL");

        List<Object[]> results = customerRepository.getContractAnalysis();

        return results.stream()
                .map(row -> ContractAnalysisDTO.builder()
                        .contractType((String) row[0])
                        .customers(((Number) row[1]).intValue())
                        .churnRate(((Number) row[2]).doubleValue())
                        .avgRevenue(((Number) row[3]).doubleValue())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Obtiene análisis de soporte por tickets
     */
    public List<SupportAnalysisDTO> getSupportAnalysis() {
        log.info("🎫 Obteniendo análisis de soporte desde MySQL");

        List<Object[]> results = customerRepository.getSupportAnalysis();

        return results.stream()
                .map(row -> SupportAnalysisDTO.builder()
                        .ticketRange((String) row[0])
                        .customers(((Number) row[1]).intValue())
                        .churnRate(((Number) row[2]).doubleValue())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Obtiene segmentación de clientes por revenue y riesgo
     */
    public List<CustomerSegmentDTO> getCustomerSegmentation() {
        log.info("🎯 Obteniendo segmentación de clientes desde MySQL");

        List<Object[]> results = customerRepository.getCustomerSegmentation();

        return results.stream()
                .map(row -> {
                    String segment = (String) row[0];
                    return CustomerSegmentDTO.builder()
                            .segment(segment)
                            .customers(((Number) row[1]).intValue())
                            .avgRevenue(((Number) row[2]).doubleValue())
                            .churnRate(((Number) row[3]).doubleValue())
                            .riskLevel(getRiskLevel(segment))
                            .strategy(getStrategy(segment))
                            .build();
                })
                .collect(Collectors.toList());
    }

    private String getRiskLevel(String segment) {
        return switch (segment) {
            case "BASIC" -> "MEDIUM";
            case "MEDIUM" -> "HIGH";
            case "PREMIUM" -> "LOW";
            default -> "UNKNOWN";
        };
    }

    private String getStrategy(String segment) {
        return switch (segment) {
            case "BASIC" -> "Automatización y self-service";
            case "MEDIUM" -> "Conversión a contratos anuales + Account Manager";
            case "PREMIUM" -> "Mantener excelencia + Upselling";
            default -> "N/A";
        };
    }
}
