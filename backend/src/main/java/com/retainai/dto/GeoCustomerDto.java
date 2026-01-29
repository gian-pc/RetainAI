package com.retainai.dto;

public record GeoCustomerDto(
                String id,
                Double latitud,
                Double longitud,
                String churnRisk, // "High", "Medium", "Low"
                Double monthlyFee // Para el radio del punto
) {
    public GeoCustomerDto(String id, Double latitud, Double longitud, String churnRisk) {
        this(id, latitud, longitud, churnRisk, 0.0);
    }
}