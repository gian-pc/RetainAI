-- =============================================================================
-- SCRIPT DE MIGRACIÓN (OPCIONAL): Corregir typos en nombres de columnas
-- =============================================================================
-- Autor: RetainAI Team
-- Fecha: 2026-01-19
-- Objetivo: Corregir 3 typos detectados en la tabla customer_metrics
--
-- TYPOS A CORREGIR:
--   1. conecciones_mensuales → conexiones_mensuales
--   2. promedio_coneccion → promedio_conexion
--   3. dias_ultima_coneccion → dias_ultima_conexion
--
-- ADVERTENCIA: Este script RENOMBRA columnas.
--              Debes actualizar tu código Java después de ejecutarlo.
-- =============================================================================

USE retainai_db;

-- =============================================================================
-- ANTES DE EJECUTAR: Verificar nombres actuales
-- =============================================================================
SELECT
    COLUMN_NAME,
    DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'retainai_db'
  AND TABLE_NAME = 'customer_metrics'
  AND COLUMN_NAME IN (
      'conecciones_mensuales',
      'promedio_coneccion',
      'dias_ultima_coneccion'
  );

-- =============================================================================
-- 1. CORREGIR: conecciones_mensuales → conexiones_mensuales
-- =============================================================================
ALTER TABLE customer_metrics
CHANGE COLUMN conecciones_mensuales conexiones_mensuales INT DEFAULT NULL
COMMENT 'Número de conexiones mensuales del cliente';

-- =============================================================================
-- 2. CORREGIR: promedio_coneccion → promedio_conexion
-- =============================================================================
ALTER TABLE customer_metrics
CHANGE COLUMN promedio_coneccion promedio_conexion FLOAT DEFAULT NULL
COMMENT 'Promedio de tiempo de conexión';

-- =============================================================================
-- 3. CORREGIR: dias_ultima_coneccion → dias_ultima_conexion
-- =============================================================================
ALTER TABLE customer_metrics
CHANGE COLUMN dias_ultima_coneccion dias_ultima_conexion INT DEFAULT NULL
COMMENT 'Días desde la última conexión del cliente';

-- =============================================================================
-- VERIFICACIÓN: Confirmar que los cambios se aplicaron
-- =============================================================================
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'retainai_db'
  AND TABLE_NAME = 'customer_metrics'
  AND COLUMN_NAME IN (
      'conexiones_mensuales',
      'promedio_conexion',
      'dias_ultima_conexion'
  )
ORDER BY ORDINAL_POSITION;

-- Debe mostrar 3 filas con los nombres corregidos

-- =============================================================================
-- CAMBIOS NECESARIOS EN CÓDIGO JAVA
-- =============================================================================
--
-- Archivo: backend/src/main/java/com/retainai/model/CustomerMetrics.java
--
-- ANTES:
-- @Column(name = "conecciones_mensuales")
-- private Integer coneccionesMensuales;
--
-- @Column(name = "promedio_coneccion")
-- private Float promedioConeccion;
--
-- @Column(name = "dias_ultima_coneccion")
-- private Integer diasUltimaConeccion;
--
--
-- DESPUÉS:
-- @Column(name = "conexiones_mensuales")
-- private Integer conexionesMensuales;  // Nombre Java también corregido
--
-- @Column(name = "promedio_conexion")
-- private Float promedioConexion;  // Nombre Java también corregido
--
-- @Column(name = "dias_ultima_conexion")
-- private Integer diasUltimaConexion;  // Nombre Java también corregido
--
-- =============================================================================

-- =============================================================================
-- ROLLBACK (En caso de error)
-- =============================================================================
-- Descomenta para revertir los cambios:

-- ALTER TABLE customer_metrics CHANGE COLUMN conexiones_mensuales conecciones_mensuales INT;
-- ALTER TABLE customer_metrics CHANGE COLUMN promedio_conexion promedio_coneccion FLOAT;
-- ALTER TABLE customer_metrics CHANGE COLUMN dias_ultima_conexion dias_ultima_coneccion INT;

-- =============================================================================
