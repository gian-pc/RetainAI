package com.retainai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PredictionInputDto {

    // ========== CUSTOMER (4 campos) ==========
    @JsonProperty("genero")
    private String genero;

    @JsonProperty("edad")
    private Integer edad;

    @JsonProperty("ciudad")
    private String ciudad;

    @JsonProperty("segmento_de_cliente")
    private String segmentoDeCliente;

    // ========== SUBSCRIPTION (9 campos) ==========
    @JsonProperty("meses_permanencia")
    private Integer mesesPermanencia;

    @JsonProperty("canal_de_registro")
    private String canalDeRegistro;

    @JsonProperty("tipo_contrato")
    private String tipoContrato;

    @JsonProperty("cuota_mensual")
    private Double cuotaMensual;

    @JsonProperty("ingresos_totales")
    private Double ingresosTotales;

    @JsonProperty("metodo_de_pago")
    private String metodoDePago;

    @JsonProperty("errores_de_pago")
    private Integer erroresDePago;

    @JsonProperty("descuento_aplicado")
    private String descuentoAplicado;

    @JsonProperty("aumento_ultimos_3_meses")
    private String aumentoUltimos3Meses;

    // ========== CUSTOMER_METRICS (16 campos) ==========
    @JsonProperty("conecciones_mensuales")
    private Integer coneccionesMensuales;

    @JsonProperty("dias_activos_semanales")
    private Integer diasActivosSemanales;

    @JsonProperty("promedio_coneccion")
    private Double promedioConeccion;

    @JsonProperty("caracteristicas_usadas")
    private Integer caracteristicasUsadas;

    @JsonProperty("tasa_crecimiento_uso")
    private Double tasaCrecimientoUso;

    @JsonProperty("ultima_coneccion")
    private Integer ultimaConeccion;

    @JsonProperty("tickets_de_soporte")
    private Integer ticketsDeSoporte;

    @JsonProperty("tiempo_promedio_de_resolucion")
    private Double tiempoPromedioDeResolucion;

    @JsonProperty("tipo_de_queja")
    private String tipoDeQueja;

    @JsonProperty("puntuacion_csates")
    private Double puntuacionCsates;

    @JsonProperty("escaladas")
    private Integer escaladas;

    @JsonProperty("tasa_apertura_email")
    private Double tasaAperturaEmail;

    @JsonProperty("tasa_clics_marketing")
    private Double tasaClicsMarketing;

    @JsonProperty("puntuacion_nps")
    private Integer puntuacionNps;

    @JsonProperty("respuesta_de_la_encuesta")
    private String respuestaDeLaEncuesta;

    @JsonProperty("recuento_de_referencias")
    private Integer recuentoDeReferencias;
}