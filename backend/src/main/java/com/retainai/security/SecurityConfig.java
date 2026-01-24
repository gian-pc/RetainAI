package com.retainai.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration configuration = new CorsConfiguration();
                    configuration.setAllowedOrigins(
                            List.of("http://localhost:3000", "http://localhost:3001", "http://localhost:8000"));
                    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    configuration.setAllowedHeaders(List.of("*"));
                    return configuration;
                }))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/api/customers/upload").permitAll()
                        .requestMatchers("/api/customers/export").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/customers/all").permitAll() // Database cleanup
                        .requestMatchers(HttpMethod.GET, "/api/customers/**").permitAll()
                        .requestMatchers("/api/customers/*/predict").permitAll()
                        .requestMatchers("/api/customers/*/predictions/history").permitAll()
                        .requestMatchers("/api/customers/predict/batch").permitAll() // Batch prediction (CSV)
                        .requestMatchers("/api/customers/predict/batch-all").permitAll() // Batch prediction (ALL)
                        .requestMatchers("/api/customers/predict/direct").permitAll() // Direct prediction
                        .requestMatchers("/api/dashboard/**").permitAll()
                        .requestMatchers("/api/insights/**").permitAll() // Insights prioritarios
                        .requestMatchers("/api/geo/**").permitAll()
                        .requestMatchers("/api/ai/**").permitAll() // AI Chat
                        .requestMatchers("/api/chatbot/**").permitAll() // Chatbot con Text-to-SQL
                        .requestMatchers("/api/tts/**").permitAll() // Text-to-Speech (ElevenLabs)
                        .requestMatchers("/api/predictions/**").permitAll() // Batch analysis endpoint
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated())
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}