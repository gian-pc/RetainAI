package com.retainai.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    private String servicioTelefono; // "Si" / "No"

    @Column(name = "lineas_multiples")
    private String lineasMultiples; // "Si" / "No" / "Sin servicio"

    @Column(name = "tipo_internet")
    private String tipoInternet; // "Fibra óptica" / "DSL" / "No"

    @Column(name = "seguridad_online")
    private String seguridadOnline; // "Si" / "No" / "No internet service"

    @Column(name = "respaldo_online")
    private String respaldoOnline; // "Si" / "No" / "No internet service"

    @Column(name = "proteccion_dispositivo")
    private String proteccionDispositivo; // "Si" / "No" / "No internet service"

    @Column(name = "soporte_tecnico")
    private String soporteTecnico; // "Si" / "No" / "No internet service"

    @Column(name = "streaming_tv")
    private String streamingTV; // "Si" / "No" / "No internet service"

    @Column(name = "streaming_peliculas")
    private String streamingPeliculas; // "Si" / "No" / "No internet service"

    @Column(name = "facturacion_sin_papel")
    private String facturacionSinPapel; // "Si" / "No"

    // ========== MÉTODOS CALCULADOS (Feature Engineering) ==========
    // Estos métodos calculan dinámicamente los valores en lugar de leerlos de BD

    /**
     * Calcula el número de servicios premium contratados
     * 
     * @return Número de servicios premium (0-6)
     */
    public Integer calculateServiciosPremiumCount() {
        int count = 0;

        if ("Si".equalsIgnoreCase(this.seguridadOnline))
            count++;
        if ("Si".equalsIgnoreCase(this.respaldoOnline))
            count++;
        if ("Si".equalsIgnoreCase(this.proteccionDispositivo))
            count++;
        if ("Si".equalsIgnoreCase(this.soporteTecnico))
            count++;
        if ("Si".equalsIgnoreCase(this.streamingTV))
            count++;
        if ("Si".equalsIgnoreCase(this.streamingPeliculas))
            count++;

        return count;
    }

    /**
     * Calcula el grupo de tenure (antigüedad) del cliente
     * 
     * @return "0-12 meses", "13-24 meses", "25-48 meses", o "49+ meses"
     */
    public String calculateTenureGroup() {
        if (this.mesesPermanencia == null) {
            return "0-12 meses"; // Default
        }

        if (this.mesesPermanencia <= 12) {
            return "0-12 meses";
        } else if (this.mesesPermanencia <= 24) {
            return "13-24 meses";
        } else if (this.mesesPermanencia <= 48) {
            return "25-48 meses";
        } else {
            return "49+ meses";
        }
    }

    /**
     * Obtiene servicios premium count CALCULADO (expuesto en JSON)
     * Siempre calcula dinámicamente, ignora valor de BD
     */
    @JsonProperty("serviciosPremiumCount")
    public Integer getServiciosPremiumCountCalculated() {
        return calculateServiciosPremiumCount();
    }

    /**
     * Obtiene tenure group CALCULADO (expuesto en JSON)
     * Siempre calcula dinámicamente, ignora valor de BD
     */
    @JsonProperty("tenureGroup")
    public String getTenureGroupCalculated() {
        return calculateTenureGroup();
    }

    // ========== MÉTODOS DE MIGRACIÓN (Deprecados y Ocultos en JSON) ==========
    // Estos métodos permiten migración gradual pero eventualmente se eliminarán

    /**
     * @deprecated Usar getServiciosPremiumCountCalculated() en su lugar
     */
    @Deprecated
    @JsonIgnore // No serializar en JSON
    public Integer getServiciosPremiumCountOrCalculate() {
        return calculateServiciosPremiumCount();
    }

    /**
     * @deprecated Usar getTenureGroupCalculated() en su lugar
     */
    @Deprecated
    @JsonIgnore // No serializar en JSON
    public String getTenureGroupOrCalculate() {
        return calculateTenureGroup();
    }

}
