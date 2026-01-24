package com.retainai.service;

import com.retainai.dto.PredictionInputDto;
import com.retainai.dto.PredictionInputDtoV2;
import com.retainai.dto.PredictionResponseDto;
import com.retainai.dto.BatchPredictionResponseDTO;
import com.retainai.model.Customer;
import com.retainai.model.CustomerMetrics;
import com.retainai.model.Subscription;
import com.retainai.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import com.retainai.model.AiPrediction;
import com.retainai.repository.PredictionRepository;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PythonIntegrationService {

        private final CustomerRepository customerRepository;
        private final RestTemplate restTemplate;
        private final PredictionRepository predictionRepository;

        // Leemos la URL del application.properties
        @Value("${app.python-service.url}")
        private String pythonUrl;

        public PredictionResponseDto predictChurnForCustomer(String customerId) {
                // 1. Recuperar Data Compleja de MySQL
                Customer customer = customerRepository.findById(customerId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Cliente no encontrado: " + customerId));

                // 2. Transformar a JSON Plano (Flattening) - Usando nuevo modelo V2 (24
                // features)
                PredictionInputDtoV2 payload = mapToFlatJsonV2(customer);

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

                        // Llamar a Python y obtener predicción
                        PredictionResponseDto pythonResponse = restTemplate.postForObject(
                                        pythonUrl + "/predict",
                                        payload,
                                        PredictionResponseDto.class);

                        if (pythonResponse == null) {
                                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                                                "Python devolvió respuesta nula");
                        }

                        // Guardar predicción en BD (nivel_riesgo se calcula en @PrePersist)
                        AiPrediction aiPrediction = AiPrediction.builder()
                                        .customer(customer)
                                        .probabilidadFuga(pythonResponse.getProbability())
                                        .motivoPrincipal(pythonResponse.getMainFactor())
                                        .fechaAnalisis(LocalDateTime.now())
                                        .build();

                        AiPrediction savedPrediction = predictionRepository.save(aiPrediction);

                        // Agregar nivel_riesgo calculado al response
                        pythonResponse.setNivelRiesgo(savedPrediction.getNivelRiesgo());

                        return pythonResponse;

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
                Integer ticketsSoporte = (metrics != null && metrics.getTicketsSoporte() != null)
                                ? metrics.getTicketsSoporte()
                                : 0;
                Integer escaladas = (metrics != null && metrics.getEscaladasSoporte() != null)
                                ? metrics.getEscaladasSoporte()
                                : 0;
                Double nps = (metrics != null && metrics.getScoreNps() != null) ? metrics.getScoreNps().doubleValue()
                                : 50.0;
                Double csat = (metrics != null && metrics.getScoreCsat() != null) ? metrics.getScoreCsat().doubleValue()
                                : 3.0;
                String tipoQueja = (metrics != null && metrics.getTipoQueja() != null) ? metrics.getTipoQueja()
                                : "Ninguna";

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
                                .densidadPoblacional(c.getDensidadPoblacional() != null ? c.getDensidadPoblacional()
                                                : 15000.0)
                                .boroughRisk(c.calculateBoroughRisk()) // ✅ Ahora se calcula dinámicamente
                                .highDensityArea(c.calculateHighDensityArea()) // ✅ Ahora se calcula dinámicamente

                                // ========== SERVICIOS (10 campos) ==========
                                .servicioTelefono(sub.getServicioTelefono() != null ? sub.getServicioTelefono() : "No")
                                .lineasMultiples(sub.getLineasMultiples() != null ? sub.getLineasMultiples() : "No")
                                .tipoInternet(sub.getTipoInternet() != null ? sub.getTipoInternet() : "No")
                                .seguridadOnline(sub.getSeguridadOnline() != null ? sub.getSeguridadOnline() : "No")
                                .respaldoOnline(sub.getRespaldoOnline() != null ? sub.getRespaldoOnline() : "No")
                                .proteccionDispositivo(
                                                sub.getProteccionDispositivo() != null ? sub.getProteccionDispositivo()
                                                                : "No")
                                .soporteTecnico(sub.getSoporteTecnico() != null ? sub.getSoporteTecnico() : "No")
                                .streamingTV(sub.getStreamingTV() != null ? sub.getStreamingTV() : "No")
                                .streamingPeliculas(sub.getStreamingPeliculas() != null ? sub.getStreamingPeliculas()
                                                : "No")
                                .serviciosPremiumCount(sub.calculateServiciosPremiumCount()) // ✅ Ahora se calcula
                                                                                             // dinámicamente

                                // ========== CONTRATO (5 campos) ==========
                                .tipoContrato(sub.getTipoContrato() != null ? sub.getTipoContrato() : "Mensual")
                                .facturacionSinPapel(sub.getFacturacionSinPapel() != null ? sub.getFacturacionSinPapel()
                                                : "No")
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

        /**
         * Mapea Customer a PredictionInputDtoV2 (Modelo Optimizado - 24 features RAW)
         * Este método prepara EXACTAMENTE las 24 features que espera el nuevo modelo
         */
        private PredictionInputDtoV2 mapToFlatJsonV2(Customer c) {
                // Validación: Necesitamos al menos la suscripción y métricas
                if (c.getSubscription() == null) {
                        throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                                        "El cliente no tiene suscripción asociada");
                }

                Subscription sub = c.getSubscription();
                CustomerMetrics metrics = c.getMetrics(); // Puede ser null

                // ========== CALCULAR CAMPOS DERIVADOS ==========

                // 1. Intensidad de uso = conexiones * promedio
                Double conexiones = metrics != null && metrics.getConeccionesMensuales() != null
                                ? metrics.getConeccionesMensuales().doubleValue()
                                : 0.0;
                Double promedioConex = metrics != null && metrics.getPromedioConeccion() != null
                                ? metrics.getPromedioConeccion().doubleValue()
                                : 0.0;
                Double intensidadUso = conexiones * promedioConex;

                // 2. Ratio carga financiera = cargo_mensual / ingresos_totales
                Double cargoMensual = sub.getCuotaMensual() != null ? sub.getCuotaMensual() : 50.0;
                Double ingresosTotales = sub.getIngresosTotales() != null ? sub.getIngresosTotales() : 100.0;
                Double ratioCarga = ingresosTotales > 0 ? cargoMensual / ingresosTotales : 0.0;

                // 3. Días desde último contacto soporte
                Integer diasDesdeContacto = 0;
                if (metrics != null && metrics.getUltimoContactoSoporte() != null) {
                        diasDesdeContacto = (int) ChronoUnit.DAYS.between(
                                        metrics.getUltimoContactoSoporte(),
                                        LocalDate.now());
                }

                // ========== CONSTRUIR DTO CON LAS 23 FEATURES (SIN DATA LEAKAGE) ==========
                return PredictionInputDtoV2.builder()
                                // scoreRiesgo eliminado - modelo reentrenado sin data leakage
                                .diasActivosSemanales(metrics != null && metrics.getDiasActivosSemanales() != null
                                                ? metrics.getDiasActivosSemanales()
                                                : 0)
                                .promedioConexion(promedioConex)
                                .conexionesMensuales(metrics != null && metrics.getConeccionesMensuales() != null
                                                ? metrics.getConeccionesMensuales()
                                                : 0)
                                .caracteristicasUsadas(metrics != null && metrics.getCaracteristicasUsadas() != null
                                                ? metrics.getCaracteristicasUsadas()
                                                : 0)
                                .diasUltimaConexion(metrics != null && metrics.getDiasUltimaConeccion() != null
                                                ? metrics.getDiasUltimaConeccion()
                                                : 0)
                                .intensidadUso(intensidadUso)
                                .ticketsSoporte(metrics != null && metrics.getTicketsSoporte() != null
                                                ? metrics.getTicketsSoporte()
                                                : 0)
                                .puntuacionNps(metrics != null && metrics.getScoreNps() != null
                                                ? metrics.getScoreNps().doubleValue()
                                                : 50.0)
                                .tasaCrecimientoUso(metrics != null && metrics.getTasaCrecimientoUso() != null
                                                ? metrics.getTasaCrecimientoUso().doubleValue()
                                                : 0.0)
                                .puntuacionCsat(metrics != null && metrics.getScoreCsat() != null
                                                ? metrics.getScoreCsat().doubleValue()
                                                : 3.0)
                                .ratioCargaFinanciera(ratioCarga)
                                .tasaAperturaEmail(metrics != null && metrics.getTasaAperturaEmail() != null
                                                ? metrics.getTasaAperturaEmail().doubleValue()
                                                : 0.5)
                                .erroresPago(sub.getErroresPago() != null ? sub.getErroresPago() : 0)
                                .antiguedad(sub.getMesesPermanencia() != null ? sub.getMesesPermanencia() : 1)
                                .ingresosTotales(ingresosTotales)
                                .latitud(c.getLatitud() != null ? c.getLatitud() : 0.0)
                                .cargoMensual(cargoMensual)
                                .tiempoResolucion(metrics != null && metrics.getTiempoResolucion() != null
                                                ? metrics.getTiempoResolucion().doubleValue()
                                                : 24.0)
                                .longitud(c.getLongitud() != null ? c.getLongitud() : 0.0)
                                .codigoPostal(c.getCodigoPostal() != null ? c.getCodigoPostal() : "00000")
                                .edad(c.getEdad() != null ? c.getEdad() : 30)
                                .diasDesdeUltimoContacto(diasDesdeContacto)
                                .tiempoSesionPromedio(metrics != null && metrics.getTiempoSesionPromedio() != null
                                                ? metrics.getTiempoSesionPromedio().doubleValue()
                                                : 0.0)
                                .build();
        }

        /**
         * ⚡ Predicción batch masiva OPTIMIZADA para TODOS los clientes en la BD
         * 🚀 Usa batch inserts (saveAll) - 10-15x más rápido que saves individuales
         * 📦 Procesa en lotes de 5000 (Python puede manejar grandes cantidades)
         *
         * @return BatchPredictionResponseDTO con resumen y resultados
         */
        public BatchPredictionResponseDTO predictAllCustomers() {
                log.info("🚀 [BATCH-ALL] Iniciando predicción masiva OPTIMIZADA de TODOS los clientes...");
                long startTime = System.currentTimeMillis();

                // 1. Obtener TODOS los clientes de la BD
                List<Customer> allCustomers = customerRepository.findAll();
                int totalCustomers = allCustomers.size();

                log.info("📊 Total de clientes a procesar: {}", totalCustomers);

                if (totalCustomers == 0) {
                        log.warn("⚠️  No hay clientes en la base de datos");
                        return BatchPredictionResponseDTO.builder()
                                        .totalProcessed(0)
                                        .successCount(0)
                                        .errorCount(0)
                                        .results(new ArrayList<>())
                                        .build();
                }

                // 2. Mapear todos los clientes a DTOs
                log.info("🔄 Mapeando {} clientes a formato ML...", totalCustomers);
                List<PredictionInputDtoV2> allPayloads = allCustomers.stream()
                                .map(this::mapToFlatJsonV2)
                                .collect(Collectors.toList());

                // 3. Dividir en lotes GRANDES de 5000 (Python puede manejar esto eficientemente)
                int batchSize = 5000;
                List<List<PredictionInputDtoV2>> batches = new ArrayList<>();
                for (int i = 0; i < allPayloads.size(); i += batchSize) {
                        int end = Math.min(i + batchSize, allPayloads.size());
                        batches.add(allPayloads.subList(i, end));
                }

                log.info("📦 Dividido en {} lotes de hasta {} clientes", batches.size(), batchSize);

                // 4. Procesar cada lote y acumular resultados
                int successCount = 0;
                int errorCount = 0;
                List<BatchPredictionResponseDTO.PredictionResult> allResults = new ArrayList<>();

                for (int batchIndex = 0; batchIndex < batches.size(); batchIndex++) {
                        List<PredictionInputDtoV2> batch = batches.get(batchIndex);

                        log.info("🔮 Procesando lote {}/{} ({} clientes)...",
                                        batchIndex + 1, batches.size(), batch.size());

                        try {
                                // Llamar a Python /predict/batch
                                long pythonStartTime = System.currentTimeMillis();
                                PredictionResponseDto[] batchResponses = restTemplate.postForObject(
                                                pythonUrl + "/predict/batch",
                                                batch,
                                                PredictionResponseDto[].class);
                                long pythonDuration = System.currentTimeMillis() - pythonStartTime;

                                log.info("⏱️  Python procesó {} clientes en {}ms ({} clientes/seg)",
                                                batch.size(), pythonDuration,
                                                (batch.size() * 1000) / Math.max(pythonDuration, 1));

                                if (batchResponses == null || batchResponses.length != batch.size()) {
                                        log.error("❌ Python devolvió respuesta inválida para lote {}", batchIndex + 1);
                                        errorCount += batch.size();
                                        continue;
                                }

                                // ⚡ OPTIMIZACIÓN CLAVE: Acumular predicciones y usar batch insert
                                List<AiPrediction> predictionsToSave = new ArrayList<>();
                                LocalDateTime timestamp = LocalDateTime.now();

                                for (int i = 0; i < batchResponses.length; i++) {
                                        Customer customer = allCustomers.get(batchIndex * batchSize + i);
                                        PredictionResponseDto response = batchResponses[i];

                                        // Crear predicción (sin guardar aún)
                                        AiPrediction aiPrediction = AiPrediction.builder()
                                                        .customer(customer)
                                                        .probabilidadFuga(response.getProbability())
                                                        .motivoPrincipal(response.getMainFactor())
                                                        .fechaAnalisis(timestamp)
                                                        .build();

                                        predictionsToSave.add(aiPrediction);
                                }

                                // 🚀 BATCH INSERT: Guardar TODAS las predicciones de una vez (MUY RÁPIDO)
                                log.info("💾 Guardando {} predicciones en BD (batch insert)...",
                                                predictionsToSave.size());
                                long dbStartTime = System.currentTimeMillis();
                                List<AiPrediction> savedPredictions = predictionRepository.saveAll(predictionsToSave);
                                long dbDuration = System.currentTimeMillis() - dbStartTime;

                                log.info("⏱️  BD guardó {} predicciones en {}ms ({} predicciones/seg)",
                                                savedPredictions.size(), dbDuration,
                                                (savedPredictions.size() * 1000) / Math.max(dbDuration, 1));

                                // Agregar resultados exitosos
                                for (AiPrediction savedPrediction : savedPredictions) {
                                        allResults.add(BatchPredictionResponseDTO.PredictionResult.builder()
                                                        .customerId(savedPrediction.getCustomer().getId())
                                                        .risk(savedPrediction.getNivelRiesgo())
                                                        .probability(savedPrediction.getProbabilidadFuga())
                                                        .mainFactor(savedPrediction.getMotivoPrincipal())
                                                        .nextBestAction("Ver detalles")
                                                        .error(null)
                                                        .build());

                                        successCount++;
                                }

                                long batchTotalTime = pythonDuration + dbDuration;
                                log.info("✅ Lote {}/{} completado: {} éxitos en {}ms totales",
                                                batchIndex + 1, batches.size(), batch.size(), batchTotalTime);

                        } catch (Exception e) {
                                log.error("❌ Error procesando lote {}/{}: {}",
                                                batchIndex + 1, batches.size(), e.getMessage());
                                errorCount += batch.size();

                                // Agregar errores para todos los clientes del lote
                                for (int i = 0; i < batch.size(); i++) {
                                        Customer customer = allCustomers.get(batchIndex * batchSize + i);
                                        allResults.add(BatchPredictionResponseDTO.PredictionResult.builder()
                                                        .customerId(customer.getId())
                                                        .risk(null)
                                                        .probability(null)
                                                        .mainFactor(null)
                                                        .nextBestAction(null)
                                                        .error("Batch processing failed: " + e.getMessage())
                                                        .build());
                                }
                        }
                }

                // 5. Construir respuesta final
                long totalDuration = System.currentTimeMillis() - startTime;
                BatchPredictionResponseDTO response = BatchPredictionResponseDTO.builder()
                                .totalProcessed(totalCustomers)
                                .successCount(successCount)
                                .errorCount(errorCount)
                                .results(allResults)
                                .build();

                log.info("✅ [BATCH-ALL] Predicción masiva completada en {}ms ({} segundos): {} éxitos, {} errores de {} totales",
                                totalDuration, totalDuration / 1000, successCount, errorCount, totalCustomers);
                log.info("📊 Rendimiento: {} clientes/segundo",
                                (totalCustomers * 1000) / Math.max(totalDuration, 1));

                return response;
        }

        /**
         * Método público para exponer mapToFlatJsonV2 (útil para batch desde controller)
         */
        public PredictionInputDtoV2 mapCustomerToDto(Customer customer) {
                return mapToFlatJsonV2(customer);
        }
}