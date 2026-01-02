package com.retainai.controller;

import com.retainai.dto.DashboardStatsDto;
import com.retainai.repository.CustomerRepository;
import com.retainai.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardStatsController {

    @Autowired
    private CustomerRepository repository;

    @Autowired
    private DashboardService stats;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getDashBoardStats(){
        DashboardStatsDto response = stats.getDashboardStats();
        return ResponseEntity.ok(response);

    }
}
