package com.retainai.repository;
import com.retainai.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;

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
}