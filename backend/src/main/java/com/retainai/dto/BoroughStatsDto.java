package com.retainai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para estadísticas de churn por borough (distrito) de NYC
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoroughStatsDto {

    private String borough;             // Manhattan, Brooklyn, Queens, Bronx, Staten Island
    private Long totalCustomers;        // Total de clientes en el borough
    private Long customersAtRisk;       // Clientes con riesgo > 50%
    private Double churnRate;           // Porcentaje de churn (0.0 - 100.0)
    private Double avgChurnProbability; // Probabilidad promedio de churn (0.0 - 1.0)
    private Double totalRevenueAtRisk;  // Ingresos en riesgo
    private Double avgNpsScore;         // NPS promedio del borough
}
