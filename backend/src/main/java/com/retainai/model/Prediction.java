package com.retainai.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "predictions")
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double probabilidadFuga;
    private String resultadoPrediccion;
    private String factorPrincipal;
    private LocalDateTime fechaPrediccion;

    // --- CORRECCIÓN FINAL ---
    // Usamos @ManyToOne porque un Cliente puede tener MUCHAS predicciones en su historial.
    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    @JsonIgnore // Esto evita el bucle infinito al convertir a JSON
    private Customer customer;
}