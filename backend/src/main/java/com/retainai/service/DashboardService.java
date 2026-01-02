package com.retainai.service;

import com.retainai.dto.DashboardStatsDto;
import com.retainai.repository.CustomerRepository;
import com.retainai.repository.SubscriptionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Slf4j
public class DashboardService {

    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Cacheable(value = "dashboardStats", unless = "#result == null")
    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        try {
            Long totalCustomers = customerRepository.countAll();

            if (totalCustomers == 0 || totalCustomers == null) {
                log.warn("No hay clientes en la base de datos.");
                return createEmptyStats();
            }

            long abandonedCustomers = customerRepository.countAbandonedCustomers();
            Double churnRate = calculateChurnRate(abandonedCustomers, totalCustomers);

            BigDecimal totalRevenue = subscriptionRepository.totalRevenue();
            //Las ganancias de los usuarios activos. (Este valor también se podría mostrar en el dashboard)
            BigDecimal activeSubscriptionsRevenue = subscriptionRepository.activeSubscriptionsRevenue();

            BigDecimal churnRevenue = customerRepository.churnRevenue();

            return new DashboardStatsDto(
                    totalCustomers,
                    churnRate,
                    totalRevenue,
                    churnRevenue
            );

        }catch(Exception e){
            log.error("Error calculando estdísticas del dashboard", e);
            return createEmptyStats();
        }
    }

    private Double calculateChurnRate(Long abandonedCustomers, Long totalCustomers) {
        if (totalCustomers == null || totalCustomers == 0 || abandonedCustomers == null) {
            return 0.0;
        }
        Double churnRate = (double) abandonedCustomers / totalCustomers * 100;
        return Math.round(churnRate * 100.00)/100.00;
    }

    private DashboardStatsDto createEmptyStats(){
        return new DashboardStatsDto(
                0L,
                0.0,
                BigDecimal.ZERO,
                BigDecimal.ZERO);
    }
}




