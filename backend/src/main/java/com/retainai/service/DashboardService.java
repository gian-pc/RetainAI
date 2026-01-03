package com.retainai.service;

import com.retainai.dto.DashboardStatsDto;
import com.retainai.repository.CustomerRepository;
import com.retainai.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

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
                    churnRate,
                    totalRevenue,
                    churnRevenue
            );

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
                0.0,
                BigDecimal.ZERO,
                BigDecimal.ZERO
        );
    }
}