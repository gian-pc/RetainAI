package com.retainai.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- RELACIÓN CON EL CLIENTE ---
    // Aquí está la magia. Aunque Customer sea gigante,
    // esta línea solo guarda la referencia (la Foreign Key 'cliente_id').
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Customer customer;

    // --- RESULTADOS DE LA IA ---

    // Ej: "Fuga Inminente", "Cliente Seguro"
    @Column(name = "resultado_prediccion", nullable = false)
    private String predictionResult;

    // Ej: 0.85 (85% de probabilidad)
    @Column(name = "probabilidad_fuga", nullable = false)
    private Double churnProbability;

    // Ej: "Precio alto", "Mala atención" (Explicación de Gemini)
    @Column(name = "factor_principal", length = 100)
    private String mainFactor;

    @Column(name = "fecha_prediccion", nullable = false)
    private LocalDateTime predictionDate;

    // Se ejecuta automático antes de guardar en la BD
    @PrePersist
    protected void onCreate() {
        if (predictionDate == null) {
            predictionDate = LocalDateTime.now();
        }
    }
}