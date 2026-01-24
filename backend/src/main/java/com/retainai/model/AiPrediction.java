package com.retainai.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_predictions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double probabilidadFuga;

    private String motivoPrincipal;

    @Column(name = "nivel_riesgo")
    private String nivelRiesgo; // "Bajo", "Medio", "Alto" - Calculado automáticamente

    private LocalDateTime fechaAnalisis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    @JsonBackReference // 🛑 EL FRENO: Evita el bucle infinito con Customer
    @ToString.Exclude // Evita errores en logs
    @EqualsAndHashCode.Exclude
    private Customer customer;

    /**
     * Calcula automáticamente el nivel de riesgo basándose en la probabilidad de
     * fuga
     * Se ejecuta antes de insertar o actualizar en la BD
     */
    @PrePersist
    @PreUpdate
    protected void calculateRiskLevel() {
        fechaAnalisis = LocalDateTime.now();

        // Calcular nivel de riesgo automáticamente
        if (probabilidadFuga != null) {
            if (probabilidadFuga < 0.30) {
                nivelRiesgo = "Bajo";
            } else if (probabilidadFuga < 0.70) {
                nivelRiesgo = "Medio";
            } else {
                nivelRiesgo = "Alto";
            }
        }
    }
}