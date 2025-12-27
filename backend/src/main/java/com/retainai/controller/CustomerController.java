package com.retainai.controller;

import com.retainai.model.Customer;
import com.retainai.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*") // 🌍 PERMITE QUE CUALQUIER FRONTEND SE CONECTE (Vital para Hackathon)
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @GetMapping
    public List<Customer> getAllCustomers() {
        // Esto hace el "SELECT * FROM customers" automáticamente
        return customerRepository.findAll();
    }
}