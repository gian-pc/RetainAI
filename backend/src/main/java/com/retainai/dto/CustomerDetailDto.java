package com.retainai.dto;

import com.retainai.models.Subscription;
import com.retainai.models.CustomerMetrics;
import lombok.Data;

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
    private Subscription subscription;
    private CustomerMetrics metrics;
}