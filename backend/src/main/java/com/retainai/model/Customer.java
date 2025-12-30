package com.retainai.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

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

    // --- RELACIONES CON EL "FRENO" DE LOMBOK ---

    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    @ToString.Exclude // <--- ESTO EVITA EL ERROR
    @EqualsAndHashCode.Exclude // <--- ESTO TAMBIÉN
    private Subscription subscription;

    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    @ToString.Exclude // <--- ESTO EVITA EL ERROR
    @EqualsAndHashCode.Exclude // <--- ESTO TAMBIÉN
    private CustomerMetrics metrics;

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