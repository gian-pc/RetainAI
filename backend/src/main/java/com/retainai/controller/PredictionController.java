package com.retainai.controller;

import com.retainai.dto.PredictionResponseDto;
import com.retainai.service.PythonIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class PredictionController {

    private final PythonIntegrationService pythonIntegrationService;

    // POST: /api/customers/CUST_001/predict
    @PostMapping("/{id}/predict")
    public ResponseEntity<PredictionResponseDto> predictChurn(@PathVariable String id) {
        // Delegamos al servicio que conecta con Python
        PredictionResponseDto response = pythonIntegrationService.predictChurnForCustomer(id);
        return ResponseEntity.ok(response);
    }
}