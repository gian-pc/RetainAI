package com.retainai.repository;
import com.retainai.model.CustomerMetrics;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MetricsRepository extends JpaRepository<CustomerMetrics, Long> {
}