-- ============================================================================
-- Script: Agregar Campos Geográficos Faltantes a Customers
-- Fecha: 2026-01-18
-- Descripción: Agrega borough, codigo_postal, estado, fecha_registro
-- ============================================================================

USE retainai_db;

-- Agregar campos geográficos y temporales a customers
ALTER TABLE customers 
ADD COLUMN borough VARCHAR(50) NULL COMMENT 'Barrio de NYC (Manhattan, Brooklyn, Queens, Bronx, Staten Island)',
ADD COLUMN codigo_postal VARCHAR(10) NULL COMMENT 'Código postal (ZIP code)',
ADD COLUMN estado VARCHAR(50) NULL COMMENT 'Estado (ej: NY, NJ, CT)',
ADD COLUMN fecha_registro DATE NULL COMMENT 'Fecha de registro del cliente';

-- Crear índices para búsquedas comunes
CREATE INDEX idx_customers_borough ON customers(borough);
CREATE INDEX idx_customers_codigo_postal ON customers(codigo_postal);
CREATE INDEX idx_customers_fecha_registro ON customers(fecha_registro);

-- Verificar cambios
DESCRIBE customers;

-- Mostrar estadísticas
SELECT 
    'Columnas agregadas exitosamente' as status,
    COUNT(*) as total_customers
FROM customers;
