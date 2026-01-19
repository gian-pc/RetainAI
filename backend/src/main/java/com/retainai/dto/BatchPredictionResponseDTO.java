package com.retainai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchPredictionResponseDTO {
    private Integer totalProcessed;
    private Integer successCount;
    private Integer errorCount;
    private List<PredictionResult> results;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PredictionResult {
        private String customerId;
        private String risk;
        private Double probability;
        private String mainFactor;
        private String nextBestAction;
        private String error;
    }
}
