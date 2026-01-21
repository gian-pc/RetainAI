package com.retainai.repository;
import com.retainai.model.AiPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PredictionRepository extends JpaRepository<AiPrediction, Long> {
    List<AiPrediction> findByCustomerId(String customerId);

    // 🚀 Batch query optimizada para mapa - evita N+1 queries
    @Query("SELECT p FROM AiPrediction p WHERE p.customer.id IN :customerIds")
    List<AiPrediction> findLatestByCustomerIds(@Param("customerIds") List<String> customerIds);

    // 🔥 Top clientes de alto riesgo para chatbot
    @Query("SELECT p FROM AiPrediction p ORDER BY p.probabilidadFuga DESC")
    List<AiPrediction> findTop3HighRiskCustomers();
}