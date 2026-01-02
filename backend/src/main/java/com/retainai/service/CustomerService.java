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
                c.getMetrics() != null && c.getMetrics().isAbandonoHistorico()
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
}