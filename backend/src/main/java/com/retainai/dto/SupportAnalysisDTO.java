package com.retainai.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SupportAnalysisDTO {
    private String ticketRange;
    private Integer customers;
    private Double churnRate;
}
