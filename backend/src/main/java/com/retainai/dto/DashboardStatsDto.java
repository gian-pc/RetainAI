package com.retainai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data; // <--- ¡ESTA ES LA CLAVE!
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data // <--- Genera Getters, Setters, toString, equals, etc.
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalCustomers;
    private long abandonedCustomers; // Cantidad absoluta de clientes que abandonaron
    private Double churnRate;
    private BigDecimal totalRevenue;
    private BigDecimal churnRevenue;
    private Double avgNpsScore; // Score NPS promedio
}