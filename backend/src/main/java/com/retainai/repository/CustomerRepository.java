package com.retainai.repository;

import com.retainai.model.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {

    @Query("SELECT COUNT(c) FROM Customer c")
    long countAll();

    @Query("SELECT COUNT(c) FROM Customer c WHERE c.metrics.abandonoHistorico = true")
    long countAbandonedCustomers();

    @Query("""
        SELECT COALESCE(SUM(s.cuotaMensual), 0)
        FROM Subscription s
        WHERE s.customer.id IN (
            SELECT cm.customer.id
            FROM CustomerMetrics cm
            WHERE cm.abandonoHistorico = true
        )
        """)
    BigDecimal churnRevenue();

    // Listado de clientes por ciudad
    List<Customer> findByCiudad(String ciudad);

    // 🔴 Clientes en riesgo (abandonoHistorico = true) con paginación
    @Query("SELECT c FROM Customer c WHERE c.metrics.abandonoHistorico = true")
    Page<Customer> findCustomersAtRisk(Pageable pageable);

    // 🗺️ Query optimizada para mapa - Proyección DTO directa (sin relaciones)
    @Query("SELECT new com.retainai.dto.GeoCustomerDto(c.id, c.latitud, c.longitud, 'Low', 0.0) " +
           "FROM Customer c WHERE c.latitud IS NOT NULL AND c.longitud IS NOT NULL")
    List<com.retainai.dto.GeoCustomerDto> findGeoCustomersLight(Pageable pageable);
}