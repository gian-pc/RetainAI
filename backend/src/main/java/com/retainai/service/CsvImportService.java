package com.retainai.service;

import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.CsvToBeanBuilder;
import com.retainai.dto.CustomerCsvRepresentation;
import com.retainai.model.Customer;
import com.retainai.model.CustomerMetrics;
import com.retainai.model.Subscription;
import com.retainai.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CsvImportService {

    private final CustomerRepository customerRepository;

    public Integer uploadCustomers(MultipartFile file) throws IOException {

        // 1. Validar que no esté vacío
        if(file.isEmpty()) throw new IllegalArgumentException("El archivo está vacío");

        // 2. Parsear el CSV a Objetos Java (DTO)
        try (Reader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {

            // Estrategia de lectura
            CsvToBean<CustomerCsvRepresentation> csvToBean = new CsvToBeanBuilder<CustomerCsvRepresentation>(reader)
                    .withType(CustomerCsvRepresentation.class)
                    .withIgnoreLeadingWhiteSpace(true)
                    .build();

            // Convertir a lista de DTOs
            Set<Customer> customers = csvToBean.parse().stream()
                    .map(this::mapToEntity)
                    .collect(Collectors.toSet());

            // 3. Guardar en Base de Datos (Guardamos al PADRE y él guarda a los hijos por Cascade)
            customerRepository.saveAll(customers);

            return customers.size();
        }
    }

    private Customer mapToEntity(CustomerCsvRepresentation csv) {
        // A. Crear el Cliente (Padre)
        Customer customer = new Customer();
        customer.setId(csv.getCustomerId());
        customer.setGenero(csv.getGender());
        customer.setEdad(csv.getAge());
        customer.setPais(csv.getCountry());
        customer.setCiudad(csv.getCity());
        customer.setSegmento(csv.getSegment());
        // Lat/Long no vienen en el CSV, los dejamos null

        // B. Crear Suscripción (Hijo 1)
        Subscription subscription = new Subscription();
        subscription.setMesesPermanencia(csv.getTenure());
        subscription.setCanalRegistro(csv.getRegistrationChannel());
        subscription.setTipoContrato(csv.getContractType());
        subscription.setCuotaMensual(csv.getMonthlyCharges());
        subscription.setIngresosTotales(csv.getTotalCharges());
        subscription.setMetodoPago(csv.getPaymentMethod());
        subscription.setErroresPago(csv.getPaymentErrors());
        subscription.setDescuentoAplicado(csv.getDiscountApplied());
        subscription.setAumentoPrecio3m(csv.getPriceIncrease());

        // Relación Bidireccional
        subscription.setCustomer(customer);
        customer.setSubscription(subscription);

        // C. Crear Métricas (Hijo 2)
        CustomerMetrics metrics = new CustomerMetrics();
        metrics.setConeccionesMensuales(csv.getMonthlyConnections());
        metrics.setDiasActivosSemanales(csv.getActiveDays());
        metrics.setPromedioConeccion(csv.getAvgConnection());
        metrics.setCaracteristicasUsadas(csv.getFeaturesUsed());
        metrics.setTasaCrecimientoUso(csv.getUsageGrowth());
        metrics.setDiasUltimaConeccion(csv.getLastConnectionDays());
        metrics.setTicketsSoporte(csv.getSupportTickets());
        metrics.setTiempoResolucion(csv.getResolutionTime());
        metrics.setTipoQueja(csv.getComplaintType());
        metrics.setScoreCsat(csv.getCsatScore());
        metrics.setEscaladasSoporte(csv.getEscalations());
        metrics.setTasaAperturaEmail(csv.getEmailOpenRate());
        metrics.setTasaClics(csv.getMarketingClickRate());
        metrics.setScoreNps(csv.getNpsScore());
        metrics.setRespuestaEncuesta(csv.getSurveyResponse());
        metrics.setReferenciasHechas(csv.getReferrals());
        // El CSV tiene 'abandonar' (0 o 1). Convertimos a Boolean
        metrics.setAbandonoHistorico(csv.getChurnTarget() == 1);

        // Relación Bidireccional
        metrics.setCustomer(customer);
        customer.setMetrics(metrics);

        return customer;
    }
}