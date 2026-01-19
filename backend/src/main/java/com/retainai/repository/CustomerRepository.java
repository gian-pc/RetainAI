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

    // Query para alertas críticas
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.metrics.ticketsSoporte >= :minTickets")
    long countByTicketsSoporteGreaterThanEqual(int minTickets);

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

    // 🗺️ Query optimizada para heatmap - Todos los clientes (con caché habilitado)
    @Query("SELECT c FROM Customer c LEFT JOIN FETCH c.subscription " +
            "WHERE c.latitud IS NOT NULL AND c.longitud IS NOT NULL")
    List<Customer> findCustomersWithCoordinates();

    // 🎯 Query para obtener clientes ACTIVOS candidatos (muestra aleatoria)
    // Filtra SOLO clientes activos (abandonoHistorico = false o null)
    // El modelo de IA determina el riesgo real de cada cliente
    @Query("SELECT c FROM Customer c " +
            "LEFT JOIN FETCH c.subscription s " +
            "LEFT JOIN FETCH c.metrics m " +
            "WHERE (m.abandonoHistorico = false OR m.abandonoHistorico IS NULL) " +
            "ORDER BY function('RAND')") // Muestra aleatoria para diversidad
    List<Customer> findHighRiskCustomers(org.springframework.data.domain.Pageable pageable);

    // 📊 Análisis de Contratos (Mensual vs Anual vs Bienal)
    @Query(value = """
            SELECT
                s.tipo_contrato as contractType,
                COUNT(DISTINCT s.customer_id) as customers,
                (SUM(CASE WHEN cm.abandono_historico = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as churnRate,
                AVG(s.cuota_mensual) as avgRevenue
            FROM subscriptions s
            JOIN customer_metrics cm ON s.customer_id = cm.customer_id
            GROUP BY s.tipo_contrato
            ORDER BY s.tipo_contrato
            """, nativeQuery = true)
    List<Object[]> getContractAnalysis();

    // 🎫 Análisis de Soporte por Tickets
    @Query(value = """
            SELECT
                CASE
                    WHEN cm.tickets_soporte = 0 THEN '0'
                    WHEN cm.tickets_soporte BETWEEN 1 AND 2 THEN '1-2'
                    WHEN cm.tickets_soporte BETWEEN 3 AND 5 THEN '3-5'
                    ELSE '6+'
                END as ticketRange,
                COUNT(DISTINCT cm.customer_id) as customers,
                (SUM(CASE WHEN cm.abandono_historico = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as churnRate
            FROM customer_metrics cm
            GROUP BY ticketRange
            ORDER BY
                CASE ticketRange
                    WHEN '0' THEN 1
                    WHEN '1-2' THEN 2
                    WHEN '3-5' THEN 3
                    WHEN '6+' THEN 4
                END
            """, nativeQuery = true)
    List<Object[]> getSupportAnalysis();

    // 🎯 Segmentación de Clientes por Revenue y Riesgo
    @Query(value = """
            SELECT
                CASE
                    WHEN s.ingresos_totales < 2000 THEN 'BASIC'
                    WHEN s.ingresos_totales BETWEEN 2000 AND 4000 THEN 'MEDIUM'
                    ELSE 'PREMIUM'
                END as segment,
                COUNT(DISTINCT s.customer_id) as customers,
                AVG(s.ingresos_totales) as avgRevenue,
                (SUM(CASE WHEN cm.abandono_historico = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as churnRate
            FROM subscriptions s
            JOIN customer_metrics cm ON s.customer_id = cm.customer_id
            GROUP BY segment
            ORDER BY avgRevenue
            """, nativeQuery = true)
    List<Object[]> getCustomerSegmentation();
}