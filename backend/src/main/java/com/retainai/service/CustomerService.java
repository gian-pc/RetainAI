package com.retainai.service;

import com.retainai.dto.CustomerDetailDto;
import com.retainai.dto.CustomerSummaryDto;
import com.retainai.dto.PredictionHistoryDto;
import com.retainai.model.AiPrediction;
import com.retainai.model.Customer;
import com.retainai.repository.CustomerRepository;
import com.retainai.repository.PredictionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

        private final CustomerRepository customerRepository;
        private final PredictionRepository predictionRepository;

        public Page<CustomerSummaryDto> listarClientesPaginados(Pageable pageable) {
                return customerRepository.findAll(pageable)
                                .map(c -> new CustomerSummaryDto(
                                                c.getId(),
                                                c.getPais(),
                                                c.getCiudad(),
                                                c.getSegmento(),
                                                // CORRECCION AQUI: Usamos .get... y protegemos contra nulos
                                                c.getMetrics() != null && Boolean.TRUE
                                                                .equals(c.getMetrics().getAbandonoHistorico())));
        }

        // 🔴 Listar solo clientes en riesgo (abandonoHistorico = true)
        public Page<CustomerSummaryDto> listarClientesEnRiesgo(Pageable pageable) {
                return customerRepository.findCustomersAtRisk(pageable)
                                .map(c -> new CustomerSummaryDto(
                                                c.getId(),
                                                c.getPais(),
                                                c.getCiudad(),
                                                c.getSegmento(),
                                                true // Siempre true porque vienen del filtro at-risk
                                ));
        }

        public CustomerDetailDto obtenerDetalleCliente(String id) {
                Customer customer = customerRepository.findById(id)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Cliente no encontrado: " + id));

                CustomerDetailDto dto = new CustomerDetailDto();
                dto.setId(customer.getId());
                dto.setGenero(customer.getGenero());
                dto.setEdad(customer.getEdad());
                dto.setPais(customer.getPais());
                dto.setCiudad(customer.getCiudad());
                dto.setSegmento(customer.getSegmento());
                dto.setLatitud(customer.getLatitud());
                dto.setLongitud(customer.getLongitud());

                // Nuevos campos geográficos
                dto.setBorough(customer.getBorough());
                dto.setCodigoPostal(customer.getCodigoPostal());
                dto.setEstado(customer.getEstado());
                dto.setFechaRegistro(customer.getFechaRegistro());

                dto.setSubscription(customer.getSubscription());
                dto.setMetrics(customer.getMetrics());
                return dto;
        }

        /**
         * Obtiene el historial de predicciones de un cliente específico
         * Ordenado por fecha más reciente primero
         */
        public List<PredictionHistoryDto> obtenerHistorialPredicciones(String customerId) {
                // Verificar que el cliente existe
                customerRepository.findById(customerId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Cliente no encontrado: " + customerId));

                // Obtener todas las predicciones del cliente
                List<AiPrediction> predictions = predictionRepository.findByCustomerId(customerId);

                // Mapear a DTO
                return predictions.stream()
                        .map(pred -> {
                                String nivelRiesgo;
                                if (pred.getProbabilidadFuga() >= 0.70) {
                                        nivelRiesgo = "High";
                                } else if (pred.getProbabilidadFuga() >= 0.30) {
                                        nivelRiesgo = "Medium";
                                } else {
                                        nivelRiesgo = "Low";
                                }

                                return PredictionHistoryDto.builder()
                                        .id(pred.getId())
                                        .probabilidadFuga(pred.getProbabilidadFuga())
                                        .motivoPrincipal(pred.getMotivoPrincipal())
                                        .fechaAnalisis(pred.getFechaAnalisis())
                                        .nivelRiesgo(nivelRiesgo)
                                        .build();
                        })
                        .sorted((a, b) -> b.getFechaAnalisis().compareTo(a.getFechaAnalisis())) // Más reciente primero
                        .collect(Collectors.toList());
        }
}