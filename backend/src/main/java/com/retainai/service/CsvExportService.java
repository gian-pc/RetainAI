package com.retainai.service;

import com.retainai.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.StringWriter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CsvExportService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Exporta TODOS los clientes de la BD a formato CSV
     * Usa query nativo con nombres de columna EXACTOS de la base de datos
     */
    public String exportAllCustomersToCSV() {
        log.info("🔄 Exportando todos los clientes a CSV con nombres originales de BD...");

        // Query nativo con nombres exactos de la BD - DATOS BASE DEL CLIENTE
        // NO incluye ai_predictions porque se llena DESPUÉS al ejecutar "Predecir Todos"
        String query = """
            SELECT
                c.id as cliente_id,
                c.nombre,
                c.genero,
                c.edad,
                c.pais,
                c.ciudad,
                c.segmento,
                c.latitud,
                c.longitud,
                c.es_mayor,
                c.tiene_pareja,
                c.tiene_dependientes,
                c.ingreso_mediano,
                c.densidad_poblacional,
                c.borough,
                c.codigo_postal,
                c.estado,
                c.fecha_registro,
                s.meses_permanencia,
                s.canal_registro,
                s.tipo_contrato,
                s.cuota_mensual,
                s.ingresos_totales,
                s.metodo_pago,
                s.errores_pago,
                s.descuento_aplicado,
                s.aumento_precio_3m,
                s.servicio_telefono,
                s.lineas_multiples,
                s.tipo_internet,
                s.seguridad_online,
                s.respaldo_online,
                s.proteccion_dispositivo,
                s.soporte_tecnico,
                s.streaming_tv,
                s.streaming_peliculas,
                s.facturacion_sin_papel,
                m.conecciones_mensuales,
                m.dias_activos_semanales,
                m.promedio_coneccion,
                m.caracteristicas_usadas,
                m.tasa_crecimiento_uso,
                m.dias_ultima_coneccion,
                m.tickets_soporte,
                m.tiempo_resolucion,
                m.tipo_queja,
                m.score_csat,
                m.escaladas_soporte,
                m.tasa_apertura_email,
                m.tasa_clics,
                m.score_nps,
                m.respuesta_encuesta,
                m.referencias_hechas,
                m.abandono_historico,
                m.tiempo_sesion_promedio,
                m.ultimo_contacto_soporte,
                ctx.cambio_plan_reciente,
                ctx.fecha_cambio_plan,
                ctx.downgrade_reciente,
                ctx.fecha_ultimo_pago,
                ctx.intentos_cobro_fallidos,
                ctx.dias_mora,
                ctx.ofertas_recibidas,
                ctx.visitas_app_mensual,
                ctx.features_nuevas_usadas,
                ctx.competidores_area,
                ctx.precio_vs_mercado
            FROM customers c
            LEFT JOIN subscriptions s ON c.id = s.customer_id
            LEFT JOIN customer_metrics m ON c.id = m.customer_id
            LEFT JOIN customer_context ctx ON c.id = ctx.customer_id
            ORDER BY c.id
            """;

        // Ejecutar query y obtener resultados
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(query);
        log.info("📊 Encontrados {} clientes para exportar", rows.size());

        if (rows.isEmpty()) {
            return ""; // Base de datos vacía
        }

        // Construir CSV manualmente
        StringWriter writer = new StringWriter();

        // 1. Escribir encabezados (nombres exactos de columnas)
        List<String> headers = List.of(rows.get(0).keySet().toArray(new String[0]));
        writer.write(String.join(",", headers));
        writer.write("\n");

        // 2. Escribir datos
        for (Map<String, Object> row : rows) {
            StringBuilder line = new StringBuilder();
            for (String header : headers) {
                Object value = row.get(header);

                if (value == null) {
                    line.append("");
                } else {
                    // Escapar comillas y valores con comas
                    String strValue = value.toString();
                    if (strValue.contains(",") || strValue.contains("\"") || strValue.contains("\n")) {
                        strValue = "\"" + strValue.replace("\"", "\"\"") + "\"";
                    }
                    line.append(strValue);
                }

                line.append(",");
            }

            // Remover última coma
            line.setLength(line.length() - 1);
            writer.write(line.toString());
            writer.write("\n");
        }

        String csv = writer.toString();
        log.info("✅ CSV generado exitosamente ({} líneas, {} bytes)", rows.size() + 1, csv.length());

        return csv;
    }
}
