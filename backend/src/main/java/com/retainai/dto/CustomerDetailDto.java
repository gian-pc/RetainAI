package com.retainai.dto;

import com.retainai.model.Subscription;
import com.retainai.model.CustomerMetrics;
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