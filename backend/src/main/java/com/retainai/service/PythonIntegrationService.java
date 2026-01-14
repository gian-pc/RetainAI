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

    // Helper privado para mapear entidad Customer completa al DTO NYC (30 campos)
    private PredictionInputDto mapToFlatJson(Customer c) {
        // Validación: Necesitamos al menos la suscripción
        if (c.getSubscription() == null) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "El cliente no tiene suscripción asociada");
        }

        var sub = c.getSubscription();

        return PredictionInputDto.builder()
                // ========== DEMOGRÁFICOS (4 campos) ==========
                .genero(c.getGenero())
                .esMayor(c.getEsMayor() != null ? c.getEsMayor() : 0)
                .tienePareja(c.getTienePareja() != null ? c.getTienePareja() : "No")
                .tieneDependientes(c.getTieneDependientes() != null ? c.getTieneDependientes() : "No")

                // ========== GEOGRÁFICOS (4 campos) ==========
                .ingresoMediano(c.getIngresoMediano() != null ? c.getIngresoMediano() : 50000.0)
                .densidadPoblacional(c.getDensidadPoblacional() != null ? c.getDensidadPoblacional() : 15000.0)
                .boroughRisk(c.getBoroughRisk() != null ? c.getBoroughRisk() : 20.0)
                .highDensityArea(c.getHighDensityArea() != null ? c.getHighDensityArea() : 0)

                // ========== SERVICIOS (10 campos) ==========
                .servicioTelefono(sub.getServicioTelefono() != null ? sub.getServicioTelefono() : "No")
                .lineasMultiples(sub.getLineasMultiples() != null ? sub.getLineasMultiples() : "No")
                .tipoInternet(sub.getTipoInternet() != null ? sub.getTipoInternet() : "No")
                .seguridadOnline(sub.getSeguridadOnline() != null ? sub.getSeguridadOnline() : "No")
                .respaldoOnline(sub.getRespaldoOnline() != null ? sub.getRespaldoOnline() : "No")
                .proteccionDispositivo(sub.getProteccionDispositivo() != null ? sub.getProteccionDispositivo() : "No")
                .soporteTecnico(sub.getSoporteTecnico() != null ? sub.getSoporteTecnico() : "No")
                .streamingTV(sub.getStreamingTV() != null ? sub.getStreamingTV() : "No")
                .streamingPeliculas(sub.getStreamingPeliculas() != null ? sub.getStreamingPeliculas() : "No")
                .serviciosPremiumCount(sub.getServiciosPremiumCount() != null ? sub.getServiciosPremiumCount() : 0)

                // ========== CONTRATO (5 campos) ==========
                .tipoContrato(sub.getTipoContrato() != null ? sub.getTipoContrato() : "Mensual")
                .facturacionSinPapel(sub.getFacturacionSinPapel() != null ? sub.getFacturacionSinPapel() : "No")
                .metodoPago(sub.getMetodoPago() != null ? sub.getMetodoPago() : "Cheque electrónico")
                .antiguedad(sub.getMesesPermanencia() != null ? sub.getMesesPermanencia() : 1)
                .tenureGroup(sub.getTenureGroup() != null ? sub.getTenureGroup() : "0-12 meses")

                // ========== FINANCIERO (2 campos) ==========
                .cargoMensual(sub.getCuotaMensual() != null ? sub.getCuotaMensual() : 50.0)
                .cargosTotal(sub.getIngresosTotales() != null ? sub.getIngresosTotales() : 100.0)

                // ========== SEGMENTACIÓN (4 campos) ==========
                .segmentoCliente(c.getSegmento() != null ? c.getSegmento() : "Residencial")
                .incomeBracket(c.getIncomeBracket() != null ? c.getIncomeBracket() : "Medium")
                .nivelRiesgo(sub.getNivelRiesgo() != null ? sub.getNivelRiesgo() : "Medio")
                .scoreRiesgo(sub.getScoreRiesgo() != null ? sub.getScoreRiesgo() : 5.0)
                .riskFlag(sub.getRiskFlag() != null ? sub.getRiskFlag() : 0)

                .build();
    }
}