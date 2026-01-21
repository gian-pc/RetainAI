package com.retainai.controller;

import com.retainai.dto.TextToSpeechRequest;
import com.retainai.service.ElevenLabsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/tts")
@RequiredArgsConstructor
public class TextToSpeechController {

    private final ElevenLabsService elevenLabsService;

    @PostMapping("/synthesize")
    public ResponseEntity<byte[]> synthesizeSpeech(@RequestBody TextToSpeechRequest request) {
        log.info("🎤 Recibiendo solicitud de TTS");

        try {
            byte[] audioBytes = elevenLabsService.synthesizeSpeech(request.getText());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("audio/mpeg"));
            headers.setContentLength(audioBytes.length);
            headers.set("Content-Disposition", "inline; filename=\"speech.mp3\"");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(audioBytes);

        } catch (Exception e) {
            log.error("❌ Error en endpoint TTS: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
