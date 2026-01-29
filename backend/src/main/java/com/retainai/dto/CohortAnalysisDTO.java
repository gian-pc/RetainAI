package com.retainai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CohortAnalysisDTO {
    @JsonProperty("tenure_group")
    private String tenureGroup;

    private Integer total;
    private Integer churned;

    @JsonProperty("churn_rate")
    private Double churnRate;
}
