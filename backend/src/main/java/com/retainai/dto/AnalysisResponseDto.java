package com.retainai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResponseDto {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer totalCustomers;
    private Integer successfulPredictions;
    private Integer failedPredictions;
    private Integer highRiskCount;
    private Integer mediumRiskCount;
    private Integer lowRiskCount;
    private String message;
}
