package com.retainai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PredictionInputDto {

    // Datos demográficos
    @JsonProperty("edad")
    private Integer edad;

    @JsonProperty("genero")
    private String genero;

    // Datos de la Suscripción (Mapeados desde Subscription)
    @JsonProperty("meses_permanencia")
    private Integer mesesPermanencia;

    @JsonProperty("cuota_mensual")
    private Double cuotaMensual;

    // Datos de Comportamiento (Mapeados desde Metrics)
    @JsonProperty("total_tickets")
    private Integer totalTickets;

    @JsonProperty("score_csat")
    private Integer scoreCsat;

    @JsonProperty("uso_promedio")
    private Double usoPromedio;
}