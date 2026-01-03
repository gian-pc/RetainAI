package com.retainai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSummaryDto {
    private String id;
    private String pais;
    private String ciudad;
    private String segmento;
    private boolean abandonado; 
}