package com.retainai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request del chatbot desde el frontend
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatRequest {

    /**
     * Mensaje/pregunta del usuario
     */
    private String message;

    /**
     * Historial de conversación (opcional, para contexto)
     */
    private List<ChatMessage> conversationHistory;

    /**
     * ID de sesión para tracking (opcional)
     */
    private String sessionId;
}
