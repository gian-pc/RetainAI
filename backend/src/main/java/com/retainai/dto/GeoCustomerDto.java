package com.retainai.dto;

public record GeoCustomerDto(
        String id,
        Double lat,
        Double lng,
        String churnRisk, // "High", "Medium", "Low"
        Double monthlyFee // Para el radio del punto
) {}