package com.retainai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PredictionResponseDto {
    // Lo que nos devuelve Python
    private Double probability; // Ej: 0.85
    private String risk;        // Ej: "High"
}