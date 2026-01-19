package com.retainai.service;

import com.retainai.dto.CriticalAlertDto;
import com.retainai.repository.CustomerRepository;
import com.retainai.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertsService {

    private final CustomerRepository customerRepository;
    private final SubscriptionRepository subscriptionRepository;

    /**
     * Genera alertas críticas basadas en datos reales de la BD
     */
    public List<CriticalAlertDto> getCriticalAlerts() {
        List<CriticalAlertDto> alerts = new ArrayList<>();

        // Alerta 1: Clientes con muchos tickets de soporte
        long highTicketCustomers = customerRepository.countByTicketsSoporteGreaterThanEqual(6);
        if (highTicketCustomers > 0) {
            alerts.add(CriticalAlertDto.builder()
                    .type("high_tickets")
                    .title(String.format("%,d clientes con 6+ tickets", highTicketCustomers))
                    .description("Alta probabilidad de churn por insatisfacción")
                    .count((int) highTicketCustomers)
                    .severity("critical")
                    .actionLabel("Ver lista")
                    .actionUrl("/customers?filter=high-tickets")
                    .build());
        }

        // Alerta 2: Contratos mensuales en riesgo
        long monthlyContracts = subscriptionRepository.countByTipoContratoAndNivelRiesgoIn(
                "Mensual",
                List.of("High", "Alto", "Medium", "Medio"));
        if (monthlyContracts > 0) {
            alerts.add(CriticalAlertDto.builder()
                    .type("monthly_contracts")
                    .title(String.format("%,d contratos mensuales en riesgo", monthlyContracts))
                    .description("Sin compromiso a largo plazo - Alta rotación")
                    .count((int) monthlyContracts)
                    .severity("critical")
                    .actionLabel("Crear campaña")
                    .actionUrl("/campaigns/create?target=monthly")
                    .build());
        }

        // Alerta 3: Clientes en período crítico de onboarding (0-12 meses)
        long onboardingCustomers = subscriptionRepository.countByMesesPermanenciaBetween(0, 12);
        if (onboardingCustomers > 0) {
            alerts.add(CriticalAlertDto.builder()
                    .type("onboarding")
                    .title(String.format("%,d clientes en período crítico (0-12 meses)", onboardingCustomers))
                    .description("Fase de onboarding - Requiere atención especial")
                    .count((int) onboardingCustomers)
                    .severity("medium")
                    .actionLabel("Ver programa")
                    .actionUrl("/programs/onboarding")
                    .build());
        }

        log.info("✅ Generadas {} alertas críticas", alerts.size());
        return alerts;
    }
}
