package com.retainai.service;

import com.retainai.dto.DashboardStatsDto;
import com.retainai.dto.HeatmapPointDto;
import com.retainai.model.AiPrediction;
import com.retainai.model.Customer;
import com.retainai.model.Subscription;
import com.retainai.repository.CustomerRepository;
import com.retainai.repository.PredictionRepository;
import com.retainai.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor // <--- Inyección de dependencias moderna (Constructor)
public class DashboardService {

    // Al ser 'final', Lombok genera el constructor automáticamente
    private final CustomerRepository customerRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PredictionRepository predictionRepository;

    @Cacheable(value = "dashboardStats", unless = "#result == null")
    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        try {
            // Usamos tu método personalizado del repo
            long totalCustomers = customerRepository.countAll();

            if (totalCustomers == 0) {
                log.warn("No hay clientes en la base de datos.");
                return createEmptyStats();
            }

            long abandonedCustomers = customerRepository.countAbandonedCustomers();
            Double churnRate = calculateChurnRate(abandonedCustomers, totalCustomers);

            BigDecimal totalRevenue = subscriptionRepository.totalRevenue();
            BigDecimal churnRevenue = customerRepository.churnRevenue();

            // Calcular NPS promedio
            Double avgNpsScore = customerRepository.avgNpsScore();

            // NOTA: Eliminamos 'activeSubscriptionsRevenue' porque no se usaba en el DTO
            // y consumía recursos de la DB innecesariamente.

            return new DashboardStatsDto(
                    totalCustomers,
                    abandonedCustomers, // Incluir cantidad absoluta
                    churnRate,
                    totalRevenue,
                    churnRevenue,
                    avgNpsScore);

        } catch (Exception e) {
            log.error("Error calculando estadísticas del dashboard", e);
            return createEmptyStats();
        }
    }

    private Double calculateChurnRate(Long abandonedCustomers, Long totalCustomers) {
        if (totalCustomers == null || totalCustomers == 0 || abandonedCustomers == null) {
            return 0.0;
        }
        Double churnRate = (double) abandonedCustomers / totalCustomers * 100;
        // Redondeo a 2 decimales
        return Math.round(churnRate * 100.00) / 100.00;
    }

    private DashboardStatsDto createEmptyStats() {
        return new DashboardStatsDto(
                0L,
                0L, // abandonedCustomers
                0.0,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                0.0); // avgNpsScore
    }

    /**
     * Obtiene puntos geográficos para el mapa de calor de churn
     * Solo incluye clientes con coordenadas válidas
     * 🚀 OPTIMIZADO: Usa Map para lookup eficiente de predicciones (evita N+1)
     */
    @Transactional(readOnly = true)
    public List<HeatmapPointDto> getHeatmapData() {
        try {
            log.info("📍 Generando datos para heatmap geográfico...");

            // 1. Obtener todos los clientes con coordenadas
            List<Customer> customersWithCoords = customerRepository.findCustomersWithCoordinates();
            log.info("✅ Encontrados {} clientes con coordenadas", customersWithCoords.size());

            // TEMPORAL: Deshabilitado para evitar timeout
            // TODO: Optimizar query de predicciones o usar caché
            /*
             * // 2. Obtener SOLO la última predicción de cada cliente (query optimizada)
             * List<AiPrediction> latestPredictions =
             * predictionRepository.findLatestPredictionForEachCustomer();
             * log.info("✅ Encontradas {} predicciones", latestPredictions.size());
             * 
             * // 3. Crear Map para lookup O(1) - customerId -> AiPrediction
             * Map<String, AiPrediction> predictionMap = latestPredictions.stream()
             * .collect(Collectors.toMap(
             * p -> p.getCustomer().getId(),
             * p -> p,
             * (p1, p2) -> p1.getFechaAnalisis().isAfter(p2.getFechaAnalisis()) ? p1 : p2));
             * 
             * // 4. Mapear a HeatmapPointDto usando el Map
             * return customersWithCoords.stream()
             * .map(customer -> mapToHeatmapPoint(customer,
             * predictionMap.get(customer.getId())))
             * .collect(Collectors.toList());
             */

            // TEMPORAL: Usar valores por defecto (sin predicciones)
            return customersWithCoords.stream()
                    .map(customer -> mapToHeatmapPoint(customer, null))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("❌ Error generando heatmap data", e);
            return List.of();
        }
    }

    /**
     * Filtrar clientes por ciudad (para drill-down geográfico desde el chatbot)
     * Solo retorna clientes de la ciudad especificada
     */
    public List<HeatmapPointDto> getHeatmapDataByCity(String city) {
        try {
            log.info("📍 Filtrando heatmap por ciudad: {}", city);

            // Buscar clientes de esa ciudad que tengan coordenadas
            List<Customer> customers = customerRepository.findByCiudad(city);

            // Filtrar solo los que tienen coordenadas
            List<Customer> customersWithCoords = customers.stream()
                    .filter(c -> c.getLatitud() != null && c.getLongitud() != null)
                    .toList();

            log.info("✅ Encontrados {} clientes en {} con coordenadas", customersWithCoords.size(), city);

            // Obtener predicciones y crear Map
            List<AiPrediction> latestPredictions = predictionRepository.findLatestPredictionForEachCustomer();
            Map<String, AiPrediction> predictionMap = latestPredictions.stream()
                    .collect(Collectors.toMap(
                            p -> p.getCustomer().getId(),
                            p -> p,
                            (p1, p2) -> p1.getFechaAnalisis().isAfter(p2.getFechaAnalisis()) ? p1 : p2));

            // Mapear a HeatmapPointDto
            return customersWithCoords.stream()
                    .map(customer -> mapToHeatmapPoint(customer, predictionMap.get(customer.getId())))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("❌ Error filtrando heatmap por ciudad: {}", city, e);
            return List.of();
        }
    }

    /**
     * Mapea un Customer a HeatmapPointDto
     * 🚀 OPTIMIZADO: Recibe la predicción directamente (ya no busca en la lista)
     */
    private HeatmapPointDto mapToHeatmapPoint(Customer customer, AiPrediction prediction) {
        Subscription sub = customer.getSubscription();

        // Usar predicción si existe, valores por defecto si no
        String riskLevel = "Medium"; // Valor por defecto
        Double churnProbability = 0.5; // Valor por defecto (50%)

        if (prediction != null) {
            churnProbability = prediction.getProbabilidadFuga();
            riskLevel = normalizeRiskLevel(prediction.getNivelRiesgo());
        }

        return HeatmapPointDto.builder()
                .customerId(customer.getId())
                .nombre(customer.getNombre()) // ✅ Nombre Real del Negocio desde la BD
                .latitude(customer.getLatitud()) // Coordenada exacta (sin jitter)
                .longitude(customer.getLongitud()) // ya que son únicas por negocio
                .churnProbability(churnProbability)
                .riskLevel(riskLevel)
                // Metadata
                .segmento(customer.getSegmento())
                .tipoContrato(sub != null ? sub.getTipoContrato() : "N/A")
                .cargoMensual(sub != null ? sub.getCuotaMensual() : 0.0)
                .antiguedad(sub != null ? sub.getMesesPermanencia() : 0)
                .ciudad(customer.getCiudad())
                .borough(customer.getBorough()) // ✅ Borough real de la BD
                .build();
    }

    /**
     * Normaliza niveles de riesgo de español a inglés
     */
    private String normalizeRiskLevel(String riskLevel) {
        if (riskLevel == null)
            return "Medium";

        return switch (riskLevel.toLowerCase()) {
            case "alto", "high" -> "High";
            case "medio", "medium" -> "Medium";
            case "bajo", "low" -> "Low";
            default -> riskLevel; // Mantener valor original si no coincide
        };
    }
}