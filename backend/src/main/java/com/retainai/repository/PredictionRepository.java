package com.retainai.repository;

import com.retainai.model.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// También es una "interface"
@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {
}