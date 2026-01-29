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
     *
     * ✅ UMBRALES AJUSTADOS V3 (para modelo CALIBRADO):
     * - El modelo calibrado ajusta las probabilidades a la tasa de churn real (16%)
     * - Distribución del modelo calibrado:
     *   → 84% de clientes tienen probabilidad < 30%
     *   → 16% de clientes tienen probabilidad 30-50%
     *   → 0% de clientes tienen probabilidad > 50%
     *
     * - Umbrales ajustados para modelo calibrado:
     *   → Bajo: < 25% (~75% de clientes - estables, baja probabilidad)
     *   → Medio: 25-40% (~20% de clientes - requiere monitoreo)
     *   → Alto: > 40% (~5% de clientes - crítico, acción inmediata)
     */
    @PrePersist
    @PreUpdate
    public void calculateRiskLevel() {
        fechaAnalisis = LocalDateTime.now();

        // Calcular nivel de riesgo con umbrales para modelo CALIBRADO
        if (probabilidadFuga != null) {
            if (probabilidadFuga < 0.25) {
                nivelRiesgo = "Bajo";      // < 25%: Cliente estable (~75% de clientes)
            } else if (probabilidadFuga < 0.40) {
                nivelRiesgo = "Medio";     // 25-40%: Requiere atención (~20% de clientes)
            } else {
                nivelRiesgo = "Alto";      // > 40%: Crítico (~5% de clientes)
            }
        }
    }
}