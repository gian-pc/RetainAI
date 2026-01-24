package com.retainai.controller;

import com.retainai.dto.ChatRequest;
import com.retainai.dto.ChatbotResponse;
import com.retainai.service.TextToSQLService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller para el chatbot inteligente con Text-to-SQL
 */
@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
@Slf4j
public class ChatbotController {

    @Autowired
    private TextToSQLService textToSQLService;

    /**
     * Endpoint principal del chatbot
     * Procesa preguntas en lenguaje natural y devuelve respuestas + metadata para
     * el mapa
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatbotResponse> chat(@RequestBody ChatRequest request) {
        log.info("🤖 Nueva pregunta del chatbot: {}", request.getMessage());

        try {
            ChatbotResponse response = textToSQLService.processQuestion(request.getMessage());

            log.info("✅ Respuesta generada exitosamente");
            if (response.getMetadata() != null) {
                log.info("📍 Metadata incluida para actualizar mapa");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error procesando pregunta del chatbot", e);

            // Devolver respuesta de error amigable
            ChatbotResponse errorResponse = ChatbotResponse.builder()
                    .message("Lo siento, tuve un problema procesando tu pregunta. " +
                            "¿Podrías reformularla de otra manera?")
                    .build();

            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * Endpoint de health check
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Chatbot service is running");
    }
}
