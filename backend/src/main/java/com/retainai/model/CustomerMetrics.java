package com.retainai.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "customer_metrics")
@Data
@NoArgsConstructor
public class CustomerMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer coneccionesMensuales;
    private Integer diasActivosSemanales;
    private Float promedioConeccion;
    private Integer caracteristicasUsadas;
    private Float tasaCrecimientoUso;
    private Integer diasUltimaConeccion;

    // Soporte y Feedback
    private Integer ticketsSoporte;
    private Float tiempoResolucion;
    private String tipoQueja;
    private Float scoreCsat;
    private Integer escaladasSoporte;
    private Integer scoreNps;
    private String respuestaEncuesta; // Yes/No/Null

    // Marketing
    private Float tasaAperturaEmail;
    private Float tasaClics;
    private Integer referenciasHechas;
    private Boolean abandonoHistorico;

    @OneToOne
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    private Customer customer;
}