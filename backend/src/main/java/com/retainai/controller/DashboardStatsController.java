package com.retainai.controller;

import com.retainai.dto.DashboardStatsDto;
import com.retainai.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor // <--- Esto crea el constructor automáticamente
public class DashboardStatsController {

    // 1. Quitamos el Repository que no se usaba (basura)
    // 2. Quitamos @Autowired (ya no hace falta)
    // 3. Agregamos 'final' para que Lombok haga la inyección
    private final DashboardService stats;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getDashBoardStats(){
        return ResponseEntity.ok(stats.getDashboardStats());
    }
}