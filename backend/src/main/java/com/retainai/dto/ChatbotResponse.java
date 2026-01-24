package com.retainai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Respuesta del chatbot que incluye:
 * - Mensaje en lenguaje natural
 * - Metadata opcional para actualizar el mapa
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatbotResponse {

    /**
     * Respuesta en lenguaje natural para mostrar al usuario
     */
    private String message;

    /**
     * Metadata estructurada para actualizar visualizaciones (mapa, gráficos)
     * Null si la pregunta no requiere actualización visual
     */
    private ChatbotMetadata metadata;

    /**
     * SQL generado (solo para debugging, opcional)
     */
    private String generatedSql;

    /**
     * Número de tokens usados (para monitoreo de costos)
     */
    private Integer tokensUsed;
}
