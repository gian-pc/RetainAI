package com.retainai.repository;

import com.retainai.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List; // <--- NO OLVIDES IMPORTAR ESTO

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

    // 👇 AGREGA ESTA LÍNEA AQUÍ
    List<Customer> findByCiudad(String ciudad);
    List<Customer> findByApellidoContainingIgnoreCase(String apellido);
}