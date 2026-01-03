package com.retainai.service;

import com.retainai.dto.PredictionInputDto;
import com.retainai.dto.PredictionResponseDto;
import com.retainai.model.Customer;
import com.retainai.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class PythonIntegrationService {

    private final CustomerRepository customerRepository;
    private final RestTemplate restTemplate;

    // Leemos la URL del application.properties
    @Value("${app.python-service.url}")
    private String pythonUrl;

    public PredictionResponseDto predictChurnForCustomer(String customerId) {
        // 1. Recuperar Data Compleja de MySQL
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado: " + customerId));

        // 2. Transformar a JSON Plano (Flattening)
        PredictionInputDto payload = mapToFlatJson(customer);

        // 3. Llamar a Python con manejo de errores robusto
        try {
            log.info("📡 Enviando cliente {} a evaluar a: {}/predict", customerId, pythonUrl);

            // Hacemos el POST y esperamos el ResponseDto
            return restTemplate.postForObject(
                    pythonUrl + "/predict",
                    payload,
                    PredictionResponseDto.class
            );

        } catch (ResourceAccessException e) {
            // Captura Timeout o si el servidor Python está apagado
            log.error("❌ Error de conexión con IA: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "El servicio de IA no responde. Intente más tarde.");
        } catch (Exception e) {
            log.error("❌ Error desconocido al predecir: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno al procesar la predicción");
        }
    }

    // Helper privado para "aplanar" la entidad compleja a DTO simple
    private PredictionInputDto mapToFlatJson(Customer c) {
        // Validación de Seniority: ¿Qué pasa si falta info crítica?
        if (c.getMetrics() == null || c.getSubscription() == null) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "El cliente tiene datos incompletos (Faltan métricas o suscripción)");
        }

        return PredictionInputDto.builder()
                .edad(c.getEdad())
                .genero(c.getGenero())
                // Sacamos datos del objeto hijo 'Subscription'
                .mesesPermanencia(c.getSubscription().getMesesPermanencia())
                .cuotaMensual(c.getSubscription().getCuotaMensual().doubleValue())
                // Sacamos datos del objeto hijo 'Metrics'
                .totalTickets(c.getMetrics().getTicketsSoporte())
                // Convertimos el Float a Integer (quitando decimales si los tiene)
                .scoreCsat(c.getMetrics().getScoreCsat().intValue())
                // Convertimos de Float a Double
                .usoPromedio(c.getMetrics().getPromedioConeccion().doubleValue())
                .build();
    }
}