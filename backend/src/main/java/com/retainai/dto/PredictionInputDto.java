package com.retainai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

/**
 * DTO para enviar datos a FastAPI (Modelo NYC Telecomunicaciones)
 * 30 campos alineados con el dataset de entrenamiento
 */
@Data
@Builder
public class PredictionInputDto {

    // ========== DEMOGRÁFICOS (4 campos) ==========
    @JsonProperty("Genero")
    private String genero;  // "Masculino" / "Femenino"

    @JsonProperty("EsMayor")
    private Integer esMayor;  // 0 o 1

    @JsonProperty("TienePareja")
    private String tienePareja;  // "Si" / "No"

    @JsonProperty("TieneDependientes")
    private String tieneDependientes;  // "Si" / "No"

    // ========== GEOGRÁFICOS (4 campos) ==========
    @JsonProperty("IngresoMediano")
    private Double ingresoMediano;

    @JsonProperty("DensidadPoblacional")
    private Double densidadPoblacional;

    @JsonProperty("borough_risk")
    private Double boroughRisk;

    @JsonProperty("high_density_area")
    private Integer highDensityArea;  // 0 o 1

    // ========== SERVICIOS (10 campos) ==========
    @JsonProperty("ServicioTelefono")
    private String servicioTelefono;  // "Si" / "No"

    @JsonProperty("LineasMultiples")
    private String lineasMultiples;  // "Si" / "No" / "Sin servicio"

    @JsonProperty("TipoInternet")
    private String tipoInternet;  // "Fibra óptica" / "DSL" / "No"

    @JsonProperty("SeguridadOnline")
    private String seguridadOnline;  // "Si" / "No" / "No internet service"

    @JsonProperty("RespaldoOnline")
    private String respaldoOnline;  // "Si" / "No" / "No internet service"

    @JsonProperty("ProteccionDispositivo")
    private String proteccionDispositivo;  // "Si" / "No" / "No internet service"

    @JsonProperty("SoporteTecnico")
    private String soporteTecnico;  // "Si" / "No" / "No internet service"

    @JsonProperty("StreamingTV")
    private String streamingTV;  // "Si" / "No" / "No internet service"

    @JsonProperty("StreamingPeliculas")
    private String streamingPeliculas;  // "Si" / "No" / "No internet service"

    @JsonProperty("servicios_premium_count")
    private Integer serviciosPremiumCount;  // 0-4

    // ========== CONTRATO (5 campos) ==========
    @JsonProperty("TipoContrato")
    private String tipoContrato;  // "Mensual" / "Un año" / "Dos años"

    @JsonProperty("FacturacionSinPapel")
    private String facturacionSinPapel;  // "Si" / "No"

    @JsonProperty("MetodoPago")
    private String metodoPago;  // "Cheque electrónico" / "Cheque por correo" / "Tarjeta de crédito" / "Transferencia bancaria"

    @JsonProperty("Antiguedad")
    private Integer antiguedad;  // Meses

    @JsonProperty("tenure_group")
    private String tenureGroup;  // "0-12 meses" / "13-24 meses" / "25-48 meses" / "49+ meses"

    // ========== FINANCIERO (2 campos) ==========
    @JsonProperty("CargoMensual")
    private Double cargoMensual;

    @JsonProperty("CargosTotal")
    private Double cargosTotal;

    // ========== SEGMENTACIÓN (2 campos) ==========
    @JsonProperty("SegmentoCliente")
    private String segmentoCliente;  // "Residencial" / "PYME" / "Corporativo"

    @JsonProperty("income_bracket")
    private String incomeBracket;  // "Low" / "Medium" / "High"

    // ⚠️ REMOVIDOS: nivel_riesgo, score_riesgo, risk_flag (eran data leakage - el modelo los predice, no los usa como input)

    // ========== COMPORTAMIENTO Y SATISFACCIÓN (CRÍTICO PARA XAI) ==========
    // Soporte y quejas
    @JsonProperty("TicketsSoporte")
    private Integer ticketsSoporte;  // Número de tickets abiertos

    @JsonProperty("Escaladas")
    private Integer escaladas;  // Tickets escalados

    @JsonProperty("TipoDeQueja")
    private String tipoDeQueja;  // "Ninguna", "Red", "Facturacion", "Precio", "Servicio"

    @JsonProperty("has_queja")
    private Integer hasQueja;  // 0 o 1

    @JsonProperty("alto_tickets")
    private Integer altoTickets;  // 0 o 1

    @JsonProperty("TiempoResolucion")
    private Double tiempoResolucion;  // Tiempo promedio de resolución en horas

    // Satisfacción del cliente
    @JsonProperty("PuntuacionNPS")
    private Double puntuacionNPS;  // Net Promoter Score (0-100)

    @JsonProperty("PuntuacionCSAT")
    private Double puntuacionCSAT;  // Customer Satisfaction (1-5)

    @JsonProperty("nps_categoria")
    private String npsCategoria;  // "Detractor", "Pasivo", "Promotor"

    @JsonProperty("csat_categoria")
    private String csatCategoria;  // "Insatisfecho", "Neutral", "Satisfecho"

    // Engagement
    @JsonProperty("TasaAperturaEmail")
    private Double tasaAperturaEmail;  // Tasa de apertura de emails (0-1)

    // Precio relativo
    @JsonProperty("ratio_precio_ingreso")
    private Double ratioPrecioIngreso;  // CargoMensual / IngresoMediano
}
