# 📋 Todas las Columnas en tu Base de Datos

## 🎯 Resumen

Tu base de datos `retainai_db` tiene **5 tablas** con un total de **62 columnas únicas**.

---

## 1️⃣ Tabla: CUSTOMERS (17 columnas)

**Propósito:** Información demográfica y geográfica del cliente

| # | Columna | Tipo | Descripción |
|---|---------|------|-------------|
| 1 | `id` 🔑 | VARCHAR | ID único del cliente (PK) |
| 2 | `genero` | VARCHAR | Género del cliente |
| 3 | `edad` | INT | Edad del cliente |
| 4 | `pais` | VARCHAR | País de residencia |
| 5 | `ciudad` | VARCHAR | Ciudad de residencia |
| 6 | `latitud` | DOUBLE | Coordenada geográfica |
| 7 | `longitud` | DOUBLE | Coordenada geográfica |
| 8 | `es_mayor` | INT | Si es mayor de edad (0/1) |
| 9 | `tiene_pareja` | VARCHAR | Si tiene pareja ("Si"/"No") |
| 10 | `tiene_dependientes` | VARCHAR | Si tiene dependientes ("Si"/"No") |
| 11 | `segmento` | VARCHAR | Segmento de cliente (Residencial/PYME/Corporativo) |
| 12 | `ingreso_mediano` | DOUBLE | Ingreso mediano del área |
| 13 | `densidad_poblacional` | DOUBLE | Densidad poblacional del área |
| 14 | `borough` ✨ | VARCHAR | Barrio de NYC (NUEVO) |
| 15 | `codigo_postal` ✨ | VARCHAR | Código postal (NUEVO) |
| 16 | `estado` ✨ | VARCHAR | Estado (NUEVO) |
| 17 | `fecha_registro` ✨ | DATE | Fecha de registro del cliente (NUEVO) |

**Columnas ELIMINADAS:** ❌ borough_risk, high_density_area, income_bracket

---

## 2️⃣ Tabla: SUBSCRIPTIONS (23 columnas)

**Propósito:** Información de suscripción, servicios y contrato

| # | Columna | Tipo | Descripción |
|---|---------|------|-------------|
| 1 | `id` 🔑 | BIGINT | ID único de suscripción (PK) |
| 2 | `customer_id` 🔗 | VARCHAR | ID del cliente (FK) |
| 3 | `tipo_contrato` | VARCHAR | Tipo de contrato (Mensual/Un año/Dos años) |
| 4 | `meses_permanencia` | INT | Antigüedad en meses |
| 5 | `cuota_mensual` | DOUBLE | Cargo mensual |
| 6 | `ingresos_totales` | DOUBLE | Ingresos totales del cliente |
| 7 | `metodo_pago` | VARCHAR | Método de pago |
| 8 | `canal_registro` | VARCHAR | Canal de registro (Web/Tienda/Teléfono) |
| 9 | `errores_pago` | INT | Número de errores de pago |
| 10 | `descuento_aplicado` | VARCHAR | Si tiene descuento aplicado |
| 11 | `aumento_precio_3m` | VARCHAR | Si hubo aumento de precio en últimos 3 meses |
| 12 | `facturacion_sin_papel` | VARCHAR | Facturación electrónica ("Si"/"No") |
| 13 | `servicio_telefono` | VARCHAR | Servicio telefónico ("Si"/"No") |
| 14 | `lineas_multiples` | VARCHAR | Líneas múltiples ("Si"/"No"/"Sin servicio") |
| 15 | `tipo_internet` | VARCHAR | Tipo de internet (Fibra/DSL/No) |
| 16 | `seguridad_online` | VARCHAR | Servicio de seguridad online |
| 17 | `respaldo_online` | VARCHAR | Servicio de respaldo online |
| 18 | `proteccion_dispositivo` | VARCHAR | Protección de dispositivo |
| 19 | `soporte_tecnico` | VARCHAR | Soporte técnico |
| 20 | `streaming_tv` | VARCHAR | Streaming TV |
| 21 | `streaming_peliculas` | VARCHAR | Streaming de películas |
| 22 | `nivel_riesgo` | VARCHAR | Nivel de riesgo (Bajo/Medio/Alto) |
| 23 | `score_riesgo` | DOUBLE | Score de riesgo (0-15) |

**Columnas ELIMINADAS:** ❌ servicios_premium_count, tenure_group, risk_flag

---

## 3️⃣ Tabla: CUSTOMER_METRICS (19 columnas)

**Propósito:** Métricas de comportamiento, satisfacción y engagement

| # | Columna | Tipo | Descripción |
|---|---------|------|-------------|
| 1 | `id` 🔑 | BIGINT | ID único de métricas (PK) |
| 2 | `customer_id` 🔗 | VARCHAR | ID del cliente (FK) |
| 3 | `conecciones_mensuales` | INT | Conexiones mensuales |
| 4 | `dias_activos_semanales` | INT | Días activos por semana |
| 5 | `promedio_coneccion` | FLOAT | Promedio de conexión |
| 6 | `caracteristicas_usadas` | INT | Características usadas |
| 7 | `tasa_crecimiento_uso` | FLOAT | Tasa de crecimiento de uso |
| 8 | `dias_ultima_coneccion` | INT | Días desde última conexión |
| 9 | `tickets_soporte` | INT | Número de tickets de soporte |
| 10 | `tiempo_resolucion` | FLOAT | Tiempo promedio de resolución |
| 11 | `tipo_queja` | VARCHAR | Tipo de queja |
| 12 | `score_csat` | FLOAT | Score CSAT (Customer Satisfaction) |
| 13 | `escaladas_soporte` | INT | Número de escaladas |
| 14 | `tasa_apertura_email` | FLOAT | Tasa de apertura de emails |
| 15 | `tasa_clics` | FLOAT | Tasa de clics en marketing |
| 16 | `score_nps` | INT | Score NPS (Net Promoter Score) |
| 17 | `respuesta_encuesta` | VARCHAR | Respuesta de encuesta |
| 18 | `referencias_hechas` | INT | Referencias hechas |
| 19 | `abandono_historico` | BIT | Si el cliente abandonó (0/1) |

---

## 4️⃣ Tabla: AI_PREDICTIONS (5 columnas)

**Propósito:** Predicciones del modelo de Machine Learning

| # | Columna | Tipo | Descripción |
|---|---------|------|-------------|
| 1 | `id` 🔑 | BIGINT | ID único de predicción (PK) |
| 2 | `customer_id` 🔗 | VARCHAR | ID del cliente (FK) |
| 3 | `probabilidad_fuga` | DOUBLE | Probabilidad de abandono (0-1) |
| 4 | `motivo_principal` | VARCHAR | Motivo principal de riesgo |
| 5 | `fecha_analisis` | TIMESTAMP | Fecha del análisis |

---

## 5️⃣ Tabla: USERS (4 columnas)

**Propósito:** Usuarios del sistema (administradores, analistas)

| # | Columna | Tipo | Descripción |
|---|---------|------|-------------|
| 1 | `id` 🔑 | BIGINT | ID único de usuario (PK) |
| 2 | `email` | VARCHAR | Email del usuario |
| 3 | `password` | VARCHAR | Contraseña (encriptada) |
| 4 | `role` | VARCHAR | Rol del usuario (ADMIN/ANALYST) |

---

## 📊 Resumen por Categoría

### Datos Demográficos (customers):
- Género, edad, país, ciudad
- Es mayor, tiene pareja, tiene dependientes
- Segmento de cliente

### Datos Geográficos (customers):
- Latitud, longitud
- Borough, código postal, estado ✨ NUEVOS
- Ingreso mediano, densidad poblacional

### Datos de Suscripción (subscriptions):
- Tipo de contrato, antigüedad
- Cuota mensual, ingresos totales
- Método de pago, canal de registro
- Errores de pago, descuentos, aumentos de precio

### Servicios Contratados (subscriptions):
- Servicio telefónico, líneas múltiples
- Tipo de internet
- Seguridad online, respaldo online
- Protección de dispositivo, soporte técnico
- Streaming TV, streaming películas

### Métricas de Comportamiento (customer_metrics):
- Conexiones mensuales, días activos
- Promedio de conexión, características usadas
- Tasa de crecimiento de uso
- Días desde última conexión

### Métricas de Soporte (customer_metrics):
- Tickets de soporte, tiempo de resolución
- Tipo de queja, escaladas

### Métricas de Satisfacción (customer_metrics):
- Score CSAT, Score NPS
- Tasa de apertura email, tasa de clics
- Respuesta de encuesta, referencias hechas

### Predicciones ML (ai_predictions):
- Probabilidad de fuga
- Motivo principal
- Fecha de análisis

---

## ✅ Columnas que SÍ están en BD (Originales)

Todas las columnas listadas arriba **SÍ están en tu base de datos** y son **datos originales** que se guardan permanentemente.

## ❌ Columnas que NO están en BD (Calculadas)

Estas columnas **NO están en BD**, solo se calculan en Java cuando las necesitas:

- `borough_risk` → `calculateBoroughRisk()`
- `high_density_area` → `calculateHighDensityArea()`
- `income_bracket` → `calculateIncomeBracket()`
- `servicios_premium_count` → `calculateServiciosPremiumCount()`
- `tenure_group` → `calculateTenureGroup()`
- `risk_flag` → `calculateRiskFlag()`

---

**Total de columnas en BD:** 62  
**Columnas agregadas hoy:** 4 (borough, codigo_postal, estado, fecha_registro)  
**Columnas eliminadas hoy:** 6 (calculadas)  
**Fecha:** 2026-01-18
