package com.retainai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PredictionResponseDto {
    // Lo que nos devuelve Python
    private Double probability; // Ej: 0.85

    // Lo que calculamos en Java (desde BD después de @PrePersist)
    @JsonProperty("nivel_riesgo")
    private String nivelRiesgo; // Ej: "Alto", "Medio", "Bajo"

    // 🧠 XAI (Explicabilidad)
    @JsonProperty("main_factor")
    private String mainFactor; // Ej: "Baja Satisfacción (CSAT)"

    @JsonProperty("next_best_action")
    private String nextBestAction; // Ej: "Contactar para soporte prioritario"
}