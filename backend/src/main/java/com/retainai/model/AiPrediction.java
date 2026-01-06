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

    private LocalDateTime fechaAnalisis;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    @JsonBackReference // 🛑 EL FRENO: Evita el bucle infinito con Customer
    @ToString.Exclude  // Evita errores en logs
    @EqualsAndHashCode.Exclude
    private Customer customer;

    @PrePersist
    protected void onCreate() {
        fechaAnalisis = LocalDateTime.now();
    }
}