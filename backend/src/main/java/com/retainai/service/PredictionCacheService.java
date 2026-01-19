package com.retainai.service;

import com.retainai.dto.PredictionResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/**
 * Servicio de caché para predicciones de churn
 * Reduce llamadas al modelo ML de Python usando Spring Cache
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PredictionCacheService {

    private final PythonIntegrationService pythonService;

    /**
     * Obtiene predicción con caché
     * TTL configurado en application.properties (15 minutos)
     */
    @Cacheable(value = "predictions", key = "#customerId")
    public PredictionResponseDto getPrediction(String customerId) {
        log.info("🔮 Cache MISS para cliente: {} - Llamando a ML", customerId);
        return pythonService.predictChurnForCustomer(customerId);
    }

    /**
     * Invalida caché para un cliente específico
     */
    @CacheEvict(value = "predictions", key = "#customerId")
    public void invalidate(String customerId) {
        log.info("🗑️  Cache invalidado para cliente: {}", customerId);
    }

    /**
     * Limpia todo el caché de predicciones
     */
    @CacheEvict(value = "predictions", allEntries = true)
    public void invalidateAll() {
        log.info("🗑️  Cache completo de predicciones invalidado");
    }
}
