package com.retainai.dto;

import com.retainai.service.DashboardService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalCustomers;
    private Double churRate;
    private BigDecimal totalRevenue;
    private BigDecimal churRevenue;
    //private BigDecimal activeSubscriptionsRevenue;
}