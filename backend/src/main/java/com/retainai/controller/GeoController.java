package com.retainai.controller;

import com.retainai.dto.GeoCustomerDto;
import com.retainai.service.GeoLocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/geo")
@CrossOrigin(origins = "http://localhost:3000") // Crítico para que el Frontend no falle
public class GeoController {

    private final GeoLocationService geoService;

    public GeoController(GeoLocationService geoService) {
        this.geoService = geoService;
    }

    /**
     * 🛠️ ADMIN ENDPOINT
     * Ejecuta la lógica para inventar coordenadas en TODAS las ciudades soportadas.
     * Llama a: curl -X POST http://localhost:8080/api/geo/populate
     */
    @PostMapping("/populate")
    public ResponseEntity<?> populateGeoData() {
        // Llama al nuevo método que soporta NY, Londres, Sydney, etc.
        int count = geoService.populateAllCoordinates();

        return ResponseEntity.ok(Map.of(
                "message", "Coordenadas generadas exitosamente para todas las ciudades",
                "updated_customers", count,
                "status", "SUCCESS"
        ));
    }

    /**
     * 🗺️ MAPBOX ENDPOINT
     * Este es el que consumirá tu mapa en Next.js.
     * Devuelve la lista limpia de puntos.
     */
    @GetMapping("/customers")
    public ResponseEntity<List<GeoCustomerDto>> getGeoCustomers() {
        return ResponseEntity.ok(geoService.getCustomersForMap());
    }
}