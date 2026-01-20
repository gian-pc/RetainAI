-- =============================================================================
-- SCRIPT DE MIGRACIÓN: Agregar campos faltantes para el nuevo modelo
-- =============================================================================
-- Autor: RetainAI Team
-- Fecha: 2026-01-19
-- Objetivo: Agregar los 2 campos CRÍTICOS necesarios para el nuevo modelo
--
-- CAMPOS A AGREGAR:
--   1. tiempo_sesion_promedio (customer_metrics) - Feature #24 del modelo
--   2. ultimo_contacto_soporte (customer_metrics) - Para calcular dias_desde_ultimo_contacto
--
-- IMPORTANTE: Este script es SEGURO, solo agrega columnas (no elimina ni modifica)
-- =============================================================================

USE retainai_db;

-- =============================================================================
-- 1. AGREGAR: tiempo_sesion_promedio
-- =============================================================================
-- Feature #24 del nuevo modelo
-- Representa el tiempo promedio de sesión del cliente en minutos

ALTER TABLE customer_metrics
ADD COLUMN tiempo_sesion_promedio FLOAT DEFAULT NULL
COMMENT 'Tiempo promedio de sesión en minutos (Feature del modelo ML)';

-- =============================================================================
-- 2. AGREGAR: ultimo_contacto_soporte
-- =============================================================================
-- Necesario para calcular el feature: dias_desde_ultimo_contacto
-- Es la fecha del último contacto con soporte técnico

ALTER TABLE customer_metrics
ADD COLUMN ultimo_contacto_soporte DATE DEFAULT NULL
COMMENT 'Fecha del último contacto con soporte (para calcular feature dias_desde_ultimo_contacto)';

-- =============================================================================
-- VERIFICACIÓN
-- =============================================================================
-- Ejecuta estas queries para verificar que las columnas se agregaron correctamente

-- Verificar estructura de customer_metrics
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'retainai_db'
  AND TABLE_NAME = 'customer_metrics'
  AND COLUMN_NAME IN ('tiempo_sesion_promedio', 'ultimo_contacto_soporte')
ORDER BY ORDINAL_POSITION;

-- Contar registros con valores NULL (esperado: todos NULL después de la migración)
SELECT
    COUNT(*) AS total_registros,
    SUM(CASE WHEN tiempo_sesion_promedio IS NULL THEN 1 ELSE 0 END) AS null_tiempo_sesion,
    SUM(CASE WHEN ultimo_contacto_soporte IS NULL THEN 1 ELSE 0 END) AS null_ultimo_contacto
FROM customer_metrics;

-- =============================================================================
-- ROLLBACK (En caso de error o necesidad de revertir)
-- =============================================================================
-- Descomenta las siguientes líneas si necesitas revertir los cambios:

-- ALTER TABLE customer_metrics DROP COLUMN tiempo_sesion_promedio;
-- ALTER TABLE customer_metrics DROP COLUMN ultimo_contacto_soporte;

-- =============================================================================
-- NOTAS ADICIONALES
-- =============================================================================
--
-- 1. VALORES NULL:
--    • Ambas columnas permiten NULL porque son datos históricos que pueden no existir
--    • Para nuevos clientes, deberás poblarlas desde el CSV o tu aplicación
--
-- 2. IMPORTACIÓN DE CSV:
--    • Cuando importes data.csv, ahora podrás mapear directamente:
--      tiempo_sesion_promedio → customer_metrics.tiempo_sesion_promedio
--      ultimo_contacto_soporte → customer_metrics.ultimo_contacto_soporte
--
-- 3. TYPOS EN LA BD (Opcional - Para corrección futura):
--    • conecciones_mensuales → debería ser conexiones_mensuales
--    • promedio_coneccion → debería ser promedio_conexion
--    • dias_ultima_coneccion → debería ser dias_ultima_conexion
--
--    Si quieres corregirlos, ejecuta: migration_fix_typos.sql (archivo separado)
--
-- 4. CAMPOS OPCIONALES:
--    • El nuevo modelo NO necesita estos 10 campos del CSV:
--      - cambio_plan_reciente
--      - competidores_area
--      - dias_mora
--      - downgrade_reciente
--      - features_nuevas_usadas
--      - fecha_ultimo_pago
--      - intentos_cobro_fallidos
--      - ofertas_recibidas
--      - precio_vs_mercado
--      - visitas_app_mensual
--
--    • RECOMENDACIÓN: NO los agregues a la BD por ahora
--    • Si los necesitas en el futuro, crea una tabla separada: customer_analytics
--
-- =============================================================================
