package com.retainai.repository;

import com.retainai.model.AiPrediction;
import com.retainai.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    @Query("SELECT COALESCE(SUM(s.cuotaMensual), 0) FROM Subscription s")
    BigDecimal totalRevenue();

    @Query("""
                SELECT COALESCE(SUM(s.cuotaMensual), 0)
                FROM Subscription s
                JOIN s.customer c
                JOIN c.metrics m
                WHERE m.abandonoHistorico = false
            """)
    BigDecimal activeSubscriptionsRevenue();

    // Queries para alertas críticas
    // NOTA: nivel_riesgo ahora está en ai_predictions, no en subscriptions
    @Query("""
            SELECT COUNT(DISTINCT s)
            FROM Subscription s
            JOIN s.customer c
            LEFT JOIN AiPrediction ap ON ap.customer.id = c.id
            WHERE s.tipoContrato = :contractType
            AND ap.nivelRiesgo IN :riskLevels
            """)
    long countByTipoContratoAndNivelRiesgoIn(@Param("contractType") String contractType,
            @Param("riskLevels") List<String> riskLevels);

    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.mesesPermanencia BETWEEN :minMonths AND :maxMonths")
    long countByMesesPermanenciaBetween(@Param("minMonths") int minMonths, @Param("maxMonths") int maxMonths);
}
