package com.retainai.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
public class Customer {

    @Id
    @Column(length = 50)
    private String id; // ID del CSV (No autoincremental)

    private String genero;
    private Integer edad;
    private String pais;
    private String ciudad;
    private String segmento;

    // Geolocalización (Para el Mapa)
    private Double latitud;
    private Double longitud;

    // Relaciones (El dueño de la relación)
    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL)
    private Subscription subscription;

    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL)
    private CustomerMetrics metrics;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<AiPrediction> predictions;
}