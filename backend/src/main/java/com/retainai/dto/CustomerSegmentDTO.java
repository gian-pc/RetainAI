package com.retainai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSegmentDTO {
    private String segment; // "BASIC", "MEDIUM", "PREMIUM"
    private Integer customers; // Total de clientes en el segmento
    private Double avgRevenue; // Revenue promedio anual
    private Double churnRate; // Tasa de churn del segmento
    private String riskLevel; // "LOW", "MEDIUM", "HIGH"
    private String strategy; // Estrategia recomendada
}
