package com.retainai.controller;

import com.retainai.dto.ChatRequestDto;
import com.retainai.dto.ChatResponseDto;
import com.retainai.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AIController {

    private final GeminiService geminiService;

    /**
     * POST: /api/ai/chat
     * Endpoint para conversación con el asistente IA (sin streaming - legacy)
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponseDto> chat(@RequestBody ChatRequestDto request) {
        log.info("📨 Recibida solicitud de chat: {}", request.getMessage());

        try {
            String response = geminiService.chat(
                    request.getMessage(),
                    request.getConversationHistory()
            );

            return ResponseEntity.ok(ChatResponseDto.builder()
                    .response(response)
                    .build());

        } catch (Exception e) {
            log.error("❌ Error en chat: {}", e.getMessage(), e);
            return ResponseEntity.ok(ChatResponseDto.builder()
                    .response("Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.")
                    .build());
        }
    }

    /**
     * POST: /api/ai/chat/stream
     * Endpoint con streaming (SSE) para respuestas palabra por palabra
     */
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatStream(@RequestBody ChatRequestDto request) {
        log.info("📨 Recibida solicitud de chat streaming: {}", request.getMessage());

        SseEmitter emitter = new SseEmitter(60000L); // 60 segundos timeout

        // Ejecutar en hilo separado para no bloquear
        new Thread(() -> {
            try {
                String fullResponse = geminiService.chat(
                        request.getMessage(),
                        request.getConversationHistory()
                );

                // Simular streaming palabra por palabra
                String[] words = fullResponse.split(" ");
                for (int i = 0; i < words.length; i++) {
                    String word = words[i];
                    if (i < words.length - 1) {
                        word += " "; // Agregar espacio excepto última palabra
                    }

                    emitter.send(SseEmitter.event()
                            .name("message")
                            .data(word));

                    Thread.sleep(50); // 50ms entre palabras para efecto natural
                }

                // Enviar evento de finalización
                emitter.send(SseEmitter.event()
                        .name("done")
                        .data(""));

                emitter.complete();
                log.info("✅ Streaming completado");

            } catch (IOException | InterruptedException e) {
                log.error("❌ Error en streaming: {}", e.getMessage());
                emitter.completeWithError(e);
            }
        }).start();

        return emitter;
    }

    /**
     * GET: /api/ai/health
     * Health check del servicio IA
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("AI Service is running");
    }
}
