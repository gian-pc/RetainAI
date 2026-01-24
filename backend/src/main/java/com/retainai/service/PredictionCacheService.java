package com.retainai.service;

import com.retainai.dto.PredictionResponseDto;
import com.retainai.model.AiPrediction;
import com.retainai.repository.PredictionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

/**
 * ⚡ Servicio de lectura de predicciones DESDE LA BD (ai_predictions)
 *
 * IMPORTANTE: Este servicio YA NO llama a Python
 * - Lee predicciones guardadas en la tabla ai_predictions
 * - Predicciones generadas por batch prediction masivo
 * - Python solo se usa para batch predictions, NO para consultas individuales
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PredictionCacheService {

    private final PredictionRepository predictionRepository;

    /**
     * Obtiene la predicción MÁS RECIENTE para un cliente desde la BD
     * NO llama a Python - solo lee de ai_predictions
     *
     * @param customerId ID del cliente
     * @return Predicción más reciente o null si no existe
     */
    @Cacheable(value = "predictions", key = "#customerId")
    public PredictionResponseDto getPrediction(String customerId) {
        log.debug("📊 Buscando predicción en BD para cliente: {}", customerId);

        // Buscar TODAS las predicciones del cliente (puede haber historial)
        List<AiPrediction> predictions = predictionRepository.findByCustomerId(customerId);

        if (predictions == null || predictions.isEmpty()) {
            log.warn("⚠️  No hay predicción para cliente: {} - Debe ejecutar batch prediction", customerId);
            return null;
        }

        // Obtener la predicción MÁS RECIENTE (por fecha)
        AiPrediction latest = predictions.stream()
                .max(Comparator.comparing(AiPrediction::getFechaAnalisis))
                .orElse(null);

        if (latest == null) {
            return null;
        }

        log.debug("✅ Predicción encontrada en BD para cliente: {} (fecha: {})",
                customerId, latest.getFechaAnalisis());

        // Mapear AiPrediction → PredictionResponseDto
        return mapToPredictionResponseDto(latest);
    }

    /**
     * Mapea AiPrediction (BD) a PredictionResponseDto (API)
     */
    private PredictionResponseDto mapToPredictionResponseDto(AiPrediction prediction) {
        // Generar nextBestAction basado en el motivoPrincipal
        String nextBestAction = generateNextBestAction(prediction.getMotivoPrincipal());

        // Usar AllArgsConstructor: probability, nivelRiesgo, mainFactor, nextBestAction
        return new PredictionResponseDto(
                prediction.getProbabilidadFuga(),
                prediction.getNivelRiesgo(),
                prediction.getMotivoPrincipal(),
                nextBestAction
        );
    }

    /**
     * Genera sugerencia de acción basada en el motivo principal
     */
    private String generateNextBestAction(String mainFactor) {
        if (mainFactor == null) {
            return "Contactar al cliente";
        }

        // Mapeo simple de motivos a acciones
        return switch (mainFactor.toLowerCase()) {
            case "precio alto", "high price" -> "Ofrecer descuento del 20%";
            case "baja actividad", "low activity" -> "Ofrecer capacitación gratuita";
            case "falla técnica", "technical issue" -> "Asignar soporte técnico prioritario";
            case "competencia", "competition" -> "Mostrar ventajas competitivas";
            case "servicio limitado", "limited service" -> "Ofrecer upgrade de plan";
            default -> "Contactar para entender necesidades";
        };
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
     * Útil después de ejecutar batch prediction masivo
     */
    @CacheEvict(value = "predictions", allEntries = true)
    public void invalidateAll() {
        log.info("🗑️  Cache completo de predicciones invalidado");
    }
}
