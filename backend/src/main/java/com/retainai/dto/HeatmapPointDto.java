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
    private String nombre;
    private Float latitude;
    private Float longitude;

    // Métricas de riesgo
    private Float churnProbability;
    private String riskLevel;

    // Metadata para tooltip
    private String segmento;
    private String tipoContrato;
    private Float cargoMensual;
    private Integer antiguedad;

    // Agrupación geográfica
    private String borough;
    private String ciudad;

    // Datos socioeconómicos y demográficos
    private Float ingresoMediano;
    private Float densidadPoblacional;
}
