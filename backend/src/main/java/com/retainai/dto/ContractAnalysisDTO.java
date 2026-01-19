package com.retainai.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ContractAnalysisDTO {
    private String contractType;
    private Integer customers;
    private Double churnRate;
    private Double avgRevenue;
}
