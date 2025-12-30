package com.retainai.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "customer_metrics")
public class CustomerMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    @JsonBackReference
    @ToString.Exclude // <--- IMPORTANTE
    @EqualsAndHashCode.Exclude // <--- IMPORTANTE
    private Customer customer;

    @Column(name = "conecciones_mensuales")
    private Integer coneccionesMensuales;

    @Column(name = "dias_activos_semanales")
    private Integer diasActivosSemanales;

    @Column(name = "promedio_coneccion")
    private Float promedioConeccion;

    @Column(name = "caracteristicas_usadas")
    private Integer caracteristicasUsadas;

    @Column(name = "tasa_crecimiento_uso")
    private Float tasaCrecimientoUso;

    @Column(name = "dias_ultima_coneccion")
    private Integer diasUltimaConeccion;

    @Column(name = "tickets_soporte")
    private Integer ticketsSoporte;

    @Column(name = "tiempo_resolucion")
    private Float tiempoResolucion;

    @Column(name = "tipo_queja")
    private String tipoQueja;

    @Column(name = "score_csat")
    private Float scoreCsat;

    @Column(name = "escaladas_soporte")
    private Integer escaladasSoporte;

    @Column(name = "tasa_apertura_email")
    private Float tasaAperturaEmail;

    @Column(name = "tasa_clics")
    private Float tasaClics;

    @Column(name = "score_nps")
    private Integer scoreNps;

    @Column(name = "respuesta_encuesta")
    private String respuestaEncuesta;

    @Column(name = "referencias_hechas")
    private Integer referenciasHechas;

    @Column(name = "abandono_historico")
    private Boolean abandonoHistorico;
}