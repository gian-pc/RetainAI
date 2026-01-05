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
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

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
                        c.getMetrics() != null && Boolean.TRUE.equals(c.getMetrics().getAbandonoHistorico())
                ));
    }

    public CustomerDetailDto obtenerDetalleCliente(String id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado: " + id));

        CustomerDetailDto dto = new CustomerDetailDto();
        dto.setId(customer.getId());
        dto.setGenero(customer.getGenero());
        dto.setEdad(customer.getEdad());
        dto.setPais(customer.getPais());
        dto.setCiudad(customer.getCiudad());
        dto.setSegmento(customer.getSegmento());
        dto.setLatitud(customer.getLatitud());
        dto.setLongitud(customer.getLongitud());
        dto.setSubscription(customer.getSubscription());
        dto.setMetrics(customer.getMetrics());
        return dto;
    }
    // BE-402: Busqueda de clientes por apellido
    public List<CustomerSummaryDto> buscarPorApellido(String query) {

        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }

        List<Customer> clientes = customerRepository.findByApellidoContainingIgnoreCase(query.trim());

        return clientes.stream()
                .map(c -> new CustomerSummaryDto(
                        c.getId(),
                        c.getPais(),
                        c.getCiudad(),
                        c.getSegmento(),
                        c.getMetrics() != null && Boolean.TRUE.equals(c.getMetrics().getAbandonoHistorico())
                ))
                .collect(Collectors.toList());
    }
}