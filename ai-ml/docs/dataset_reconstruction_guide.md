# 📊 Guía del Dataset Original Limpio - RetainAI

## 🎯 Propósito

Este documento explica el **dataset original limpio** que debe usar el equipo para análisis y desarrollo, **sin contaminación** de features calculados por pipelines de ML.

---

## 📁 Ubicación del Dataset

**Archivo:** [`data/clean/original_dataset_clean.csv`](file:///Users/admin/Desktop/projects/hackathon-oracle/RetainAI/ai-ml/data/clean/original_dataset_clean.csv)

- **Registros:** 10,000 clientes
- **Columnas:** 32 (todas originales)
- **Tamaño:** 1.75 MB
- **Encoding:** UTF-8

---

## ⚠️ ¿Por qué este dataset?

### El Problema

El dataset `retain-data.csv` estaba **contaminado** con 43 columnas de feature engineering calculadas automáticamente por notebooks y pipelines de ML:

- ❌ `retain-data.csv`: **77 columnas** (32 originales + 45 calculadas)
- ✅ `original_dataset_clean.csv`: **32 columnas** (solo originales)

### Columnas Contaminadas Eliminadas

Se eliminaron columnas como:
- `tenure_group`, `income_bracket`, `nps_categoria` (features derivados)
- `ServicioTelefono_Binary`, `LineasMultiples_Binary` (features binarios)
- `Log_ChargesMonthly`, `Sqrt_Tenure` (transformaciones matemáticas)
- `HighRisk_ContractTenure`, `IncomePriceMismatch` (features de interacción)

---

## 📋 Columnas del Dataset (32)

### 1. Identificación
- `cliente_id` - ID único del cliente

### 2. Información Demográfica
- `genero` - Género del cliente (Masculino/Femenino)
- `edad` - Edad del cliente
- `pais` - País de residencia
- `ciudad` - Ciudad de residencia

### 3. Segmentación
- `segmento_de_cliente` - Segmento (Individual/SME/Enterprise)
- `meses_permanencia` - Meses como cliente
- `canal_de_registro` - Canal de registro (Web/Mobile/Tienda)

### 4. Contrato y Servicios
- `tipo_contrato` - Tipo de contrato (Mensual/Anual/Bianual)
- `conecciones_mensuales` - Número de conexiones mensuales
- `dias_activos_semanales` - Días activos por semana
- `promedio_coneccion` - Promedio de tiempo de conexión
- `caracteristicas_usadas` - Número de características usadas
- `tasa_crecimiento_uso` - Tasa de crecimiento de uso
- `ultima_coneccion` - Días desde última conexión

### 5. Facturación
- `cuota_mensual` - Cuota mensual en USD
- `ingresos_totales` - Ingresos totales generados
- `metodo_de_pago` - Método de pago (PayPal/Tarjeta/Transferencia)
- `errores_de_pago` - Número de errores de pago
- `descuento_aplicado` - Si tiene descuento aplicado (Si/No)
- `aumento_ultimos_3_meses` - Si hubo aumento en últimos 3 meses (Si/No)

### 6. Soporte y Satisfacción
- `tickets_de_soporte` - Número de tickets de soporte
- `tiempo_promedio_de_resolucion` - Tiempo promedio de resolución (horas)
- `tipo_de_queja` - Tipo de queja principal
- `puntuacion_csates` - Puntuación CSAT (1-5)
- `escaladas` - Número de escaladas

### 7. Marketing y Engagement
- `tasa_apertura_email` - Tasa de apertura de emails (0-1)
- `tasa_clics_marketing` - Tasa de clics en marketing (0-1)
- `puntuacion_nps` - Puntuación NPS (-100 a 100)
- `respuesta_de_la_encuesta` - Respuesta de encuesta (Satisfecho/Neutral/Insatisfecho)
- `recuento_de_referencias` - Número de referencias hechas

### 8. Variable Objetivo
- `abandonar` - Si el cliente abandonó (0=No, 1=Sí) **← TARGET VARIABLE**

---

## 🔄 Cómo se Reconstruyó

El dataset se reconstruyó usando el script [`scripts/rebuild_clean_dataset.py`](file:///Users/admin/Desktop/projects/hackathon-oracle/RetainAI/ai-ml/scripts/rebuild_clean_dataset.py):

```bash
python3 scripts/rebuild_clean_dataset.py
```

### Archivos Fuente Originales

1. **`data/original/alura_telecomx_original.json`**
   - Datos de telecomunicaciones en formato JSON
   
2. **`data/original/Archived_Legally_Operating_Businesses_20240924.csv`**
   - Datos demográficos y geográficos de NYC (281K registros)
   
3. **`data/raw/customer_dataset.csv`**
   - Dataset principal de clientes (10K registros, 32 columnas)

> **Nota:** El archivo `customer_dataset.csv` ya contiene la unión de los 3 archivos fuente, por lo que es el dataset base limpio.

---

## 💻 Cómo Usar el Dataset

### Cargar en Python

```python
import pandas as pd

# Cargar dataset limpio
df = pd.read_csv('data/clean/original_dataset_clean.csv')

print(f"Registros: {len(df):,}")
print(f"Columnas: {len(df.columns)}")
print(f"\nPrimeras filas:")
print(df.head())

# Verificar variable objetivo
print(f"\nDistribución de Churn:")
print(df['abandonar'].value_counts())
```

### Análisis Exploratorio

```python
# Información general
df.info()

# Estadísticas descriptivas
df.describe()

# Valores nulos
print(df.isnull().sum())

# Distribución de segmentos
print(df['segmento_de_cliente'].value_counts())
```

### Feature Engineering (cuando sea necesario)

Si necesitas crear features calculados para ML, hazlo **dinámicamente** en tu código, NO los guardes en el CSV:

```python
# ✅ CORRECTO: Calcular features en memoria
def create_features(df):
    df = df.copy()
    
    # Crear features derivados
    df['tenure_group'] = pd.cut(df['meses_permanencia'], 
                                 bins=[0, 12, 24, 48, 100],
                                 labels=['0-12', '13-24', '25-48', '49+'])
    
    df['ratio_precio_ingreso'] = df['cuota_mensual'] * 12 / df['ingresos_totales']
    
    return df

# Usar en entrenamiento
df_train = create_features(df)
```

```python
# ❌ INCORRECTO: Guardar features calculados en CSV
df['tenure_group'] = ...
df.to_csv('dataset_with_features.csv')  # NO HACER ESTO
```

---

## 🚫 Datasets a NO Usar

Estos datasets están contaminados con features calculados:

- ❌ `data/processed/retain-data.csv` (77 columnas - CONTAMINADO)
- ❌ `data/processed/01_dataset_clean.csv` (puede tener features calculados)
- ❌ Cualquier CSV con más de 32 columnas

---

## ✅ Validación del Dataset

Para verificar que el dataset está limpio:

```python
import pandas as pd

df = pd.read_csv('data/clean/original_dataset_clean.csv')

# Verificar número de columnas
assert len(df.columns) == 32, "Dataset contaminado: más de 32 columnas"

# Verificar que no haya columnas calculadas
calculated_patterns = ['_Binary', 'Log_', 'Sqrt_', 'tenure_group', 'income_bracket']
for col in df.columns:
    for pattern in calculated_patterns:
        assert pattern not in col, f"Columna calculada encontrada: {col}"

print("✅ Dataset limpio validado correctamente")
```

---

## 🔄 Re-generar el Dataset

Si necesitas re-generar el dataset limpio:

```bash
cd ai-ml
python3 scripts/rebuild_clean_dataset.py
```

Esto creará un nuevo `data/clean/original_dataset_clean.csv` desde los archivos fuente.

---

## 📞 Soporte

Si tienes dudas sobre el dataset:

1. Revisa este documento
2. Verifica que estás usando `data/clean/original_dataset_clean.csv`
3. Confirma que el dataset tiene exactamente 32 columnas
4. Consulta con el equipo de ML si necesitas crear features calculados

---

**Última actualización:** 2026-01-18  
**Versión del dataset:** 1.0  
**Registros:** 10,000 clientes  
**Columnas:** 32 (todas originales)
