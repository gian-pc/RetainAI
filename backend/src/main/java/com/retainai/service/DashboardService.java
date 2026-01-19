package com.retainai.service;

import com.retainai.dto.DashboardStatsDto;
import com.retainai.dto.HeatmapPointDto;
import com.retainai.model.Customer;
import com.retainai.model.Subscription;
import com.retainai.repository.CustomerRepository;
import com.retainai.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor // <--- Inyección de dependencias moderna (Constructor)
public class DashboardService {

    // Al ser 'final', Lombok genera el constructor automáticamente
    private final CustomerRepository customerRepository;
    private final SubscriptionRepository subscriptionRepository;

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

            // NOTA: Eliminamos 'activeSubscriptionsRevenue' porque no se usaba en el DTO
            // y consumía recursos de la DB innecesariamente.

            return new DashboardStatsDto(
                    totalCustomers,
                    abandonedCustomers, // Incluir cantidad absoluta
                    churnRate,
                    totalRevenue,
                    churnRevenue);

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
                BigDecimal.ZERO);
    }

    /**
     * Obtiene puntos geográficos para el mapa de calor de churn
     * Solo incluye clientes con coordenadas válidas
     * 🚀 OPTIMIZADO: Query directo a BD en lugar de findAll() + filter
     */
    @Cacheable(value = "heatmapData", unless = "#result == null")
    @Transactional(readOnly = true)
    public List<HeatmapPointDto> getHeatmapData() {
        try {
            log.info("📍 Generando datos para heatmap geográfico...");

            // 🚀 Query optimizado: Todos los clientes con coordenadas (con caché)
            List<Customer> customersWithCoords = customerRepository.findCustomersWithCoordinates();

            log.info("✅ Encontrados {} clientes con coordenadas", customersWithCoords.size());

            // Mapear a HeatmapPointDto
            return customersWithCoords.stream()
                    .map(this::mapToHeatmapPoint)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("❌ Error generando heatmap data", e);
            return List.of();
        }
    }

    /**
     * Mapea un Customer a HeatmapPointDto
     */
    private HeatmapPointDto mapToHeatmapPoint(Customer customer) {
        Subscription sub = customer.getSubscription();

        // Usar nivel de riesgo calculado en BD (con estrategia socioeconómica)
        String riskLevel = "Medium";
        Double churnProbability = 0.5;

        if (sub != null) {
            // Usar nivel_riesgo de la BD (ya calculado con factores socioeconómicos)
            if (sub.getNivelRiesgo() != null) {
                riskLevel = normalizeRiskLevel(sub.getNivelRiesgo());
            }

            // Calcular probabilidad desde score_riesgo (0-10 scale)
            if (sub.getScoreRiesgo() != null) {
                churnProbability = sub.getScoreRiesgo() / 10.0; // Convertir a 0-1
            }
        }

        return HeatmapPointDto.builder()
                .customerId(customer.getId())
                .latitude(customer.getLatitud())
                .longitude(customer.getLongitud())
                .churnProbability(churnProbability)
                .riskLevel(riskLevel)
                // Metadata
                .segmento(customer.getSegmento())
                .tipoContrato(sub != null ? sub.getTipoContrato() : "N/A")
                .cargoMensual(sub != null ? sub.getCuotaMensual() : 0.0)
                .antiguedad(sub != null ? sub.getMesesPermanencia() : 0)
                .ciudad(customer.getCiudad())
                .borough(null) // TODO: Agregar borough a Customer entity si existe en BD
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