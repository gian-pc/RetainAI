-- ============================================================================
-- Script: Rollback - Restaurar Columnas Calculadas
-- Fecha: 2026-01-18
-- Descripción: Script de emergencia para restaurar columnas si algo sale mal
-- ============================================================================

USE retainai_db;

-- PASO 1: Restaurar columnas en customers
ALTER TABLE customers 
ADD COLUMN borough_risk DOUBLE NULL,
ADD COLUMN high_density_area INT NULL,
ADD COLUMN income_bracket VARCHAR(50) NULL;

-- PASO 2: Restaurar columnas en subscriptions
ALTER TABLE subscriptions 
ADD COLUMN servicios_premium_count INT NULL,
ADD COLUMN tenure_group VARCHAR(50) NULL,
ADD COLUMN risk_flag INT NULL;

-- PASO 3: Restaurar datos desde backup
UPDATE customers c
JOIN customers_backup_20260118 b ON c.id = b.id
SET c.borough_risk = b.borough_risk,
    c.high_density_area = b.high_density_area,
    c.income_bracket = b.income_bracket;

UPDATE subscriptions s
JOIN subscriptions_backup_20260118 b ON s.id = b.id
SET s.servicios_premium_count = b.servicios_premium_count,
    s.tenure_group = b.tenure_group,
    s.risk_flag = b.risk_flag;

-- PASO 4: Verificar restauración
SELECT 
    COUNT(*) as total,
    COUNT(borough_risk) as con_borough_risk,
    COUNT(high_density_area) as con_high_density,
    COUNT(income_bracket) as con_income_bracket
FROM customers;

SELECT 
    COUNT(*) as total,
    COUNT(servicios_premium_count) as con_servicios_premium,
    COUNT(tenure_group) as con_tenure_group,
    COUNT(risk_flag) as con_risk_flag
FROM subscriptions;

SELECT 'Rollback completado exitosamente' as status;
