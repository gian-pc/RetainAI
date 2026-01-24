package com.retainai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Mensaje individual en el historial de conversación
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage {

    /**
     * Rol del mensaje: "user" o "assistant"
     */
    private String role;

    /**
     * Contenido del mensaje
     */
    private String content;
}
