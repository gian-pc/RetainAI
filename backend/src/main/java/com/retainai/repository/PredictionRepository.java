package com.retainai.repository;
import com.retainai.model.AiPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PredictionRepository extends JpaRepository<AiPrediction, Long> {
    List<AiPrediction> findByCustomerId(String customerId);
}