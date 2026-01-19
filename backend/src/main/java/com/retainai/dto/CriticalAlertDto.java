package com.retainai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CriticalAlertDto {
    private String type; // "high_tickets", "monthly_contracts", "onboarding"
    private String title; // "X clientes con 6+ tickets"
    private String description; // "77.7% probabilidad de churn"
    private Integer count; // Número de clientes afectados
    private String severity; // "critical", "high", "medium"
    private String actionLabel; // "Ver lista", "Crear campaña", etc.
    private String actionUrl; // URL para navegar
}
