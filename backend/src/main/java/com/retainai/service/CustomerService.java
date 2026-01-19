package com.retainai.service;

import com.retainai.dto.CustomerDetailDto;
import com.retainai.dto.CustomerSummaryDto;
import com.retainai.model.Customer;
import com.retainai.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CustomerService {

        private final CustomerRepository customerRepository;

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
}