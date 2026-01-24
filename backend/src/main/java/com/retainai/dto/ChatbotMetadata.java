package com.retainai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Metadata estructurada para actualizar visualizaciones del frontend
 * basada en la respuesta del chatbot
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatbotMetadata {

    /**
     * IDs de clientes a resaltar en el mapa
     */
    private List<String> customerIds;

    /**
     * Filtrar mapa por borough específico
     * Valores: "Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"
     */
    private String filterByBorough;

    /**
     * Filtrar mapa por código postal
     */
    private String filterByZipCode;

    /**
     * Tipo de resaltado visual
     * Valores: "critical", "high-value-risk", "cluster", "default"
     */
    private String highlightType;

    /**
     * Región a la que hacer zoom
     * Valores: borough name o "auto" para calcular automáticamente
     */
    private String zoomTo;

    /**
     * Activar animación de ondas pulsantes en los puntos resaltados
     */
    private Boolean animate;

    /**
     * Valor agregado para mostrar (ej: ingresos totales en riesgo)
     */
    private Double aggregateValue;

    /**
     * Etiqueta del valor agregado (ej: "Ingresos en riesgo")
     */
    private String aggregateLabel;
}
