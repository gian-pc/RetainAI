package com.retainai.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String clientName;

    @Column(nullable = false)
    private Integer tenure;

    @Column(nullable = false)
    private Double monthlyCharges;

    @Column(nullable = false)
    private Double totalCharges;

    @Column(nullable = false)
    private String contract;

    @Column(nullable = false)
    private String paymentMethod;

    @Column(nullable = false)
    private String partner;

    @Column(nullable = false)
    private String internetService;

    // AI Prediction Results
    private String prediction;
    private Double probability;
    private String riskLevel;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}