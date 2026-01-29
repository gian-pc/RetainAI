package com.retainai.service;

import com.retainai.dto.ChatbotMetadata;
import com.retainai.dto.ChatbotResponse;
import com.retainai.dto.ChatMessageDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Servicio para convertir lenguaje natural a SQL usando Gemini
 * y ejecutar queries de forma segura
 */
@Service
@Slf4j
public class TextToSQLService {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Esquema de la base de datos para que Gemini genere SQL correcto
     */
    private static final String DB_SCHEMA = """
            ESQUEMA DE BASE DE DATOS (MySQL):

            Tabla: customers
            - id VARCHAR(20) PRIMARY KEY
            - nombre VARCHAR(100) -- Nombre del cliente
            - ciudad VARCHAR(50)
            - borough VARCHAR(50) -- Manhattan, Brooklyn, Queens, Bronx, Staten Island
            - latitud DOUBLE
            - longitud DOUBLE
            - segmento VARCHAR(50)
            - codigo_postal VARCHAR(10)
            - edad INT

            Tabla: subscriptions
            - id BIGINT PRIMARY KEY AUTO_INCREMENT
            - customer_id VARCHAR(20) FOREIGN KEY -> customers.id
            - cuota_mensual DOUBLE -- Ingresos mensuales del cliente
            - ingresos_totales DOUBLE -- Ingresos totales históricos
            - tipo_contrato VARCHAR(50) -- "Mes a mes", "Anual", "Bienal"
            - meses_permanencia INT -- Antigüedad del cliente en meses
            - tipo_internet VARCHAR(50) -- "Fibra óptica", "DSL", "No"

            Tabla: customer_metrics
            - id BIGINT PRIMARY KEY AUTO_INCREMENT
            - customer_id VARCHAR(20) FOREIGN KEY -> customers.id
            - score_nps INT -- Net Promoter Score (0-10)
            - tickets_soporte INT -- Número de tickets de soporte
            - score_csat FLOAT -- Customer Satisfaction Score
            - dias_ultima_coneccion INT

            Tabla: ai_predictions
            - id BIGINT PRIMARY KEY AUTO_INCREMENT
            - customer_id VARCHAR(20) FOREIGN KEY -> customers.id
            - probabilidad_fuga DOUBLE -- Probabilidad de churn (0.0-1.0)
            - nivel_riesgo VARCHAR(20) -- "Bajo", "Medio", "Alto" (calculado automáticamente)
            - motivo_principal VARCHAR(200) -- Factor principal de riesgo
            - fecha_analisis TIMESTAMP

            REGLAS:
            - Usa JOINs cuando necesites datos de múltiples tablas
            - Para obtener predicciones, usa la más reciente por cliente (ORDER BY fecha_analisis DESC)
            - Los clientes "en riesgo" tienen probabilidad_fuga >= 0.70 o nivel_riesgo = 'Alto'
            - Para priorizar por valor, ordena por cuota_mensual o ingresos_totales DESC
            - IMPORTANTE: nivel_riesgo está en ai_predictions, NO en subscriptions
            - IMPORTANTE: Los nombres de columnas en ai_predictions están en español
            """;

    /**
     * Procesa una pregunta del usuario usando Text-to-SQL
     */
    public ChatbotResponse processQuestion(String question) {
        log.info("🤖 Procesando pregunta: {}", question);

        try {
            // 1. Generar SQL con Gemini
            String sql = generateSQL(question);
            log.info("📝 SQL generado: {}", sql);

            // 2. Validar seguridad del SQL
            validateSQL(sql);

            // 3. Ejecutar SQL
            List<Map<String, Object>> results = executeSQL(sql);
            log.info("✅ Resultados obtenidos: {} filas", results.size());

            // Normalizar resultados para asegurar que los nombres de columnas sean
            // consistentes
            results = normalizeResults(results);

            // Log de resultados para depuración profunda
            if (!results.isEmpty()) {
                for (int i = 0; i < Math.min(results.size(), 3); i++) {
                    log.info("📊 [DEBUG] Fila {}: {}", i, results.get(i));
                }
            }

            // 4. Formatear respuesta en lenguaje natural
            String naturalResponse = formatResults(question, results);

            // 5. Extraer metadata para el mapa
            ChatbotMetadata metadata = extractMetadata(question, results);

            // Log de metadata para depuración
            if (metadata != null) {
                log.info("🎯 [DEBUG] Metadata generada: zoomTo={}, animate={}, customerIds={}",
                        metadata.getZoomTo(), metadata.getAnimate(), metadata.getCustomerIds());
            }

            return ChatbotResponse.builder()
                    .message(naturalResponse)
                    .metadata(metadata)
                    .generatedSql(sql)
                    .build();

        } catch (Exception e) {
            log.error("❌ Error procesando pregunta", e);
            return ChatbotResponse.builder()
                    .message("Lo siento, no pude procesar tu pregunta. " +
                            "Intenta reformularla o pregunta algo más específico.")
                    .build();
        }
    }

    /**
     * Genera SQL a partir de lenguaje natural usando Gemini
     */
    private String generateSQL(String question) {
        String prompt = String.format(
                """
                        Eres un experto en SQL para MySQL.

                        %s

                        PREGUNTA DEL USUARIO:
                        "%s"

                        INSTRUCCIONES:
                        1. Genera SOLO el query SQL (sin explicaciones ni comentarios)
                        2. El query debe ser seguro (SOLO SELECT, sin DROP/DELETE/UPDATE)
                        3. Usa JOINs cuando sea necesario
                        4. Para clientes en riesgo, filtra por probabilidad_fuga >= 0.70
                        5. Para priorizar por valor, ordena por cuota_mensual DESC
                        6. Limita resultados a máximo 100 filas (LIMIT 100)
                        7. Devuelve el SQL entre etiquetas <SQL>...</SQL>
                        8. IMPORTANTE: SIEMPRE incluye c.id en el SELECT (necesario para el mapa)
                        9. IMPORTANTE: Si haces JOIN con ai_predictions, SIEMPRE incluye p.nivel_riesgo Y p.probabilidad_fuga en el SELECT.
                        10. IMPORTANTE: Para obtener la probabilidad de fuga, usa la columna p.probabilidad_fuga de ai_predictions.
                        11. IMPORTANTE: USA SIEMPRE p.probabilidad_fuga para encontrar al cliente de mayor riesgo.
                        12. IMPORTANTE: NUNCA uses LIMIT 1 si la pregunta es sobre el cliente de "mayor" riesgo, usa ORDER BY DESC y deja que el sistema lo maneje, o si usas LIMIT 1 asegúrate de que el ORDER BY sea correcto.

                        EJEMPLOS:

                        Pregunta: "¿Quién tiene el NPS más alto en Queens?"
                        Respuesta: <SQL>SELECT c.id, c.nombre, m.score_nps FROM customers c JOIN customer_metrics m ON c.id = m.customer_id WHERE c.borough = 'Queens' ORDER BY m.score_nps DESC</SQL>

                        Pregunta: "¿Cuántos clientes en Brooklyn tienen fibra óptica?"
                        Respuesta: <SQL>SELECT COUNT(*) as total FROM customers c JOIN subscriptions s ON c.id = s.customer_id WHERE c.borough = 'Brooklyn' AND s.tipo_internet = 'Fibra óptica'</SQL>

                        Pregunta: "¿Quién es el cliente más importante en riesgo?"
                        Respuesta: <SQL>SELECT c.id, c.nombre, c.borough, s.cuota_mensual, p.probabilidad_fuga, p.nivel_riesgo, p.motivo_principal FROM customers c JOIN subscriptions s ON c.id = s.customer_id JOIN ai_predictions p ON c.id = p.customer_id ORDER BY p.probabilidad_fuga DESC, s.cuota_mensual DESC</SQL>

                        Pregunta: "¿Dónde está el cliente de mayor riesgo?"
                        Respuesta: <SQL>SELECT c.id, c.nombre, c.borough, c.latitud, c.longitud, s.cuota_mensual, p.probabilidad_fuga, p.nivel_riesgo, p.motivo_principal FROM customers c JOIN subscriptions s ON c.id = s.customer_id JOIN ai_predictions p ON c.id = p.customer_id ORDER BY p.probabilidad_fuga DESC</SQL>

                        Ahora genera el SQL para la pregunta del usuario.
                        """,
                DB_SCHEMA, question);

        String response = geminiService.chat(prompt, java.util.Collections.emptyList());
        return extractSQLFromResponse(response);
    }

    /**
     * Extrae el SQL de la respuesta de Gemini
     */
    private String extractSQLFromResponse(String response) {
        // Log the raw response from Gemini for debugging
        log.info("🤖 Raw response from Gemini: {}", response);

        // Sanitize the response: extract only the part within <SQL> tags
        Pattern pattern = Pattern.compile("<SQL>(.*?)</SQL>", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(response);

        if (matcher.find()) {
            String sql = matcher.group(1).trim();
            // Remove any potential backticks or SQL language markers if present inside tags
            sql = sql.replace("```sql", "").replace("```", "").trim();
            return sql;
        }

        // Si no encuentra las etiquetas, intentar extraer el SQL directamente si
        // empieza con SELECT
        String cleaned = response.trim().replace("```sql", "").replace("```", "").trim();
        if (cleaned.toUpperCase().startsWith("SELECT")) {
            return cleaned;
        }

        throw new IllegalStateException("No se pudo extraer SQL de la respuesta de Gemini");
    }

    /**
     * Valida que el SQL sea seguro (solo SELECT)
     */
    private void validateSQL(String sql) {
        String upperSQL = sql.trim().toUpperCase();

        // Solo permitir SELECT
        if (!upperSQL.startsWith("SELECT")) {
            throw new SecurityException("Solo se permiten queries SELECT");
        }

        // Prohibir operaciones peligrosas
        String[] forbidden = { "DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "CREATE", "TRUNCATE", "EXEC" };
        for (String keyword : forbidden) {
            if (upperSQL.contains(keyword)) {
                throw new SecurityException("Operación prohibida: " + keyword);
            }
        }

        log.info("✅ SQL validado como seguro");
    }

    /**
     * Normaliza los resultados para que los nombres de las columnas sean
     * consistentes
     */
    private List<Map<String, Object>> normalizeResults(List<Map<String, Object>> results) {
        List<Map<String, Object>> normalized = new ArrayList<>();
        for (Map<String, Object> row : results) {
            Map<String, Object> normalizedRow = new java.util.HashMap<>();
            for (Map.Entry<String, Object> entry : row.entrySet()) {
                String key = entry.getKey();
                // Si la columna es id o customer_id, normalizar a "id" para la metadata
                if (key.equalsIgnoreCase("id") || key.equalsIgnoreCase("customer_id")) {
                    normalizedRow.put("id", entry.getValue());
                }
                normalizedRow.put(key, entry.getValue());
            }
            normalized.add(normalizedRow);
        }
        return normalized;
    }

    /**
     * Ejecuta el SQL de forma segura
     */
    private List<Map<String, Object>> executeSQL(String sql) {
        try {
            return jdbcTemplate.queryForList(sql);
        } catch (Exception e) {
            log.error("❌ Error ejecutando SQL: {}", sql, e);
            throw new RuntimeException("Error ejecutando query: " + e.getMessage());
        }
    }

    /**
     * Formatea los resultados en lenguaje natural usando Gemini
     */
    private String formatResults(String question, List<Map<String, Object>> results) {
        if (results == null || results.isEmpty()) {
            return "No encontré resultados para tu pregunta. " +
                    "Intenta reformularla o pregunta algo diferente.";
        }

        // Convertir resultados a texto
        StringBuilder resultsText = new StringBuilder();
        for (int i = 0; i < Math.min(results.size(), 10); i++) {
            resultsText.append(results.get(i).toString()).append("\n");
        }

        String prompt = String.format(
                """
                        Pregunta del usuario: "%s"

                        Resultados de la base de datos:
                        %s

                        INSTRUCCIONES DE FORMATO (ESTILO GEMINI - ULTRA CORTO):
                        1.  **DIRECTO Y CONCISO**: Tu respuesta debe ser MUY BREVE. ¡Ve al grano inmediatamente!
                        2.  **Estructura Simplificada**:
                            *   `📊 Respuesta`: Una sola frase con la conclusión principal.
                            *   `🔍 Detalles`: Máximo 3 puntos clave (bullets) con los datos exactos.

                        3.  **Iconos y Estilo**:
                            *   Usa 💰 (dinero), ⚠️ (riesgo), 📍 (lugar), 📈 (dato).
                            *   Pon en **negrita** (`**texto**`) SIEMPRE: Nombres, Cifras ($) y Riesgo (Alto/Medio/Bajo).

                        REGLAS CRÍTICAS:
                        *   Si hay probabilidad, úsala: "Riesgo **Alto** (**85%**)".
                        *   NO des explicaciones largas ni saludos.
                        *   Máximo 50-60 palabras en total.

                        Genera la respuesta formateada ahora:
                        """,
                question, resultsText.toString());

        return geminiService.chat(prompt, java.util.Collections.emptyList());
    }

    /**
     * Extrae metadata para actualizar el mapa basándose en la pregunta y resultados
     */
    private ChatbotMetadata extractMetadata(String question, List<Map<String, Object>> results) {
        if (results == null || results.isEmpty()) {
            return null;
        }

        ChatbotMetadata.ChatbotMetadataBuilder metadata = ChatbotMetadata.builder();

        // Extraer IDs de clientes de los resultados
        List<String> customerIds = new ArrayList<>();
        for (Map<String, Object> row : results) {
            log.info("🔍 [METADATA] Procesando fila: {}", row);

            // Probar diferentes variantes de nombres de columnas (case-insensitive)
            Object idValue = null;
            // Priorizar columna "id" normalizada
            if (row.containsKey("id")) {
                idValue = row.get("id");
            } else {
                for (String key : row.keySet()) {
                    if (key.equalsIgnoreCase("customer_id") || key.equalsIgnoreCase("customerId")) {
                        idValue = row.get(key);
                        break;
                    }
                }
            }

            if (idValue != null) {
                String idStr = idValue.toString();
                if (!customerIds.contains(idStr)) {
                    customerIds.add(idStr);
                }
            }
        }

        log.info("🔍 [METADATA] IDs detectados para el mapa: {}", customerIds);

        if (customerIds.isEmpty()) {
            return null;
        }

        // Detectar tipo de pregunta y configurar metadata
        String lowerQuestion = question.toLowerCase();

        // Si se pregunta por "el cliente" (singular) o "mayor riesgo", "más
        // importante", etc.
        // y tenemos al menos un resultado, forzar zoom al primero para evitar confusión
        boolean isSingularRequest = lowerQuestion.contains("mayor") ||
                lowerQuestion.contains("máximo") ||
                lowerQuestion.contains("mas") ||
                lowerQuestion.contains("máximo") ||
                lowerQuestion.contains("highest") ||
                lowerQuestion.contains("quién es el") ||
                lowerQuestion.contains("donde esta el") ||
                lowerQuestion.contains("busca") ||
                lowerQuestion.contains("buscar") ||
                lowerQuestion.contains("encuentra") ||
                lowerQuestion.contains("quien es el") ||
                lowerQuestion.contains("quién es el") ||
                lowerQuestion.contains("donde esta el") ||
                // Variaciones de riesgo singular
                (lowerQuestion.contains("mayor riesgo") && !lowerQuestion.contains("los")) ||
                (lowerQuestion.contains("más riesgo") && !lowerQuestion.contains("los")) ||
                (lowerQuestion.contains("mas riesgo") && !lowerQuestion.contains("los")) ||
                results.size() == 1;

        if (isSingularRequest && !customerIds.isEmpty()) {
            // Log for debugging
            log.info("🎯 Detectada solicitud singular. Enfocando primer cliente: {}", customerIds.get(0));
            metadata.customerIds(List.of(customerIds.get(0)));
            metadata.zoomTo("auto");
            metadata.animate(true); // Forzar animación para solicitudes singulares
        } else if (!customerIds.isEmpty()) {
            metadata.customerIds(customerIds.subList(0, Math.min(customerIds.size(), 10)));
        }

        // Preguntas sobre clientes importantes/en riesgo
        if (lowerQuestion.contains("importante") || lowerQuestion.contains("más valor") ||
                lowerQuestion.contains("en riesgo") || lowerQuestion.contains("riesgo")) {
            metadata.highlightType("critical");
            metadata.animate(true);
        }
        // Preguntas sobre clientes específicos (muéstrame, busca, encuentra, etc.)
        else if (lowerQuestion.contains("muéstrame") || lowerQuestion.contains("busca") ||
                lowerQuestion.contains("encuentra") || lowerQuestion.contains("cliente") ||
                lowerQuestion.contains("dónde está")) {
            metadata.highlightType("info");
            metadata.animate(true);
        }
        // Si hay customerIds pero no se detectó el tipo, usar warning
        else if (!customerIds.isEmpty()) {
            metadata.highlightType("warning");
            metadata.animate(true);
        }

        // Preguntas geográficas
        if (lowerQuestion.contains("brooklyn")) {
            metadata.filterByBorough("Brooklyn");
            metadata.zoomTo("Brooklyn");
        } else if (lowerQuestion.contains("manhattan")) {
            metadata.filterByBorough("Manhattan");
            metadata.zoomTo("Manhattan");
        } else if (lowerQuestion.contains("queens")) {
            metadata.filterByBorough("Queens");
            metadata.zoomTo("Queens");
        } else if (lowerQuestion.contains("bronx")) {
            metadata.filterByBorough("Bronx");
            metadata.zoomTo("Bronx");
        } else if (lowerQuestion.contains("staten island")) {
            metadata.filterByBorough("Staten Island");
            metadata.zoomTo("Staten Island");
        } else if (!customerIds.isEmpty()) {
            metadata.zoomTo("auto");
        }

        return metadata.build();
    }
}
