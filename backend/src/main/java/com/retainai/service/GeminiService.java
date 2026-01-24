package com.retainai.service;

import com.retainai.dto.ChatMessageDto;
import com.retainai.model.AiPrediction;
import com.retainai.model.Customer;
import com.retainai.repository.PredictionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent}")
    private String geminiApiUrl;

    private final RestTemplate restTemplate;
    private final DashboardService dashboardService;
    private final CustomerService customerService;
    private final PredictionRepository predictionRepository;

    public String chat(String userMessage, List<ChatMessageDto> conversationHistory) {
        log.info("🤖 Enviando mensaje a Gemini: {}", userMessage);

        // Validar que la API key esté configurada
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            log.error("❌ GEMINI_API_KEY no configurada");
            throw new IllegalStateException(
                    "GEMINI_API_KEY no configurada. Por favor configura tu API key en el archivo .env");
        }

        try {
            // 🔍 Enriquecer contexto con queries SQL dinámicas basadas en la pregunta
            String enrichedContext = enrichContextWithDatabaseQuery(userMessage);
            // Construir el contexto del sistema
            String systemContext = buildSystemContext();

            // Preparar el payload para Gemini
            Map<String, Object> requestBody = new HashMap<>();

            // Construir el prompt completo
            StringBuilder fullPrompt = new StringBuilder(systemContext);
            fullPrompt.append("\n\n");

            // Agregar contexto dinámico de la query SQL (si existe)
            if (enrichedContext != null && !enrichedContext.isEmpty()) {
                fullPrompt.append(enrichedContext);
                fullPrompt.append("\n\n");
            }

            // Agregar historial de conversación
            if (conversationHistory != null && !conversationHistory.isEmpty()) {
                fullPrompt.append("Historial de conversación:\n");
                for (ChatMessageDto msg : conversationHistory) {
                    fullPrompt.append(msg.getRole()).append(": ").append(msg.getContent()).append("\n");
                }
                fullPrompt.append("\n");
            }

            fullPrompt.append("INSTRUCCIONES DE RESPUESTA:\n");
            fullPrompt.append(
                    "1. SI el usuario saluda (ej: 'hola', 'buenos días'): Responde de forma breve, profesional y amable. NO uses el formato de análisis.\n");
            fullPrompt.append("2. SI el usuario hace una pregunta general: Responde directamente.\n");
            fullPrompt.append(
                    "3. SI Y SOLO SI el usuario pide análisis, datos, riesgo o información de clientes, DEBES usar el siguiente formato:\n\n");
            fullPrompt.append("📊 **Summary**\n");
            fullPrompt.append("[1-2 oraciones sobre la situación general]\n\n");
            fullPrompt.append("🔍 **Key Insights**\n");
            fullPrompt.append("🔴 High Risk Customers: [número]\n");
            fullPrompt.append("💰 Revenue at Risk: $[cantidad]\n");
            fullPrompt.append("📉 Main Driver: [razón principal]\n");
            fullPrompt.append("📍 Hotspot: [borough, ciudad] (SIEMPRE menciona el borough si está disponible)\n\n");
            fullPrompt.append("🤔 **Why this is happening**\n");
            fullPrompt.append("- [Razón 1]\n");
            fullPrompt.append("- [Razón 2]\n");
            fullPrompt.append("- [Razón 3]\n\n");
            fullPrompt.append("Usuario: ").append(userMessage);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(Map.of("text", fullPrompt.toString())));
            requestBody.put("contents", List.of(content));

            // Headers con API key
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Llamar a Gemini API
            String url = geminiApiUrl + "?key=" + geminiApiKey;
            log.info("📡 Llamando a Gemini API en: {}", geminiApiUrl);
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> firstCandidate = candidates.get(0);
                    Map<String, Object> contentObj = (Map<String, Object>) firstCandidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentObj.get("parts");
                    if (!parts.isEmpty()) {
                        String geminiResponse = (String) parts.get(0).get("text");
                        log.info("✅ Respuesta de Gemini recibida exitosamente");
                        return geminiResponse;
                    }
                }
            }

            log.error("❌ Respuesta de Gemini no válida: {}", response);
            throw new RuntimeException("Gemini API devolvió una respuesta no válida");

        } catch (Exception e) {
            log.error("❌ Error al comunicarse con Gemini API: {}", e.getMessage(), e);
            throw new RuntimeException("Error al comunicarse con Gemini API: " + e.getMessage(), e);
        }
    }

    private String buildSystemContext() {
        try {
            // Obtener datos reales del dashboard
            var stats = dashboardService.getDashboardStats();

            // Obtener top 3 clientes de alto riesgo para contexto
            List<AiPrediction> allPredictions = predictionRepository.findTop3HighRiskCustomers();
            List<AiPrediction> highRiskCustomers = allPredictions.stream()
                    .limit(3)
                    .toList();

            StringBuilder topRiskContext = new StringBuilder();

            if (!highRiskCustomers.isEmpty()) {
                topRiskContext.append("\n\nCLIENTES DE MAYOR RIESGO (para drill-down):\n");
                for (int i = 0; i < highRiskCustomers.size(); i++) {
                    AiPrediction pred = highRiskCustomers.get(i);
                    Customer customer = pred.getCustomer();
                    String location = customer.getBorough() != null
                            ? customer.getBorough() + ", " + customer.getCiudad()
                            : customer.getCiudad();

                    topRiskContext.append(String.format(
                            "- Cliente #%d: %s (ID: %s) | Probabilidad de fuga: %.1f%% | Razón: %s | Valor: $%.0f/mes | Ubicación: %s\n",
                            (i + 1),
                            customer.getNombre(),
                            customer.getId(),
                            pred.getProbabilidadFuga() * 100,
                            pred.getMotivoPrincipal(),
                            customer.getSubscription() != null ? customer.getSubscription().getCuotaMensual() : 0.0,
                            location));
                }
            }

            String systemContext = String.format(
                    """
                            Eres un asistente ejecutivo de RetainAI, especializado en prevención de churn para empresas de suscripción.

                            Tu audiencia: Ejecutivos, gerentes de retención y líderes de negocio que necesitan tomar decisiones rápidas.

                            ⚠️ CONTEXTO GEOGRÁFICO CRÍTICO:
                            TODOS los clientes están ubicados en New York City (USA).
                            Los boroughs incluyen: Manhattan, Brooklyn, Queens, Bronx, Staten Island.
                            NUNCA menciones ciudades de México, LATAM u otros países.

                            DATOS ACTUALES DEL NEGOCIO (en tiempo real):
                            📊 Panorama General:
                            - Clientes totales: %,d
                            - Clientes que ya cancelaron: %,d
                            - Tasa de churn actual: %.1f%%
                            - Ingresos mensuales totales: $%,.0f
                            - Ingresos en riesgo de pérdida: $%,.0f
                            - NPS promedio: %.0f/100
                            %s

                            CAPACIDADES DEL SISTEMA:
                            - Predicción de churn usando Random Forest con explicabilidad (XAI)
                            - Cada predicción incluye: nivel de riesgo (High/Medium/Low), probabilidad %%,  razón principal (main_factor), y acción recomendada
                            - Análisis geográfico de concentración de churn
                            - Priorización de clientes por impacto en ingresos

                            REGLAS CRÍTICAS (OBLIGATORIO):

                            1. USA SOLO LOS DATOS REALES proporcionados arriba
                               - NO inventes clientes, ciudades, o montos
                               - USA los IDs de cliente EXACTOS de la lista de "CLIENTES DE MAYOR RIESGO"
                               - USA las ciudades EXACTAS que aparecen en los datos (ej: si dice "New York", usa "New York")
                               - USA las probabilidades y valores EXACTOS que se proporcionan

                            ⚠️ REGLA SUPREMA - SOLO CLIENTES EN LA LISTA:
                               - SOLO puedes mencionar clientes que aparecen en la sección "CLIENTES DE MAYOR RIESGO"
                               - Si te preguntan por "el cliente de mayor riesgo", es el Cliente #1 de esa lista
                               - NUNCA menciones clientes que NO estén en esa lista de 3 clientes
                               - Si alguien menciona un cliente fuera de la lista, responde: "No tengo información detallada de ese cliente. Los 3 clientes de mayor riesgo HOY son: [lista los 3]"
                               - USA las probabilidades EXACTAS (no redondees 94%% a 99%%)

                            2. **Formato de respuesta**: Usa el formato estructurado con emojis
                               - 📊 Summary (1-2 oraciones)
                               - 🔍 Key Insights (números clave)
                               - 🤔 Why this is happening (3 razones máximo)

                            3. **Lo que NUNCA debes hacer**:
                               - ❌ NO inventes datos (ciudades, nombres, montos)
                               - ❌ NO uses ejemplos de México si los datos son de USA
                               - ❌ NO uses tablas markdown (|---|)
                               - ❌ NO menciones "sistema", "base de datos", "API"
                               - ❌ NO digas "deberías llamar"

                            4. **Verificación de datos**:
                               - Si mencionas un cliente, DEBE estar en la lista de arriba
                               - Si mencionas una ciudad, DEBE ser la que aparece en los datos
                               - Si mencionas un monto, DEBE ser el valor EXACTO proporcionado

                            5. **REGLA DE MAPA (IMPORTANTE)**:
                               - Cuando menciones un cliente de alto riesgo, **SIEMPRE** menciona explícitamente su **UBICACIÓN** (Borough o Ciudad) para que el mapa pueda filtrarse.
                               - Ejemplo: "El cliente 123 en **Brooklyn** tiene riesgo alto..."

                            6. Habla en español profesional y enfócate en dinero, riesgo y razones específicas
                            """,
                    stats.getTotalCustomers(),
                    stats.getAbandonedCustomers(),
                    stats.getChurnRate(),
                    stats.getTotalRevenue(),
                    stats.getChurnRevenue(),
                    stats.getAvgNpsScore(),
                    topRiskContext.toString());

            log.info("🔍 [DEBUG] Contexto del Sistema generado para Gemini:\n{}", systemContext);
            return systemContext;
        } catch (Exception e) {
            log.warn("No se pudieron obtener stats completos, usando contexto básico");
            return """
                    Eres un asistente ejecutivo de RetainAI para prevención de churn.
                    Habla como un consultor senior, sé conciso y enfócate en insights de negocio accionables.
                    Responde siempre en español natural.
                    """;
        }
    }

    /**
     * 🔍 Enriquece el contexto con datos de la BD basándose en la pregunta del usuario
     * Hace queries SQL dinámicas para obtener datos reales
     */
    private String enrichContextWithDatabaseQuery(String userMessage) {
        try {
            String lowerMsg = userMessage.toLowerCase();

            // Detectar pregunta por el cliente de MAYOR riesgo
            if (lowerMsg.contains("mayor riesgo") || lowerMsg.contains("más riesgo") ||
                lowerMsg.contains("mas riesgo") || lowerMsg.contains("highest risk")) {

                log.info("🔍 [SQL QUERY] Detectada pregunta por cliente de MAYOR riesgo");

                // Query SQL: Obtener el cliente con MAYOR probabilidad de churn
                List<AiPrediction> topPrediction = predictionRepository.findTop3HighRiskCustomers();

                if (!topPrediction.isEmpty()) {
                    AiPrediction pred = topPrediction.get(0); // El primero es el de mayor riesgo
                    Customer customer = pred.getCustomer();

                    String location = customer.getBorough() != null
                            ? customer.getBorough() + ", " + customer.getCiudad()
                            : customer.getCiudad();

                    String queryResult = String.format("""

                            📊 RESULTADO DE CONSULTA SQL A LA BASE DE DATOS (en tiempo real):

                            Query ejecutada: SELECT * FROM ai_predictions JOIN customers ORDER BY probabilidad_fuga DESC LIMIT 1

                            CLIENTE DE MAYOR RIESGO HOY:
                            - Nombre: %s
                            - ID: %s
                            - Probabilidad de churn: %.1f%%
                            - Nivel de riesgo: %s
                            - Razón principal: %s
                            - Cargo mensual: $%.2f/mes
                            - Ubicación: %s
                            - Segmento: %s

                            ⚠️ IMPORTANTE: USA ESTOS DATOS EXACTOS. NO inventes otros clientes ni otras probabilidades.
                            """,
                            customer.getNombre(),
                            customer.getId(),
                            pred.getProbabilidadFuga() * 100,
                            pred.getNivelRiesgo(),
                            pred.getMotivoPrincipal(),
                            customer.getSubscription() != null ? customer.getSubscription().getCuotaMensual() : 0.0,
                            location,
                            customer.getSegmento());

                    log.info("✅ [SQL QUERY] Datos del cliente de mayor riesgo inyectados en el contexto");
                    return queryResult;
                }
            }

            // Más queries pueden agregarse aquí en el futuro
            // - Clientes por ubicación
            // - Clientes por segmento
            // - etc.

            return ""; // Si no match ninguna query, retornar vacío

        } catch (Exception e) {
            log.error("❌ Error ejecutando query dinámica: {}", e.getMessage());
            return ""; // En caso de error, continuar sin contexto adicional
        }
    }

}
