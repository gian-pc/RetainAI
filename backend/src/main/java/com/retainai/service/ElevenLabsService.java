package com.retainai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ElevenLabsService {

    @Value("${elevenlabs.api.key:}")
    private String apiKey;

    @Value("${elevenlabs.api.url:https://api.elevenlabs.io/v1/text-to-speech}")
    private String apiUrl;

    @Value("${elevenlabs.voice.id:21m00Tcm4TlvDq8ikWAM}")
    private String voiceId;

    private final RestTemplate restTemplate;

    public byte[] synthesizeSpeech(String text) {
        log.info("🔊 Sintetizando audio con ElevenLabs: {}", text.substring(0, Math.min(50, text.length())));

        if (apiKey == null || apiKey.isEmpty()) {
            log.error("❌ ELEVENLABS_API_KEY no configurada");
            throw new IllegalStateException("ELEVENLABS_API_KEY no configurada. Por favor configura tu API key en el archivo .env");
        }

        try {
            // Construir el payload para ElevenLabs
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("text", text);
            requestBody.put("model_id", "eleven_multilingual_v2"); // Modelo que soporta español

            // Voice settings para español natural
            Map<String, Object> voiceSettings = new HashMap<>();
            voiceSettings.put("stability", 0.5);
            voiceSettings.put("similarity_boost", 0.75);
            requestBody.put("voice_settings", voiceSettings);

            // Headers con API key
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("xi-api-key", apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Llamar a ElevenLabs API
            String url = apiUrl + "/" + voiceId;
            log.info("📡 Llamando a ElevenLabs API: {}", url);

            ResponseEntity<byte[]> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                byte[].class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                byte[] audioBytes = response.getBody();
                log.info("✅ Audio generado exitosamente ({} bytes)", audioBytes.length);
                return audioBytes;
            }

            log.error("❌ Respuesta de ElevenLabs API no válida: {}", response.getStatusCode());
            throw new RuntimeException("ElevenLabs API devolvió una respuesta no válida");

        } catch (Exception e) {
            log.warn("⚠️ TTS no disponible: {}", e.getMessage());
            return new byte[0];
        }
    }
}
