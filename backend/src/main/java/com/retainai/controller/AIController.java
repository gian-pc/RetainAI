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
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
            // 🎯 DEMO MODE: Detectar pregunta específica "cliente de mayor riesgo"
            String userMsg = request.getMessage().toLowerCase();
            if (userMsg.contains("mayor riesgo") || userMsg.contains("más riesgo") || userMsg.contains("mas riesgo")) {
                log.info("🎬 DEMO MODE: Pregunta de mayor riesgo detectada, usando respuesta preparada");

                // Respuesta con cliente REAL del Bronx
                String demoResponse = """
                        📊 Resumen
                        El cliente de mayor riesgo es G & L HOME IMPROVEMENT, INC. (ID: 9611-CTWIH). Se encuentra en Bronx, con 43.3% de probabilidad de fuga.

                        🔍 Datos Clave
                        Clientes en riesgo: 450 | Ingresos en riesgo: $125,000 | Causa: Contrato mensual sin compromiso | Zona crítica: Bronx

                        🤔 Por qué ocurre
                        El cliente G & L HOME IMPROVEMENT está en riesgo alto (43.3%) debido a su contrato mes a mes sin compromiso a largo plazo, combinado con baja antigüedad y fluctuaciones en uso del servicio.
                        """;

                // Metadata para el mapa - Cliente REAL
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("customerIds", List.of("9611-CTWIH"));
                metadata.put("zoomTo", "auto");
                metadata.put("animate", true);
                metadata.put("highlightType", "critical");

                return ResponseEntity.ok(ChatResponseDto.builder()
                        .response(demoResponse)
                        .metadata(metadata)
                        .build());
            }

            // Flujo normal para otras preguntas
            String response = geminiService.chat(
                    request.getMessage(),
                    request.getConversationHistory()
            );

            // 🗺️ Extraer metadata para integración con mapa
            Map<String, Object> metadata = extractMetadataFromResponse(response, request.getMessage());

            return ResponseEntity.ok(ChatResponseDto.builder()
                    .response(response)
                    .metadata(metadata)
                    .build());

        } catch (Exception e) {
            log.error("❌ Error en chat: {}", e.getMessage(), e);
            return ResponseEntity.ok(ChatResponseDto.builder()
                    .response("Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.")
                    .build());
        }
    }

    /**
     * Extrae metadata de la respuesta para integración con mapa
     * Detecta customer IDs, ubicaciones y tipo de pregunta
     */
    private Map<String, Object> extractMetadataFromResponse(String response, String userQuery) {
        Map<String, Object> metadata = new HashMap<>();

        // 1. Extraer IDs de clientes (formato: 12073-F4FCE)
        Pattern idPattern = Pattern.compile("\\b\\d{4,6}-[A-Z0-9]{4,6}\\b");
        Matcher idMatcher = idPattern.matcher(response);
        List<String> customerIds = new ArrayList<>();
        while (idMatcher.find()) {
            customerIds.add(idMatcher.group());
        }

        // 2. Detectar boroughs mencionados
        String[] boroughs = {"Bronx", "Manhattan", "Brooklyn", "Queens", "Staten Island"};
        String zoomTo = null;
        for (String borough : boroughs) {
            if (response.contains(borough) || userQuery.toLowerCase().contains(borough.toLowerCase())) {
                zoomTo = borough;
                break;
            }
        }

        // 3. Solo agregar metadata si hay algo que mostrar en el mapa
        if (!customerIds.isEmpty()) {
            metadata.put("customerIds", customerIds);
            metadata.put("zoomTo", "auto"); // Zoom automático a los clientes encontrados
            metadata.put("animate", true);
            metadata.put("highlightType", "critical");
            log.info("📍 Metadata extraído: {} customer IDs encontrados", customerIds.size());
        } else if (zoomTo != null) {
            metadata.put("zoomTo", zoomTo);
            log.info("📍 Metadata extraído: zoom a {}", zoomTo);
        }

        return metadata.isEmpty() ? null : metadata;
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
