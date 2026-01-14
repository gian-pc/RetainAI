package com.retainai.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "subscriptions")
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    @JsonBackReference
    @ToString.Exclude // <--- IMPORTANTE
    @EqualsAndHashCode.Exclude // <--- IMPORTANTE
    private Customer customer;

    @Column(name = "meses_permanencia")
    private Integer mesesPermanencia;

    @Column(name = "canal_registro")
    private String canalRegistro;

    @Column(name = "tipo_contrato")
    private String tipoContrato;

    @Column(name = "cuota_mensual")
    private Double cuotaMensual;

    @Column(name = "ingresos_totales")
    private Double ingresosTotales;

    @Column(name = "metodo_pago")
    private String metodoPago;

    @Column(name = "errores_pago")
    private Integer erroresPago;

    @Column(name = "descuento_aplicado")
    private String descuentoAplicado;

    @Column(name = "aumento_precio_3m")
    private String aumentoPrecio3m;

    // ========== SERVICIOS TELECOMUNICACIONES NYC ==========
    @Column(name = "servicio_telefono")
    private String servicioTelefono;  // "Si" / "No"

    @Column(name = "lineas_multiples")
    private String lineasMultiples;  // "Si" / "No" / "Sin servicio"

    @Column(name = "tipo_internet")
    private String tipoInternet;  // "Fibra óptica" / "DSL" / "No"

    @Column(name = "seguridad_online")
    private String seguridadOnline;  // "Si" / "No" / "No internet service"

    @Column(name = "respaldo_online")
    private String respaldoOnline;  // "Si" / "No" / "No internet service"

    @Column(name = "proteccion_dispositivo")
    private String proteccionDispositivo;  // "Si" / "No" / "No internet service"

    @Column(name = "soporte_tecnico")
    private String soporteTecnico;  // "Si" / "No" / "No internet service"

    @Column(name = "streaming_tv")
    private String streamingTV;  // "Si" / "No" / "No internet service"

    @Column(name = "streaming_peliculas")
    private String streamingPeliculas;  // "Si" / "No" / "No internet service"

    @Column(name = "servicios_premium_count")
    private Integer serviciosPremiumCount;  // 0-4

    @Column(name = "facturacion_sin_papel")
    private String facturacionSinPapel;  // "Si" / "No"

    @Column(name = "tenure_group")
    private String tenureGroup;  // "0-12 meses" / "13-24 meses" / "25-48 meses" / "49+ meses"

    @Column(name = "nivel_riesgo")
    private String nivelRiesgo;  // "Bajo" / "Medio" / "Alto"

    @Column(name = "score_riesgo")
    private Double scoreRiesgo;  // 0-15

    @Column(name = "risk_flag")
    private Integer riskFlag;  // 0 o 1
}