package com.retainai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DatabaseCleanupService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Limpia TODA la base de datos respetando foreign keys
     * Orden: ai_predictions → customer_context → customer_metrics → subscriptions → customers
     */
    @Transactional
    public void deleteAllData() {
        log.warn("🗑️ INICIANDO LIMPIEZA COMPLETA DE LA BASE DE DATOS...");

        try {
            // Deshabilitar verificación de foreign keys temporalmente
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");

            // Borrar en orden inverso a las dependencias (de hijos a padres)
            long predictions = deleteTable("ai_predictions");
            long context = deleteTable("customer_context");
            long metrics = deleteTable("customer_metrics");
            long subscriptions = deleteTable("subscriptions");
            long customers = deleteTable("customers");

            // Reactivar verificación de foreign keys
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");

            log.warn("✅ BASE DE DATOS LIMPIADA EXITOSAMENTE");
            log.info("📊 Registros eliminados:");
            log.info("   - Customers: {}", customers);
            log.info("   - Subscriptions: {}", subscriptions);
            log.info("   - Customer Metrics: {}", metrics);
            log.info("   - Customer Context: {}", context);
            log.info("   - AI Predictions: {}", predictions);

        } catch (Exception e) {
            log.error("❌ Error al limpiar la base de datos", e);
            // Asegurar que se reactiven los checks incluso si falla
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
            throw new RuntimeException("Error al limpiar la base de datos: " + e.getMessage(), e);
        }
    }

    private long deleteTable(String tableName) {
        // Contar registros antes de borrar
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tableName, Long.class);

        // Borrar todos los registros
        jdbcTemplate.execute("DELETE FROM " + tableName);

        // Resetear AUTO_INCREMENT si aplica
        try {
            jdbcTemplate.execute("ALTER TABLE " + tableName + " AUTO_INCREMENT = 1");
        } catch (Exception e) {
            // Ignorar si la tabla no tiene AUTO_INCREMENT
        }

        log.info("🗑️ Tabla '{}' limpiada ({} registros eliminados)", tableName, count);
        return count != null ? count : 0;
    }

    /**
     * Verifica que todas las tablas estén vacías
     */
    public boolean isDatabaseEmpty() {
        Long totalRecords = jdbcTemplate.queryForObject("""
            SELECT
                (SELECT COUNT(*) FROM customers) +
                (SELECT COUNT(*) FROM subscriptions) +
                (SELECT COUNT(*) FROM customer_metrics) +
                (SELECT COUNT(*) FROM customer_context) +
                (SELECT COUNT(*) FROM ai_predictions)
            """, Long.class);

        return totalRecords != null && totalRecords == 0;
    }
}
