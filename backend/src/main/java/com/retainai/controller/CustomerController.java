package com.retainai.controller;

import com.retainai.service.CsvImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CsvImportService csvImportService;

    // Endpoint: POST http://localhost:8080/api/customers/upload
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadCustomers(@RequestParam("file") MultipartFile file) {
        try {
            Integer count = csvImportService.uploadCustomers(file);
            return ResponseEntity.ok("¡Éxito! Se cargaron " + count + " clientes correctamente en la Base de Datos.");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error crítico al procesar el archivo: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error en la solicitud: " + e.getMessage());
        }
    }
}