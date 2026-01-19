# 📖 Diccionario de Datos - RetainAI

**Dataset:** `data/data.csv`  
**Última Actualización:** 2026-01-19

---

## 📋 Resumen
Este dataset contiene información detallada sobre **9,701 clientes** de una empresa de telecomunicaciones en **New York City**. Se utiliza para predecir la cancelación del servicio (Churn) y analizar el comportamiento del cliente.

---

## 👤 Información del Cliente (Demográfica)

| Variable | Descripción | Tipo de Dato | Ejemplo |
|----------|-------------|--------------|---------|
| `cliente_id` | Identificador único del cliente | String | `7590-VHVEG` |
| `genero` | Género del cliente | Categórico | `Masculino`, `Femenino` |
| `edad` | Edad del cliente en años | Numérico | `45` |
| `tiene_pareja` | Si el cliente tiene pareja | Binario | `Si`, `No` |
| `tiene_dependientes` | Si el cliente tiene dependientes económicos | Binario | `Si`, `No` |
| `es_mayor` | Si el cliente es mayor de 65 años | Binario (0/1) | `0`, `1` |

---

## 📍 Ubicación Geográfica

| Variable | Descripción | Tipo de Dato | Ejemplo |
|----------|-------------|--------------|---------|
| `pais` | País de residencia | String | `United States` |
| `estado` | Estado de residencia | String | `New York` |
| `ciudad` | Ciudad de residencia | String | `New York` |
| `codigo_postal` | Código postal del cliente | Numérico | `10025` |
| `latitud` | Latitud geográfica | Numérico | `40.7128` |
| `longitud` | Longitud geográfica | Numérico | `-74.0060` |
| `borough` | Distrito de NYC | Categórico | `Manhattan`, `Queens` |
| `densidad_poblacional` | Habitantes por milla cuadrada en su zona | Numérico | `27000` |

---

## 📡 Servicios Contratados

| Variable | Descripción | Tipo de Dato | Ejemplo |
|----------|-------------|--------------|---------|
| `servicio_telefono` | Si tiene servicio de telefonía fija | Binario | `Si`, `No` |
| `lineas_multiples` | Si tiene múltiples líneas telefónicas | Categórico | `Si`, `No`, `Sin servicio` |
| `tipo_internet` | Tipo de conexión a internet | Categórico | `Fibra óptica`, `DSL`, `No` |
| `seguridad_online` | Servicio de seguridad/antivirus | Categórico | `Si`, `No` |
| `respaldo_online` | Servicio de backup en la nube | Categórico | `Si`, `No` |
| `proteccion_dispositivo` | Seguro de protección de equipos | Categórico | `Si`, `No` |
| `soporte_tecnico` | Servicio de soporte técnico premium | Categórico | `Si`, `No` |
| `streaming_tv` | Servicio de TV por streaming | Categórico | `Si`, `No` |
| `streaming_peliculas` | Servicio de películas por streaming | Categórico | `Si`, `No` |

---

## 💰 Facturación y Contrato

| Variable | Descripción | Tipo de Dato | Ejemplo |
|----------|-------------|--------------|---------|
| `antiguedad` | Meses que el cliente ha estado con la empresa | Numérico | `12` |
| `tipo_contrato` | Duración del contrato | Categórico | `Mensual`, `Un año`, `Dos años` |
| `metodo_pago` | Método de pago utilizado | Categórico | `Tarjeta de crédito`, `Cheque electrónico` |
| `facturacion_sin_papel` | Si recibe factura digital | Binario | `Si`, `No` |
| `cargo_mensual` | Monto cobrado mensualmente ($) | Numérico | `75.50` |
| `ingresos_totales` | Total cobrado durante toda la antigüedad ($) | Numérico | `850.00` |
| `fecha_registro` | Fecha de inicio del servicio | Fecha | `2024-01-15` |
| `fecha_ultimo_pago` | Fecha del último pago registrado | Fecha | `2026-01-01` |
| `errores_pago` | Número de fallos en el procesamiento de pagos | Numérico | `0`, `1` |
| `aumento_precio_3m` | Si hubo aumento de precio en últimos 3 meses | Binario | `Si`, `No` |
| `descuento_aplicado` | Tipo de descuento que tiene el cliente | Categórico | `Ninguno`, `Estudiante` |

---

## 📊 Comportamiento y Riesgo (ML Features)

| Variable | Descripción | Tipo de Dato | Ejemplo |
|----------|-------------|--------------|---------|
| `tickets_soporte` | Número de tickets de soporte abiertos | Numérico | `3` |
| `escaladas` | Número de veces que escaló un problema | Numérico | `1` |
| `conexiones_mensuales` | Promedio de conexiones/logins al mes | Numérico | `45` |
| `dias_activos_semanales` | Promedio de días de uso por semana | Numérico | `5.5` |
| `dias_ultima_conexion` | Días desde la última conexión | Numérico | `2` |
| `nivel_riesgo` | Clasificación de riesgo (Calculado) | Categórico | `Alto`, `Medio`, `Bajo` |
| `score_riesgo` | Puntaje numérico de riesgo (0-100) | Numérico | `75.5` |
| `segmento_cliente` | Segmentación comercial | Categórico | `Residencial`, `PyME`, `Corporativo` |

---

## 🎯 Variable Objetivo (Target)

| Variable | Descripción | Tipo de Dato | Valores |
|----------|-------------|--------------|---------|
| `cancelacion` | Si el cliente canceló el servicio (Churn) | Binario (0/1) | `1` (Si canceló), `0` (No canceló) |

---
