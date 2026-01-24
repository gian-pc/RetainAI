package com.retainai.controller;

import com.retainai.dto.CustomerDetailDto;
import com.retainai.dto.CustomerSummaryDto;
import com.retainai.service.CsvExportService;
import com.retainai.service.CsvImportService;
import com.retainai.service.CustomerService;
import com.retainai.service.DatabaseCleanupService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CsvImportService csvImportService;
    private final CsvExportService csvExportService;
    private final CustomerService customerService;
    private final DatabaseCleanupService databaseCleanupService;

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

    // 🔴 Endpoint para clientes en riesgo (abandonoHistorico = true)
    @GetMapping("/at-risk")
    public ResponseEntity<Page<CustomerSummaryDto>> getCustomersAtRisk(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(customerService.listarClientesEnRiesgo(PageRequest.of(page, size)));
    }

    // TAREA: Detalle Profundo
    @GetMapping("/{id}")
    public ResponseEntity<CustomerDetailDto> getDetalle(@PathVariable String id) {
        return ResponseEntity.ok(customerService.obtenerDetalleCliente(id));
    }

    // 📊 Historial de predicciones de un cliente
    @GetMapping("/{id}/predictions/history")
    public ResponseEntity<?> getPredictionHistory(@PathVariable String id) {
        return ResponseEntity.ok(customerService.obtenerHistorialPredicciones(id));
    }

    // 📤 Exportar TODOS los clientes a CSV
    @GetMapping(value = "/export", produces = "text/csv")
    public ResponseEntity<byte[]> exportCustomersToCSV() {
        try {
            String csvContent = csvExportService.exportAllCustomersToCSV();

            // Generar nombre de archivo con timestamp
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = "customers_backup_" + timestamp + ".csv";

            // Headers para forzar descarga
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);
            headers.add(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8");

            byte[] csvBytes = csvContent.getBytes(StandardCharsets.UTF_8);

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .body(csvBytes);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // 🗑️ ELIMINAR TODA LA BASE DE DATOS (Reset completo)
    @DeleteMapping("/all")
    public ResponseEntity<String> deleteAllCustomers() {
        try {
            databaseCleanupService.deleteAllData();
            return ResponseEntity.ok("Base de datos limpiada exitosamente. Todas las tablas están vacías.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error al limpiar la base de datos: " + e.getMessage());
        }
    }
}