package com.retainai.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    // --- IDENTIFICACIÓN ---
    // CSV: cliente_id
    @Id
    @Column(name = "cliente_id", length = 50, nullable = false)
    private String customerId;

    // --- PERFIL DEMOGRÁFICO ---
    // CSV: genero
    @Column(name = "genero", length = 20)
    private String gender;

    // CSV: edad
    @Column(name = "edad")
    private Integer age;

    // CSV: pais
    @Column(name = "pais", length = 50)
    private String country;

    // CSV: ciudad
    @Column(name = "ciudad", length = 50)
    private String city;

    // CSV: segmento_de_cliente
    @Column(name = "segmento_de_cliente", length = 50)
    private String customerSegment;

    // --- RELACIÓN COMERCIAL ---
    // CSV: meses_permanencia
    @Column(name = "meses_permanencia")
    private Integer tenure;

    // CSV: canal_de_registro (Web, Mobile, etc)
    @Column(name = "canal_de_registro", length = 50)
    private String registrationChannel;

    // CSV: tipo_contrato (Mensual, Anual)
    @Column(name = "tipo_contrato", length = 50)
    private String contractType;

    // --- COMPORTAMIENTO DE USO (Vital para Dashboard) ---
    // CSV: conecciones_mensuales
    @Column(name = "conecciones_mensuales")
    private Integer monthlyConnections;

    // CSV: dias_activos_semanales
    @Column(name = "dias_activos_semanales")
    private Integer activeDaysPerWeek;

    // CSV: promedio_coneccion
    @Column(name = "promedio_coneccion")
    private Double avgConnectionDuration;

    // CSV: características_usadas
    @Column(name = "caracteristicas_usadas")
    private Integer featuresUsed;

    // CSV: tasa_crecimiento_uso
    @Column(name = "tasa_crecimiento_uso")
    private Double usageGrowthRate;

    // CSV: ultima_coneccion (días desde la última vez)
    @Column(name = "ultima_coneccion")
    private Integer daysSinceLastConnection;

    // --- FINANCIERO ---
    // CSV: cuota_mensual
    @Column(name = "cuota_mensual")
    private Double monthlyCharges;

    // CSV: ingresos_totales
    @Column(name = "ingresos_totales")
    private Double totalCharges;

    // CSV: método_de_pago
    @Column(name = "metodo_de_pago", length = 50)
    private String paymentMethod;

    // CSV: errores_de_pago
    @Column(name = "errores_de_pago")
    private Integer paymentErrors;

    // CSV: descuento_aplicado (Si/No)
    @Column(name = "descuento_aplicado", length = 10)
    private String discountApplied;

    // CSV: aumento_ultimos_3_meses (Si/No)
    @Column(name = "aumento_ultimos_3_meses", length = 10)
    private String priceIncreaseLast3Months;

    // --- SOPORTE Y RIESGO (Dolor del Cliente) ---
    // CSV: tickets_de_soporte
    @Column(name = "tickets_de_soporte")
    private Integer supportTickets;

    // CSV: tiempo_promedio_de_resolución
    @Column(name = "tiempo_promedio_resolucion")
    private Double avgResolutionTime;

    // CSV: tipo_de_queja
    @Column(name = "tipo_de_queja", length = 100)
    private String complaintType;

    // CSV: puntuacion_csates (Satisfacción)
    @Column(name = "puntuacion_csat")
    private Double csatScore;

    // CSV: escaladas (Quejas subidas de tono)
    @Column(name = "escaladas")
    private Integer escalations;

    // --- MARKETING Y FIDELIZACIÓN ---
    // CSV: tasa_apertura_email
    @Column(name = "tasa_apertura_email")
    private Double emailOpenRate;

    // CSV: tasa_clics_marketing
    @Column(name = "tasa_clics_marketing")
    private Double marketingClickRate;

    // CSV: puntuacion_nps
    @Column(name = "puntuacion_nps")
    private Integer npsScore;

    // CSV: respuesta_de_la_encuesta
    @Column(name = "respuesta_encuesta", length = 50)
    private String surveyResponse;

    // CSV: recuento_de_referencias
    @Column(name = "recuento_referencias")
    private Integer referralCount;

    // --- TARGET (La verdad histórica) ---
    // CSV: Abandonar (0 o 1) - IMPORTANTE: Esto es lo que pasó realmente.
    // Sirve para comparar con lo que diga nuestra IA en la tabla 'predictions'.
    @Column(name = "abandono_historico")
    private Integer historicalChurn;

    // --- RELACIONES ---
    // Historial de predicciones futuras hechas por nuestra IA
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Prediction> predictions;
}