package com.retainai.dto;

import com.retainai.service.DashboardService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalCustomers;
    private Double churnRate;
    private BigDecimal totalRevenue;
    private BigDecimal churnRevenue;

}

