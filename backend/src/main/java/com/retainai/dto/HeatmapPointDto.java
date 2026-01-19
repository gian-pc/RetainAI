package com.retainai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para representar un punto en el mapa de calor
 * Contiene coordenadas geográficas y métricas de riesgo
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HeatmapPointDto {

    private String customerId;
    private Double latitude;
    private Double longitude;

    // Métricas de riesgo
    private Double churnProbability;  // 0.0 - 1.0
    private String riskLevel;         // "Low", "Medium", "High"

    // Metadata para tooltip
    private String segmento;
    private String tipoContrato;
    private Double cargoMensual;
    private Integer antiguedad;

    // Agrupación geográfica
    private String borough;           // Manhattan, Brooklyn, Queens, Bronx, Staten Island
    private String ciudad;
}
