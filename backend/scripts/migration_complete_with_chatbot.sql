-- =============================================================================
-- MIGRACIÓN COMPLETA: BD Lista para Modelo ML + Chatbot Inteligente
-- =============================================================================
-- Autor: RetainAI Team
-- Fecha: 2026-01-19
-- Objetivo: Preparar BD para:
--           1. Predicción ML (22 features base)
--           2. Chatbot contextual (67 campos totales)
--           3. Analytics de negocio
--
-- CAMBIOS:
--   • Agregar 2 campos en customer_metrics (para ML)
--   • Crear nueva tabla customer_context (para Chatbot)
-- =============================================================================

USE retainai_db;

-- =============================================================================
-- PARTE 1: CAMPOS PARA EL MODELO ML
-- =============================================================================

-- Agregar tiempo_sesion_promedio (Feature #24)
ALTER TABLE customer_metrics
ADD COLUMN IF NOT EXISTS tiempo_sesion_promedio FLOAT DEFAULT NULL
COMMENT 'Tiempo promedio de sesión en minutos (Feature del modelo ML)';

-- Agregar ultimo_contacto_soporte (para calcular dias_desde_ultimo_contacto)
ALTER TABLE customer_metrics
ADD COLUMN IF NOT EXISTS ultimo_contacto_soporte DATE DEFAULT NULL
COMMENT 'Fecha del último contacto con soporte (para calcular feature dias_desde_ultimo_contacto)';

-- =============================================================================
-- PARTE 2: TABLA DE CONTEXTO PARA CHATBOT
-- =============================================================================

-- Crear tabla customer_context (Business Intelligence)
CREATE TABLE IF NOT EXISTS customer_context (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,

    -- ========== HISTORIAL DE CUENTA ==========
    cambio_plan_reciente BOOLEAN DEFAULT FALSE
        COMMENT 'Indica si el cliente cambió de plan recientemente',

    fecha_cambio_plan DATE DEFAULT NULL
        COMMENT 'Fecha del último cambio de plan',

    downgrade_reciente BOOLEAN DEFAULT FALSE
        COMMENT 'Indica si el cliente bajó de plan (downgrade)',

    -- ========== FINANCIERO ==========
    fecha_ultimo_pago DATE DEFAULT NULL
        COMMENT 'Fecha del último pago exitoso',

    intentos_cobro_fallidos INT DEFAULT 0
        COMMENT 'Número de intentos de cobro que fallaron',

    dias_mora INT DEFAULT 0
        COMMENT 'Días de mora en pagos',

    -- ========== MARKETING Y ENGAGEMENT ==========
    ofertas_recibidas INT DEFAULT 0
        COMMENT 'Número de ofertas de retención recibidas',

    visitas_app_mensual INT DEFAULT 0
        COMMENT 'Número de veces que visitó la app este mes',

    features_nuevas_usadas INT DEFAULT 0
        COMMENT 'Número de funcionalidades nuevas que ha usado',

    -- ========== COMPETENCIA ==========
    competidores_area INT DEFAULT 0
        COMMENT 'Número de competidores en su área geográfica',

    precio_vs_mercado VARCHAR(50) DEFAULT 'Competitivo'
        COMMENT 'Comparación de precio: Alto, Competitivo, Bajo',

    -- ========== METADATA ==========
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- ========== RELACIONES ==========
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_cambio_plan (cambio_plan_reciente),
    INDEX idx_downgrade (downgrade_reciente),
    INDEX idx_mora (dias_mora),
    INDEX idx_ofertas (ofertas_recibidas)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Contexto adicional para chatbot y analytics de negocio';

-- =============================================================================
-- VERIFICACIÓN
-- =============================================================================

-- 1. Verificar customer_metrics
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'retainai_db'
  AND TABLE_NAME = 'customer_metrics'
  AND COLUMN_NAME IN ('tiempo_sesion_promedio', 'ultimo_contacto_soporte');

-- 2. Verificar customer_context
SHOW CREATE TABLE customer_context;

-- 3. Contar registros
SELECT
    (SELECT COUNT(*) FROM customers) AS total_customers,
    (SELECT COUNT(*) FROM customer_context) AS total_context_records,
    (SELECT COUNT(*) FROM customer_metrics) AS total_metrics_records;

-- =============================================================================
-- DATOS DE EJEMPLO (OPCIONAL - Para testing)
-- =============================================================================

-- Insertar contexto de ejemplo para un cliente
-- Descomenta las siguientes líneas si quieres probar:

/*
INSERT INTO customer_context (
    customer_id,
    cambio_plan_reciente,
    fecha_cambio_plan,
    downgrade_reciente,
    intentos_cobro_fallidos,
    dias_mora,
    ofertas_recibidas,
    visitas_app_mensual,
    features_nuevas_usadas,
    competidores_area,
    precio_vs_mercado
) VALUES (
    '0002-ORFBO',
    TRUE,
    '2025-11-15',
    TRUE,
    2,
    0,
    3,
    2,
    0,
    6,
    'Alto'
);
*/

-- =============================================================================
-- NOTAS DE USO
-- =============================================================================

/*
📋 CÓMO USAR ESTA ARQUITECTURA:

1️⃣ MODELO ML (Predicción):
   - Lee: customers + subscriptions + customer_metrics
   - Usa: 22 features base + 3 calculados = 24 total
   - NO necesita customer_context

2️⃣ CHATBOT (Explicación + Contexto):
   - Lee: TODAS las tablas (customers + subscriptions + customer_metrics + customer_context)
   - Usa: 67 campos totales
   - Genera: Explicación contextual + Sugerencias accionables

   Ejemplo de query del chatbot:
   ```sql
   SELECT
       c.*,
       s.*,
       cm.*,
       cc.*,
       p.risk,
       p.probability,
       p.main_factor,
       p.next_best_action
   FROM customers c
   JOIN subscriptions s ON c.id = s.customer_id
   JOIN customer_metrics cm ON c.id = cm.customer_id
   LEFT JOIN customer_context cc ON c.id = cc.customer_id
   LEFT JOIN ai_predictions p ON c.id = p.customer_id
   WHERE c.id = '0002-ORFBO';
   ```

3️⃣ IMPORTACIÓN DE CSV:
   - Mapear columnas CSV a las 4 tablas:
     • customers (17 campos)
     • subscriptions (21 campos)
     • customer_metrics (17 + 2 nuevos = 19 campos)
     • customer_context (10 campos)

4️⃣ EJEMPLO DE RESPUESTA DEL CHATBOT:
   ```
   🤖 CHATBOT: "Cliente 0002-ORFBO tiene riesgo HIGH (85%)

   📊 CONTEXTO:
   • Bajó de plan hace 1 mes → Sensibilidad al precio
   • 2 intentos de cobro fallidos → Problema financiero
   • Ya recibió 3 ofertas → Evitar más spam
   • Zona con 6 competidores → Presión competitiva
   • Solo 2 visitas a la app → Bajo engagement

   💡 RECOMENDACIÓN:
   1. Contacto humano directo (no bot)
   2. Plan de pago flexible
   3. Resaltar ventajas vs competencia
   4. Demo personalizado de funciones"
   ```

🔧 PRÓXIMOS PASOS:
1. Ejecutar este script SQL
2. Actualizar código Java para incluir customer_context
3. Integrar chatbot (Gemini) con las 4 tablas
4. Importar data.csv a las 4 tablas
*/

-- =============================================================================
-- ROLLBACK (En caso de error)
-- =============================================================================

-- Descomenta para revertir:
-- DROP TABLE IF EXISTS customer_context;
-- ALTER TABLE customer_metrics DROP COLUMN tiempo_sesion_promedio;
-- ALTER TABLE customer_metrics DROP COLUMN ultimo_contacto_soporte;

-- =============================================================================
