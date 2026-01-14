package com.retainai.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.util.List; // 👈 Importante: Agregamos este import

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    private String genero;
    private Integer edad;
    private String pais;
    private String ciudad;

    @Column(name = "segmento")
    private String segmento;

    private Double latitud;
    private Double longitud;

    // ========== CAMPOS NYC TELECOMUNICACIONES ==========
    @Column(name = "es_mayor")
    private Integer esMayor;  // 0 o 1

    @Column(name = "tiene_pareja")
    private String tienePareja;  // "Si" / "No"

    @Column(name = "tiene_dependientes")
    private String tieneDependientes;  // "Si" / "No"

    @Column(name = "ingreso_mediano")
    private Double ingresoMediano;

    @Column(name = "densidad_poblacional")
    private Double densidadPoblacional;

    @Column(name = "borough_risk")
    private Double boroughRisk;

    @Column(name = "high_density_area")
    private Integer highDensityArea;  // 0 o 1

    @Column(name = "income_bracket")
    private String incomeBracket;  // "Low" / "Medium" / "High"

    // --- RELACIONES CON EL "FRENO" DE LOMBOK ---

    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Subscription subscription;

    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private CustomerMetrics metrics;

    // 👇 AQUÍ ESTÁ EL CAMBIO: Relación con tus predicciones de IA
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference // Permite que Customer serialice sus predicciones
    @ToString.Exclude     // Evita error StackOverflow en logs
    @EqualsAndHashCode.Exclude
    private List<AiPrediction> predictions;

    public void setSubscription(Subscription subscription) {
        this.subscription = subscription;
        if (subscription != null) {
            subscription.setCustomer(this);
        }
    }

    public void setMetrics(CustomerMetrics metrics) {
        this.metrics = metrics;
        if (metrics != null) {
            metrics.setCustomer(this);
        }
    }
}