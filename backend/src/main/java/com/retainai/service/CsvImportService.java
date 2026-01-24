package com.retainai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CsvImportService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Sube clientes desde CSV con nombres EXACTOS de BD (generado por /export)
     * Soporta las 67 columnas completas incluyendo customer_context
     */
    @Transactional
    public Integer uploadCustomers(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío");
        }

        log.info("📂 Procesando archivo CSV: {}", file.getOriginalFilename());

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            // Leer encabezados
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new IllegalArgumentException("El CSV no tiene encabezados");
            }

            String[] headers = parseCSVLine(headerLine);
            log.info("📋 Headers detectados: {} columnas", headers.length);

            // Leer datos línea por línea
            String line;
            int count = 0;
            int batchSize = 1000; // Insertar en lotes de 1000
            List<Map<String, String>> batch = new ArrayList<>();

            while ((line = reader.readLine()) != null) {
                String[] values = parseCSVLine(line);

                // Mapear headers a values
                Map<String, String> row = new HashMap<>();
                for (int i = 0; i < headers.length && i < values.length; i++) {
                    row.put(headers[i], values[i]);
                }

                batch.add(row);
                count++;

                // Insertar batch cuando alcance el tamaño
                if (batch.size() >= batchSize) {
                    insertBatch(batch);
                    batch.clear();
                    log.info("✅ Insertados {} clientes...", count);
                }
            }

            // Insertar registros restantes
            if (!batch.isEmpty()) {
                insertBatch(batch);
            }

            log.info("🎉 Total de clientes importados: {}", count);
            return count;
        }
    }

    /**
     * Inserta un batch de clientes en las 4 tablas: customers, subscriptions, customer_metrics, customer_context
     */
    private void insertBatch(List<Map<String, String>> batch) {
        for (Map<String, String> row : batch) {
            try {
                // 1. Insertar CUSTOMER (tabla padre)
                String customerId = row.get("cliente_id");
                jdbcTemplate.update("""
                    INSERT INTO customers (id, nombre, genero, edad, pais, ciudad, segmento, latitud, longitud,
                                           es_mayor, tiene_pareja, tiene_dependientes, ingreso_mediano,
                                           densidad_poblacional, borough, codigo_postal, estado, fecha_registro)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        nombre = VALUES(nombre),
                        genero = VALUES(genero)
                    """,
                        customerId,
                        row.get("nombre"),
                        row.get("genero"),
                        parseInteger(row.get("edad")),
                        row.get("pais"),
                        row.get("ciudad"),
                        row.get("segmento"),
                        parseDouble(row.get("latitud")),
                        parseDouble(row.get("longitud")),
                        parseBoolean(row.get("es_mayor")),
                        parseBoolean(row.get("tiene_pareja")),
                        parseBoolean(row.get("tiene_dependientes")),
                        parseDouble(row.get("ingreso_mediano")),
                        parseDouble(row.get("densidad_poblacional")),
                        row.get("borough"),
                        row.get("codigo_postal"),
                        row.get("estado"),
                        parseDate(row.get("fecha_registro"))
                );

                // 2. Insertar SUBSCRIPTION
                jdbcTemplate.update("""
                    INSERT INTO subscriptions (customer_id, meses_permanencia, canal_registro, tipo_contrato,
                                                cuota_mensual, ingresos_totales, metodo_pago, errores_pago,
                                                descuento_aplicado, aumento_precio_3m, servicio_telefono,
                                                lineas_multiples, tipo_internet, seguridad_online, respaldo_online,
                                                proteccion_dispositivo, soporte_tecnico, streaming_tv,
                                                streaming_peliculas, facturacion_sin_papel)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        meses_permanencia = VALUES(meses_permanencia)
                    """,
                        customerId,
                        parseInteger(row.get("meses_permanencia")),
                        row.get("canal_registro"),
                        row.get("tipo_contrato"),
                        parseDouble(row.get("cuota_mensual")),
                        parseDouble(row.get("ingresos_totales")),
                        row.get("metodo_pago"),
                        parseInteger(row.get("errores_pago")),
                        parseBoolean(row.get("descuento_aplicado")),
                        parseBoolean(row.get("aumento_precio_3m")),
                        parseBoolean(row.get("servicio_telefono")),
                        parseBoolean(row.get("lineas_multiples")),
                        row.get("tipo_internet"),
                        parseBoolean(row.get("seguridad_online")),
                        parseBoolean(row.get("respaldo_online")),
                        parseBoolean(row.get("proteccion_dispositivo")),
                        parseBoolean(row.get("soporte_tecnico")),
                        parseBoolean(row.get("streaming_tv")),
                        parseBoolean(row.get("streaming_peliculas")),
                        parseBoolean(row.get("facturacion_sin_papel"))
                );

                // 3. Insertar CUSTOMER_METRICS
                jdbcTemplate.update("""
                    INSERT INTO customer_metrics (customer_id, conecciones_mensuales, dias_activos_semanales,
                                                   promedio_coneccion, caracteristicas_usadas, tasa_crecimiento_uso,
                                                   dias_ultima_coneccion, tickets_soporte, tiempo_resolucion,
                                                   tipo_queja, score_csat, escaladas_soporte, tasa_apertura_email,
                                                   tasa_clics, score_nps, respuesta_encuesta, referencias_hechas,
                                                   abandono_historico, tiempo_sesion_promedio, ultimo_contacto_soporte)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        conecciones_mensuales = VALUES(conecciones_mensuales)
                    """,
                        customerId,
                        parseInteger(row.get("conecciones_mensuales")),
                        parseInteger(row.get("dias_activos_semanales")),
                        parseDouble(row.get("promedio_coneccion")),
                        parseInteger(row.get("caracteristicas_usadas")),
                        parseDouble(row.get("tasa_crecimiento_uso")),
                        parseInteger(row.get("dias_ultima_coneccion")),
                        parseInteger(row.get("tickets_soporte")),
                        parseDouble(row.get("tiempo_resolucion")),
                        row.get("tipo_queja"),
                        parseDouble(row.get("score_csat")),
                        parseInteger(row.get("escaladas_soporte")),
                        parseDouble(row.get("tasa_apertura_email")),
                        parseDouble(row.get("tasa_clics")),
                        parseInteger(row.get("score_nps")),
                        parseBoolean(row.get("respuesta_encuesta")),
                        parseInteger(row.get("referencias_hechas")),
                        parseBoolean(row.get("abandono_historico")),
                        parseDouble(row.get("tiempo_sesion_promedio")),
                        parseInteger(row.get("ultimo_contacto_soporte"))
                );

                // 4. Insertar CUSTOMER_CONTEXT (nueva tabla)
                jdbcTemplate.update("""
                    INSERT INTO customer_context (customer_id, cambio_plan_reciente, fecha_cambio_plan,
                                                   downgrade_reciente, fecha_ultimo_pago, intentos_cobro_fallidos,
                                                   dias_mora, ofertas_recibidas, visitas_app_mensual,
                                                   features_nuevas_usadas, competidores_area, precio_vs_mercado)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        cambio_plan_reciente = VALUES(cambio_plan_reciente)
                    """,
                        customerId,
                        parseBoolean(row.get("cambio_plan_reciente")),
                        parseDate(row.get("fecha_cambio_plan")),
                        parseBoolean(row.get("downgrade_reciente")),
                        parseDate(row.get("fecha_ultimo_pago")),
                        parseInteger(row.get("intentos_cobro_fallidos")),
                        parseInteger(row.get("dias_mora")),
                        parseInteger(row.get("ofertas_recibidas")),
                        parseInteger(row.get("visitas_app_mensual")),
                        parseInteger(row.get("features_nuevas_usadas")),
                        parseInteger(row.get("competidores_area")),
                        row.get("precio_vs_mercado")
                );

            } catch (Exception e) {
                log.error("❌ Error al insertar cliente: {}", row.get("cliente_id"), e);
                // Continuar con el siguiente registro
            }
        }
    }

    /**
     * Parsea una línea CSV respetando valores entre comillas
     */
    private String[] parseCSVLine(String line) {
        List<String> result = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);

            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.add(current.toString().trim());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }

        result.add(current.toString().trim());
        return result.toArray(new String[0]);
    }

    // Helpers para parsear valores null-safe
    private Integer parseInteger(String value) {
        if (value == null || value.isEmpty() || value.equalsIgnoreCase("null")) return null;
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Double parseDouble(String value) {
        if (value == null || value.isEmpty() || value.equalsIgnoreCase("null")) return null;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Boolean parseBoolean(String value) {
        if (value == null || value.isEmpty() || value.equalsIgnoreCase("null")) return null;
        return value.equals("1") || value.equalsIgnoreCase("true");
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isEmpty() || value.equalsIgnoreCase("null")) return null;
        try {
            return LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (Exception e) {
            return null;
        }
    }
}