package com.retainai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionHistoryDto {
    private Long id;
    private Double probabilidadFuga;
    private String motivoPrincipal;
    private LocalDateTime fechaAnalisis;
    private String nivelRiesgo; // High, Medium, Low basado en probabilidad
}
