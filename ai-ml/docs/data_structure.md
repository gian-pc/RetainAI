# 📁 Estructura de Datos - RetainAI

## 🎯 Estructura Actual (Limpia)

```
ai-ml/
├── data/
│   ├── data.csv                    # ✅ Dataset principal (compartido, solo lectura)
│   └── original/                   # ✅ Archivos fuente originales
│       ├── Archived_Legally_Operating_Businesses_20240924.csv
│       ├── alura_telecomx_original.json
│       ├── customer_dataset.csv
│       └── retain-data.csv
│
├── notebooks/
│   ├── gian/                       # Notebooks de Gian
│   ├── gabriel/                    # Notebooks de Gabriel
│   ├── vanessa/                    # Notebooks de Vanessa
│   ├── ivan/                       # Notebooks de Ivan
│   └── marcelo/                    # Notebooks de Marcelo
│
└── outputs/                        # ⭐ Cada miembro tiene su propia estructura
    ├── gian/
    │   ├── data/                   # Datasets procesados de Gian
    │   │   ├── data_clean.csv      # Después de Notebook 03
    │   │   ├── data_transformed.csv # Después de Notebook 04
    │   │   └── data_final.csv      # Dataset final para modelado
    │   ├── figures/                # Gráficos y visualizaciones
    │   │   ├── eda/
    │   │   ├── feature_importance/
    │   │   └── model_evaluation/
    │   ├── models/                 # Modelos entrenados
    │   │   ├── model_v1.pkl
    │   │   └── best_model.pkl
    │   └── reports/                # Reportes CSV
    │       ├── 01_collection_report.csv
    │       ├── 02_data_quality_report.csv
    │       └── 03_cleaning_report.csv
    │
    ├── gabriel/
    │   ├── data/
    │   ├── figures/
    │   ├── models/
    │   └── reports/
    │
    ├── vanessa/
    │   ├── data/
    │   ├── figures/
    │   ├── models/
    │   └── reports/
    │
    ├── ivan/
    │   ├── data/
    │   ├── figures/
    │   ├── models/
    │   └── reports/
    │
    └── marcelo/
        ├── data/
        ├── figures/
        ├── models/
        └── reports/
```

---

## 📋 Descripción de Carpetas

### **`data/` (Compartida - Solo Lectura)**

#### `data.csv`
- **Propósito:** Dataset principal del proyecto
- **Registros:** 9,701 clientes
- **Columnas:** 67
- **Ubicación:** New York City
- **⚠️ IMPORTANTE:** NUNCA modificar este archivo

#### `original/`
- **Propósito:** Archivos fuente originales para referencia
- **Contenido:**
  - `Archived_Legally_Operating_Businesses_20240924.csv` - Datos de negocios NYC (281K registros)
  - `alura_telecomx_original.json` - Datos de telecomunicaciones
  - `customer_dataset.csv` - Dataset base de clientes
  - `retain-data.csv` - Dataset histórico

---

### **`notebooks/{nombre}/` (Individual)**

Cada miembro del equipo tiene su carpeta con 10 notebooks:

1. `01_data_collection.ipynb`
2. `02_data_quality.ipynb`
3. `03_data_cleaning.ipynb`
4. `04_data_transformation.ipynb`
5. `05_eda.ipynb`
6. `06_feature_engineering.ipynb`
7. `07_feature_selection.ipynb`
8. `08_model_training.ipynb`
9. `09_model_evaluation.ipynb`
10. `10_model_deployment.ipynb`

---

### **`outputs/{nombre}/` (Individual)**

Cada miembro genera sus propios outputs:

#### `data/`
Datasets procesados en diferentes etapas:
- `data_clean.csv` - Después de limpieza (Notebook 03)
- `data_transformed.csv` - Después de transformación (Notebook 04)
- `data_engineered.csv` - Con features nuevas (Notebook 06)
- `data_final.csv` - Dataset final para modelado (Notebook 07)

#### `figures/`
Visualizaciones organizadas por tipo:
- `eda/` - Análisis exploratorio
  - `01_target_distribution.png`
  - `02_distributions_analysis.png`
  - `02_null_values_analysis.png`
  - `02_outliers_detection.png`
- `feature_importance/` - Importancia de features
- `model_evaluation/` - Evaluación de modelos

#### `models/`
Modelos entrenados:
- `model_v1.pkl` - Primera versión
- `model_v2.pkl` - Versión mejorada
- `best_model.pkl` - Mejor modelo

#### `reports/`
Reportes CSV de cada notebook:
- `01_collection_report.csv`
- `02_data_quality_report.csv`
- `03_cleaning_report.csv`
- `04_transformation_report.csv`
- etc.

---

## 🔄 Flujo de Trabajo

### 1. **Inicio** (Todos usan el mismo dataset)
```python
# En cualquier notebook
DATA_PATH = Path('../../data/data.csv')
df = pd.read_csv(DATA_PATH)
```

### 2. **Procesamiento** (Cada uno guarda en su carpeta)
```python
# Ejemplo para Gian
OUTPUT_PATH = Path('../../outputs/gian')
CLEAN_DATA_PATH = OUTPUT_PATH / 'data'

# Guardar dataset limpio
df_clean.to_csv(CLEAN_DATA_PATH / 'data_clean.csv', index=False)
```

### 3. **Siguiente Notebook** (Usa el output del anterior)
```python
# Notebook 04 usa el output de Notebook 03
CLEAN_DATA_PATH = OUTPUT_PATH / 'data' / 'data_clean.csv'
df = pd.read_csv(CLEAN_DATA_PATH)
```

---

## ⚠️ Reglas Importantes

### ✅ **HACER:**
- Leer de `data/data.csv` (dataset original)
- Guardar todos los outputs en `outputs/{tu_nombre}/`
- Mantener la estructura de subcarpetas (data, figures, models, reports)
- Usar rutas relativas desde el notebook

### ❌ **NO HACER:**
- Modificar `data/data.csv`
- Guardar archivos en carpetas compartidas
- Usar rutas absolutas en los notebooks
- Mezclar outputs de diferentes miembros

---

## 📊 Ejemplo Completo (Gian)

```python
from pathlib import Path
import pandas as pd

# Configuración de rutas
DATA_PATH = Path('../../data/data.csv')
OUTPUT_PATH = Path('../../outputs/gian')

# Crear estructura si no existe
(OUTPUT_PATH / 'data').mkdir(parents=True, exist_ok=True)
(OUTPUT_PATH / 'figures').mkdir(parents=True, exist_ok=True)
(OUTPUT_PATH / 'models').mkdir(parents=True, exist_ok=True)
(OUTPUT_PATH / 'reports').mkdir(parents=True, exist_ok=True)

# Cargar dataset original
df = pd.read_csv(DATA_PATH)

# Procesar...
df_clean = df.copy()
# ... tu código de limpieza ...

# Guardar dataset limpio
df_clean.to_csv(OUTPUT_PATH / 'data' / 'data_clean.csv', index=False)

# Guardar reporte
report.to_csv(OUTPUT_PATH / 'reports' / '03_cleaning_report.csv')

# Guardar figura
plt.savefig(OUTPUT_PATH / 'figures' / 'eda' / 'distribution.png')
```

---

## 🗑️ Carpetas Eliminadas (Sistema Antiguo)

Las siguientes carpetas eran del sistema anterior y fueron eliminadas:

- ❌ `data/clean/` - Ya no se usa (cada miembro tiene su propia carpeta)
- ❌ `data/processed/` - Vacía, eliminada
- ❌ `data/raw/` - Vacía, eliminada

---

## 📝 Checklist para Cada Miembro

Antes de ejecutar tus notebooks, verifica:

- [ ] `OUTPUT_PATH` apunta a `../../outputs/{tu_nombre}`
- [ ] Estructura de subcarpetas creada (data, figures, models, reports)
- [ ] No modificas el dataset original en `data/data.csv`
- [ ] Todos tus outputs van a tu carpeta individual

---

**Última actualización:** 2026-01-19  
**Versión:** 2.0 (Estructura de equipo)
