package com.retainai.dto;

import com.opencsv.bean.CsvBindByName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomerCsvRepresentation {

    // --- DATOS BÁSICOS ---
    @CsvBindByName(column = "cliente_id")
    private String customerId;

    @CsvBindByName(column = "genero")
    private String gender;

    @CsvBindByName(column = "edad")
    private Integer age;

    @CsvBindByName(column = "pais")
    private String country;

    @CsvBindByName(column = "ciudad")
    private String city;

    @CsvBindByName(column = "segmento_de_cliente")
    private String segment;

    // --- SUSCRIPCIÓN ---
    @CsvBindByName(column = "meses_permanencia")
    private Integer tenure;

    @CsvBindByName(column = "canal_de_registro")
    private String registrationChannel;

    @CsvBindByName(column = "tipo_contrato")
    private String contractType;

    @CsvBindByName(column = "cuota_mensual")
    private Double monthlyCharges;

    @CsvBindByName(column = "ingresos_totales")
    private Double totalCharges;

    @CsvBindByName(column = "metodo_de_pago")
    private String paymentMethod;

    @CsvBindByName(column = "errores_de_pago")
    private Integer paymentErrors;

    @CsvBindByName(column = "descuento_aplicado")
    private String discountApplied;

    @CsvBindByName(column = "aumento_ultimos_3_meses")
    private String priceIncrease;

    // --- MÉTRICAS ---
    @CsvBindByName(column = "conecciones_mensuales")
    private Integer monthlyConnections;

    @CsvBindByName(column = "dias_activos_semanales")
    private Integer activeDays;

    @CsvBindByName(column = "promedio_coneccion")
    private Float avgConnection;

    @CsvBindByName(column = "caracteristicas_usadas")
    private Integer featuresUsed;

    @CsvBindByName(column = "tasa_crecimiento_uso")
    private Float usageGrowth;

    @CsvBindByName(column = "ultima_coneccion")
    private Integer lastConnectionDays;

    @CsvBindByName(column = "tickets_de_soporte")
    private Integer supportTickets;

    @CsvBindByName(column = "tiempo_promedio_de_resolucion")
    private Float resolutionTime;

    @CsvBindByName(column = "tipo_de_queja")
    private String complaintType;

    @CsvBindByName(column = "puntuacion_csates") // Tal cual viene en tu CSV
    private Float csatScore;

    @CsvBindByName(column = "escaladas")
    private Integer escalations;

    @CsvBindByName(column = "tasa_apertura_email")
    private Float emailOpenRate;

    @CsvBindByName(column = "tasa_clics_marketing")
    private Float marketingClickRate;

    @CsvBindByName(column = "puntuacion_nps")
    private Integer npsScore;

    @CsvBindByName(column = "respuesta_de_la_encuesta")
    private String surveyResponse;

    @CsvBindByName(column = "recuento_de_referencias")
    private Integer referrals;

    @CsvBindByName(column = "abandonar")
    private Integer churnTarget; // 1 = Se fue, 0 = Se queda
}