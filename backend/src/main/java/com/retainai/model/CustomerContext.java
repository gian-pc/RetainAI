package com.retainai.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidad para almacenar el contexto adicional del cliente.
 * Utilizado por el chatbot y analytics para proporcionar explicaciones
 * contextuales y sugerencias accionables de retención.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "customer_context")
public class CustomerContext {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    @JsonBackReference
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Customer customer;

    // ========== HISTORIAL DE CUENTA ==========

    @Column(name = "cambio_plan_reciente")
    private Boolean cambioPlanReciente;

    @Column(name = "fecha_cambio_plan")
    private LocalDate fechaCambioPlan;

    @Column(name = "downgrade_reciente")
    private Boolean downgradeReciente;

    // ========== FINANCIERO ==========

    @Column(name = "fecha_ultimo_pago")
    private LocalDate fechaUltimoPago;

    @Column(name = "intentos_cobro_fallidos")
    private Integer intentosCobroFallidos;

    @Column(name = "dias_mora")
    private Integer diasMora;

    // ========== MARKETING Y ENGAGEMENT ==========

    @Column(name = "ofertas_recibidas")
    private Integer ofertasRecibidas;

    @Column(name = "visitas_app_mensual")
    private Integer visitasAppMensual;

    @Column(name = "features_nuevas_usadas")
    private Integer featuresNuevasUsadas;

    // ========== COMPETENCIA ==========

    @Column(name = "competidores_area")
    private Integer competidoresArea;

    @Column(name = "precio_vs_mercado")
    private String precioVsMercado; // "Alto", "Competitivo", "Bajo"

    // ========== METADATA ==========

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
