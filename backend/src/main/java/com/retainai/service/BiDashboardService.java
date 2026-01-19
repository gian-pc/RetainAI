package com.retainai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Servicio para consumir las APIs de Business Intelligence del backend de
 * Python
 * Actúa como proxy entre el frontend y el servicio de ML/Analytics
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BiDashboardService {

    private final RestTemplate restTemplate;

    @Value("${app.python-service.url}")
    private String pythonUrl;

    /**
     * Obtiene estadísticas principales del dashboard desde Python
     */
    public Map<String, Object> getDashboardStatsFromPython() {
        try {
            log.info("📊 Obteniendo stats de dashboard desde Python: {}/api/dashboard/stats", pythonUrl);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    pythonUrl + "/api/dashboard/stats",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            return response.getBody();
        } catch (Exception e) {
            log.error("❌ Error obteniendo stats de Python: {}", e.getMessage());
            throw new RuntimeException("Error conectando con servicio de BI", e);
        }
    }

    /**
     * Obtiene análisis de segmentación desde Python
     */
    public Map<String, Object> getSegmentationData() {
        try {
            log.info("🎯 Obteniendo segmentación desde Python");

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    pythonUrl + "/api/dashboard/segments",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            return response.getBody();
        } catch (Exception e) {
            log.error("❌ Error obteniendo segmentación: {}", e.getMessage());
            throw new RuntimeException("Error obteniendo segmentación", e);
        }
    }

    /**
     * Obtiene datos geográficos para heatmap desde Python
     */
    public Map<String, Object> getGeographicData() {
        try {
            log.info("🗺️ Obteniendo datos geográficos desde Python");

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    pythonUrl + "/api/dashboard/geographic",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            return response.getBody();
        } catch (Exception e) {
            log.error("❌ Error obteniendo datos geográficos: {}", e.getMessage());
            throw new RuntimeException("Error obteniendo datos geográficos", e);
        }
    }

    /**
     * Obtiene alertas de clientes en riesgo desde Python
     */
    public Map<String, Object> getAlerts() {
        try {
            log.info("⚠️ Obteniendo alertas desde Python");

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    pythonUrl + "/api/dashboard/alerts",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            return response.getBody();
        } catch (Exception e) {
            log.error("❌ Error obteniendo alertas: {}", e.getMessage());
            throw new RuntimeException("Error obteniendo alertas", e);
        }
    }

    /**
     * Obtiene análisis de cohortes por antigüedad desde Python
     */
    public Map<String, Object> getCohortAnalysis() {
        try {
            log.info("⏰ Obteniendo análisis de cohortes desde Python");

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    pythonUrl + "/api/dashboard/cohorts",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            return response.getBody();
        } catch (Exception e) {
            log.error("❌ Error obteniendo cohortes: {}", e.getMessage());
            throw new RuntimeException("Error obteniendo cohortes", e);
        }
    }

    /**
     * Obtiene análisis de engagement desde Python
     */
    public Map<String, Object> getEngagementAnalysis() {
        try {
            log.info("📱 Obteniendo análisis de engagement desde Python");

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    pythonUrl + "/api/dashboard/engagement",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            return response.getBody();
        } catch (Exception e) {
            log.error("❌ Error obteniendo engagement: {}", e.getMessage());
            throw new RuntimeException("Error obteniendo engagement", e);
        }
    }

    /**
     * Obtiene análisis de sensibilidad al precio desde Python
     */
    public Map<String, Object> getPriceSensitivity() {
        try {
            log.info("💵 Obteniendo análisis de precio desde Python");

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    pythonUrl + "/api/dashboard/pricing",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            return response.getBody();
        } catch (Exception e) {
            log.error("❌ Error obteniendo pricing: {}", e.getMessage());
            throw new RuntimeException("Error obteniendo pricing", e);
        }
    }

    /**
     * Obtiene top clientes en riesgo desde Python
     */
    public Map<String, Object> getTopRiskCustomers(int limit) {
        try {
            log.info("🔮 Obteniendo top {} clientes en riesgo desde Python", limit);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    pythonUrl + "/api/dashboard/top-risk?limit=" + limit,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            return response.getBody();
        } catch (Exception e) {
            log.error("❌ Error obteniendo top risk: {}", e.getMessage());
            throw new RuntimeException("Error obteniendo top risk customers", e);
        }
    }
}
