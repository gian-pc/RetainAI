package com.retainai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PriorityInsightDto {
    private String customerId;
    private String customerName;
    private String ciudad;
    private String segmento;

    // Predicción de IA
    private String risk;
    private Double probability;
    private String mainFactor;
    private String nextBestAction;

    // Metadata para priorización
    private Double monthlyRevenue;
    private Integer tenure;
    private String contractType;

    // Score de prioridad (0-100)
    private Double priorityScore;
}
