package com.retainai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

/**
 * DTO para enviar datos a FastAPI (Modelo Optimizado v2)
 * 24 campos RAW - El modelo se encarga de toda la transformación
 *
 * IMPORTANTE: Este DTO mapea exactamente las 24 features que espera el modelo
 * 11_production_pipeline.pkl
 */
@Data
@Builder
public class PredictionInputDtoV2 {

    @JsonProperty("score_riesgo")
    private Double scoreRiesgo;

    @JsonProperty("dias_activos_semanales")
    private Integer diasActivosSemanales;

    @JsonProperty("promedio_conexion")
    private Double promedioConexion;

    @JsonProperty("conexiones_mensuales")
    private Integer conexionesMensuales;

    @JsonProperty("caracteristicas_usadas")
    private Integer caracteristicasUsadas;

    @JsonProperty("dias_ultima_conexion")
    private Integer diasUltimaConexion;

    @JsonProperty("intensidad_uso")
    private Double intensidadUso;

    @JsonProperty("tickets_soporte")
    private Integer ticketsSoporte;

    @JsonProperty("puntuacion_nps")
    private Double puntuacionNps;

    @JsonProperty("tasa_crecimiento_uso")
    private Double tasaCrecimientoUso;

    @JsonProperty("puntuacion_csat")
    private Double puntuacionCsat;

    @JsonProperty("ratio_carga_financiera")
    private Double ratioCargaFinanciera;

    @JsonProperty("tasa_apertura_email")
    private Double tasaAperturaEmail;

    @JsonProperty("errores_pago")
    private Integer erroresPago;

    @JsonProperty("antiguedad")
    private Integer antiguedad;

    @JsonProperty("ingresos_totales")
    private Double ingresosTotales;

    @JsonProperty("latitud")
    private Double latitud;

    @JsonProperty("cargo_mensual")
    private Double cargoMensual;

    @JsonProperty("tiempo_resolucion")
    private Double tiempoResolucion;

    @JsonProperty("longitud")
    private Double longitud;

    @JsonProperty("codigo_postal")
    private String codigoPostal;

    @JsonProperty("edad")
    private Integer edad;

    @JsonProperty("dias_desde_ultimo_contacto")
    private Integer diasDesdeUltimoContacto;

    @JsonProperty("tiempo_sesion_promedio")
    private Double tiempoSesionPromedio;
}
