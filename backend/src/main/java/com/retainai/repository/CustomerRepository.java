package com.retainai.repository;

import com.retainai.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// ¡OJO AQUÍ! Dice "interface", no "class"
@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    // Aquí Spring Boot inyectará mágicamente métodos como .save(), .findAll(), etc.
}
