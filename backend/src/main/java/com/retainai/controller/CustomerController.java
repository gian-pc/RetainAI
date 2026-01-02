package com.retainai.controller;

import com.retainai.dto.CustomerDetailDto;
import com.retainai.dto.CustomerSummaryDto;
import com.retainai.service.CsvImportService;
import com.retainai.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
    private final CustomerService customerService;

    // Endpoint existente para carga masiva
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadCustomers(@RequestParam("file") MultipartFile file) {
        try {
            Integer count = csvImportService.uploadCustomers(file);
            return ResponseEntity.ok("¡Éxito! Se cargaron " + count + " clientes correctamente.");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error crítico al procesar el archivo: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error en la solicitud: " + e.getMessage());
        }
    }

    // TAREA: Listado Inteligente (Paginación)
    @GetMapping
    public ResponseEntity<Page<CustomerSummaryDto>> getListado(
            @RequestParam(defaultValue = "0") int page, 
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(customerService.listarClientesPaginados(PageRequest.of(page, size)));
    }

    // TAREA: Detalle Profundo
    @GetMapping("/{id}")
    public ResponseEntity<CustomerDetailDto> getDetalle(@PathVariable String id) {
        return ResponseEntity.ok(customerService.obtenerDetalleCliente(id));
    }
}