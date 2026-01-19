package com.retainai.dto;

import com.retainai.model.Subscription;
import com.retainai.model.CustomerMetrics;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CustomerDetailDto {
    private String id;
    private String genero;
    private Integer edad;
    private String pais;
    private String ciudad;
    private String segmento;
    private Double latitud;
    private Double longitud;

    // Nuevos campos geográficos
    private String borough;
    private String codigoPostal;
    private String estado;
    private LocalDate fechaRegistro;

    private Subscription subscription;
    private CustomerMetrics metrics;
}