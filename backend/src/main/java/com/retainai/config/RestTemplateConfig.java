package com.retainai.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(10))  // Timeout de conexión: 10 segundos
                .setReadTimeout(Duration.ofSeconds(30))     // Timeout de lectura: 30 segundos (para Gemini API)
                .build();
    }
}