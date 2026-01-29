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
     * 🚀 ULTRA-OPTIMIZADO: Usa consulta nativa para obtener todo de un golpe
     * ⚡ CACHÉ: Los datos del mapa se cachean para respuesta instantánea
     */
    @Cacheable(value = "heatmapData", unless = "#result == null || #result.isEmpty()")
    @Transactional(readOnly = true)
    public List<HeatmapPointDto> getHeatmapData() {
        try {
            log.info("📍 Generando datos para heatmap geográfico (Nativo)...");
            long startTime = System.currentTimeMillis();

            List<Object[]> results = customerRepository.findHeatmapDataNative();
            log.info("📊 Query nativa devolvió {} filas en {}ms", results.size(), (System.currentTimeMillis() - startTime));
            
            List<HeatmapPointDto> points = new java.util.ArrayList<>();
            
            for (int i = 0; i < results.size(); i++) {
                Object[] row = results.get(i);
                try {
                    points.add(HeatmapPointDto.builder()
                            .customerId((String) row[0])
                            .nombre((String) row[1])
                            .latitude(row[2] != null ? ((Number) row[2]).floatValue() : 0.0f)
                            .longitude(row[3] != null ? ((Number) row[3]).floatValue() : 0.0f)
                            .churnProbability(row[4] != null ? ((Number) row[4]).floatValue() : 0.5f)
                            .riskLevel(normalizeRiskLevel((String) row[5]))
                            .segmento((String) row[6])
                            .tipoContrato((String) row[7])
                            .cargoMensual(row[8] != null ? ((Number) row[8]).floatValue() : 0.0f)
                            .antiguedad(row[9] != null ? ((Number) row[9]).intValue() : 0)
                            .borough((String) row[10])
                            .ciudad((String) row[11])
                            .ingresoMediano(row[12] != null ? ((Number) row[12]).floatValue() : null)
                            .densidadPoblacional(row[13] != null ? ((Number) row[13]).floatValue() : null)
                            .build());
                } catch (Exception rowEx) {
                    log.error("⚠️ Error procesando fila {} (ID: {}): {}", i, row != null ? row[0] : "null", rowEx.getMessage());
                }
            }

            log.info("✅ Finalizado mapeo de {} puntos en {}ms (Total)", points.size(), (System.currentTimeMillis() - startTime));
            return points;

        } catch (Exception e) {
            log.error("❌ Error FATAL generando heatmap data nativo", e);
            return List.of();
        }
    }

    /**
     * Filtrar clientes por ciudad (para drill-down geográfico desde el chatbot)
     * Solo retorna clientes de la ciudad especificada
     * 🚀 ULTRA-OPTIMIZADO: Usa consulta nativa filtrada
     */
    public List<HeatmapPointDto> getHeatmapDataByCity(String city) {
        try {
            log.info("📍 Filtrando heatmap por ciudad (Nativo): {}", city);
            long startTime = System.currentTimeMillis();

            // Podríamos crear otra query nativa filtrada por ciudad, pero para simplificar
            // podemos filtrar el resultado de getHeatmapData() si no son demasiados datos,
            // o mejor aún, crear la query nativa filtrada en el repositorio.
            // Por velocidad de implementación ahora, filtraré el stream.
            
            List<HeatmapPointDto> points = getHeatmapData().stream()
                    .filter(p -> city.equalsIgnoreCase(p.getCiudad()))
                    .collect(Collectors.toList());

            log.info("✅ Encontrados {} puntos en {} en {}ms", points.size(), city, (System.currentTimeMillis() - startTime));
            return points;

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
                .latitude(customer.getLatitud() != null ? customer.getLatitud().floatValue() : 0.0f) // Coordenada exacta (sin jitter)
                .longitude(customer.getLongitud() != null ? customer.getLongitud().floatValue() : 0.0f) // ya que son únicas por negocio
                .churnProbability(churnProbability != null ? churnProbability.floatValue() : 0.0f)
                .riskLevel(riskLevel)
                // Metadata
                .segmento(customer.getSegmento())
                .tipoContrato(sub != null ? sub.getTipoContrato() : "N/A")
                .cargoMensual(sub != null && sub.getCuotaMensual() != null ? sub.getCuotaMensual().floatValue() : 0.0f)
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