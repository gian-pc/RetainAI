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
                .setConnectTimeout(Duration.ofSeconds(3)) // Si no conecta en 3s, abortar.
                .setReadTimeout(Duration.ofSeconds(5))    // Si conecta pero tarda > 5s en responder, abortar.
                .build();
    }
}