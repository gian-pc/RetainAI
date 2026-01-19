package com.retainai.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    private String genero;
    private Integer edad;
    private String pais;
    private String ciudad;

    @Column(name = "segmento")
    private String segmento;

    private Double latitud;
    private Double longitud;

    // ========== CAMPOS NYC TELECOMUNICACIONES ==========
    @Column(name = "es_mayor")
    private Integer esMayor; // 0 o 1

    @Column(name = "tiene_pareja")
    private String tienePareja; // "Si" / "No"

    @Column(name = "tiene_dependientes")
    private String tieneDependientes; // "Si" / "No"

    @Column(name = "ingreso_mediano")
    private Double ingresoMediano;

    @Column(name = "densidad_poblacional")
    private Double densidadPoblacional;

    // ========== CAMPOS GEOGRÁFICOS ADICIONALES ==========
    @Column(name = "borough")
    private String borough; // Manhattan, Brooklyn, Queens, Bronx, Staten Island

    @Column(name = "codigo_postal")
    private String codigoPostal; // ZIP code

    @Column(name = "estado")
    private String estado; // NY, NJ, CT, etc.

    @Column(name = "fecha_registro")
    private LocalDate fechaRegistro; // Fecha de alta del cliente

    // --- RELACIONES CON EL "FRENO" DE LOMBOK ---

    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Subscription subscription;

    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private CustomerMetrics metrics;

    // 👇 AQUÍ ESTÁ EL CAMBIO: Relación con tus predicciones de IA
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference // Permite que Customer serialice sus predicciones
    @ToString.Exclude // Evita error StackOverflow en logs
    @EqualsAndHashCode.Exclude
    private List<AiPrediction> predictions;

    public void setSubscription(Subscription subscription) {
        this.subscription = subscription;
        if (subscription != null) {
            subscription.setCustomer(this);
        }
    }

    public void setMetrics(CustomerMetrics metrics) {
        this.metrics = metrics;
        if (metrics != null) {
            metrics.setCustomer(this);
        }
    }

    // ========== MÉTODOS CALCULADOS (Feature Engineering) ==========
    // Estos métodos calculan dinámicamente los valores en lugar de leerlos de BD

    /**
     * Calcula el riesgo del borough basado en densidad poblacional
     * 
     * @return Valor entre 0.0 y 1.0 indicando el nivel de riesgo
     */
    public Double calculateBoroughRisk() {
        if (this.densidadPoblacional == null) {
            return 0.0;
        }

        // Lógica basada en el análisis de datos
        if (this.densidadPoblacional > 30000) {
            return 0.75; // Alto riesgo
        } else if (this.densidadPoblacional > 15000) {
            return 0.50; // Medio riesgo
        } else {
            return 0.25; // Bajo riesgo
        }
    }

    /**
     * Determina si el área es de alta densidad
     * 
     * @return 1 si es alta densidad, 0 si no
     */
    public Integer calculateHighDensityArea() {
        if (this.densidadPoblacional == null) {
            return 0;
        }
        return this.densidadPoblacional > 30000 ? 1 : 0;
    }

    /**
     * Calcula el bracket de ingreso basado en ingreso mediano
     * 
     * @return "Low", "Medium", o "High"
     */
    public String calculateIncomeBracket() {
        if (this.ingresoMediano == null) {
            return "Medium"; // Default
        }

        if (this.ingresoMediano < 50000) {
            return "Low";
        } else if (this.ingresoMediano < 80000) {
            return "Medium";
        } else {
            return "High";
        }
    }

    /**
     * Obtiene el borough risk CALCULADO (expuesto en JSON)
     * Siempre calcula dinámicamente, ignora valor de BD
     */
    @JsonProperty("boroughRisk")
    public Double getBoroughRiskCalculated() {
        return calculateBoroughRisk();
    }

    /**
     * Obtiene high density area CALCULADO (expuesto en JSON)
     * Siempre calcula dinámicamente, ignora valor de BD
     */
    @JsonProperty("highDensityArea")
    public Integer getHighDensityAreaCalculated() {
        return calculateHighDensityArea();
    }

    /**
     * Obtiene income bracket CALCULADO (expuesto en JSON)
     * Siempre calcula dinámicamente, ignora valor de BD
     */
    @JsonProperty("incomeBracket")
    public String getIncomeBracketCalculated() {
        return calculateIncomeBracket();
    }

    // ========== MÉTODOS DE MIGRACIÓN (Deprecados y Ocultos en JSON) ==========
    // Estos métodos permiten migración gradual pero eventualmente se eliminarán

    /**
     * @deprecated Usar getBoroughRiskCalculated() en su lugar
     */
    @Deprecated
    @JsonIgnore // No serializar en JSON
    public Double getBoroughRiskOrCalculate() {
        return calculateBoroughRisk();
    }

    /**
     * @deprecated Usar getHighDensityAreaCalculated() en su lugar
     */
    @Deprecated
    @JsonIgnore // No serializar en JSON
    public Integer getHighDensityAreaOrCalculate() {
        return calculateHighDensityArea();
    }

    /**
     * @deprecated Usar getIncomeBracketCalculated() en su lugar
     */
    @Deprecated
    @JsonIgnore // No serializar en JSON
    public String getIncomeBracketOrCalculate() {
        return calculateIncomeBracket();
    }

    // ========== GETTERS/SETTERS EXPLÍCITOS PARA CAMPOS GEOGRÁFICOS ==========
    // Lombok a veces no genera estos correctamente, así que los agregamos
    // explícitamente

    public String getBorough() {
        return borough;
    }

    public void setBorough(String borough) {
        this.borough = borough;
    }

    public String getCodigoPostal() {
        return codigoPostal;
    }

    public void setCodigoPostal(String codigoPostal) {
        this.codigoPostal = codigoPostal;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDate getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDate fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
}