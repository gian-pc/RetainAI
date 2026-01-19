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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Cliente no encontrado: " + customerId));

        // 2. Transformar a JSON Plano (Flattening)
        PredictionInputDto payload = mapToFlatJson(customer);

        // 3. Detectar si el cliente ya abandonó (se enviará al modelo para análisis
        // dinámico)
        boolean yaAbandono = customer.getMetrics() != null &&
                customer.getMetrics().getAbandonoHistorico() != null &&
                customer.getMetrics().getAbandonoHistorico();

        if (yaAbandono) {
            log.info("ℹ️ Cliente {} ya abandonó. El modelo de IA generará estrategia de win-back personalizada.",
                    customerId);
        }

        // 4. Llamar a Python con manejo de errores robusto (SIEMPRE, sin excepciones)
        try {
            log.info("📡 Enviando cliente {} a evaluar a: {}/predict", customerId, pythonUrl);

            // Hacemos el POST y esperamos el ResponseDto
            return restTemplate.postForObject(
                    pythonUrl + "/predict",
                    payload,
                    PredictionResponseDto.class);

        } catch (ResourceAccessException e) {
            // Captura Timeout o si el servidor Python está apagado
            log.error("❌ Error de conexión con IA: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "El servicio de IA no responde. Intente más tarde.");
        } catch (Exception e) {
            log.error("❌ Error desconocido al predecir: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error interno al procesar la predicción");
        }
    }

    // Helper privado para mapear entidad Customer completa al DTO (ahora con datos
    // comportamentales)
    private PredictionInputDto mapToFlatJson(Customer c) {
        // Validación: Necesitamos al menos la suscripción
        if (c.getSubscription() == null) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "El cliente no tiene suscripción asociada");
        }

        var sub = c.getSubscription();
        var metrics = c.getMetrics(); // Puede ser null

        // Calcular campos derivados
        Double cargoMensual = sub.getCuotaMensual() != null ? sub.getCuotaMensual() : 50.0;
        Double ingresoMediano = c.getIngresoMediano() != null ? c.getIngresoMediano() : 50000.0;
        Double ratioPrecioIngreso = cargoMensual / ingresoMediano;

        // Datos comportamentales con defaults seguros
        Integer ticketsSoporte = (metrics != null && metrics.getTicketsSoporte() != null) ? metrics.getTicketsSoporte()
                : 0;
        Integer escaladas = (metrics != null && metrics.getEscaladasSoporte() != null) ? metrics.getEscaladasSoporte()
                : 0;
        Double nps = (metrics != null && metrics.getScoreNps() != null) ? metrics.getScoreNps().doubleValue() : 50.0;
        Double csat = (metrics != null && metrics.getScoreCsat() != null) ? metrics.getScoreCsat().doubleValue() : 3.0;
        String tipoQueja = (metrics != null && metrics.getTipoQueja() != null) ? metrics.getTipoQueja() : "Ninguna";

        // Calcular flags
        Integer hasQueja = tipoQueja.equals("Ninguna") ? 0 : 1;
        Integer altoTickets = ticketsSoporte >= 5 ? 1 : 0;

        // Categorizar NPS (0-30: Detractor, 31-70: Pasivo, 71-100: Promotor)
        String npsCategoria = nps < 30 ? "Detractor" : (nps <= 70 ? "Pasivo" : "Promotor");

        // Categorizar CSAT (1-2.5: Insatisfecho, 2.5-3.5: Neutral, 3.5-5: Satisfecho)
        String csatCategoria = csat < 2.5 ? "Insatisfecho" : (csat < 3.5 ? "Neutral" : "Satisfecho");

        return PredictionInputDto.builder()
                // ========== DEMOGRÁFICOS (4 campos) ==========
                .genero(c.getGenero())
                .esMayor(c.getEsMayor() != null ? c.getEsMayor() : 0)
                .tienePareja(c.getTienePareja() != null ? c.getTienePareja() : "No")
                .tieneDependientes(c.getTieneDependientes() != null ? c.getTieneDependientes() : "No")

                // ========== GEOGRÁFICOS (4 campos) ==========
                .ingresoMediano(ingresoMediano)
                .densidadPoblacional(c.getDensidadPoblacional() != null ? c.getDensidadPoblacional() : 15000.0)
                .boroughRisk(c.calculateBoroughRisk()) // ✅ Ahora se calcula dinámicamente
                .highDensityArea(c.calculateHighDensityArea()) // ✅ Ahora se calcula dinámicamente

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
                .serviciosPremiumCount(sub.calculateServiciosPremiumCount()) // ✅ Ahora se calcula dinámicamente

                // ========== CONTRATO (5 campos) ==========
                .tipoContrato(sub.getTipoContrato() != null ? sub.getTipoContrato() : "Mensual")
                .facturacionSinPapel(sub.getFacturacionSinPapel() != null ? sub.getFacturacionSinPapel() : "No")
                .metodoPago(sub.getMetodoPago() != null ? sub.getMetodoPago() : "Cheque electrónico")
                .antiguedad(sub.getMesesPermanencia() != null ? sub.getMesesPermanencia() : 1)
                .tenureGroup(sub.calculateTenureGroup()) // ✅ Ahora se calcula dinámicamente

                // ========== FINANCIERO (2 campos) ==========
                .cargoMensual(cargoMensual)
                .cargosTotal(sub.getIngresosTotales() != null ? sub.getIngresosTotales() : 100.0)

                // ========== SEGMENTACIÓN (2 campos) ==========
                .segmentoCliente(c.getSegmento() != null ? c.getSegmento() : "Residencial")
                .incomeBracket(c.calculateIncomeBracket()) // ✅ Ahora se calcula dinámicamente
                // ⚠️ REMOVIDOS: nivelRiesgo, scoreRiesgo, riskFlag (eran data leakage - el
                // modelo los predice, no los usa como input)

                // ========== COMPORTAMIENTO Y SATISFACCIÓN (CRÍTICO) ==========
                // Soporte y quejas
                .ticketsSoporte(ticketsSoporte)
                .escaladas(escaladas)
                .tipoDeQueja(tipoQueja)
                .hasQueja(hasQueja)
                .altoTickets(altoTickets)
                .tiempoResolucion((metrics != null && metrics.getTiempoResolucion() != null)
                        ? metrics.getTiempoResolucion().doubleValue()
                        : 24.0)

                // Satisfacción del cliente
                .puntuacionNPS(nps)
                .puntuacionCSAT(csat)
                .npsCategoria(npsCategoria)
                .csatCategoria(csatCategoria)

                // Engagement
                .tasaAperturaEmail((metrics != null && metrics.getTasaAperturaEmail() != null)
                        ? metrics.getTasaAperturaEmail().doubleValue()
                        : 0.5)

                // Precio relativo
                .ratioPrecioIngreso(ratioPrecioIngreso)

                .build();
    }
}