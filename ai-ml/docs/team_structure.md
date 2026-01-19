# 👥 Estructura de Carpetas del Equipo

## 📋 Miembros del Equipo

- **Gian**
- **Gabriel**
- **Vanessa**
- **Ivan**
- **Marcelo**

---

## 📁 Estructura Individual

Cada miembro del equipo tiene su propia estructura de carpetas para evitar conflictos:

```
ai-ml/
├── data/
│   └── data.csv                    # ⚠️ COMPARTIDO - Dataset original (solo lectura)
│
├── notebooks/
│   ├── gian/                       # Notebooks de Gian
│   ├── gabriel/                    # Notebooks de Gabriel
│   ├── vanessa/                    # Notebooks de Vanessa
│   ├── ivan/                       # Notebooks de Ivan
│   └── marcelo/                    # Notebooks de Marcelo
│
└── outputs/
    ├── gian/
    │   ├── data/                   # ✅ data_clean.csv de Gian
    │   ├── figures/                # ✅ Gráficos de Gian
    │   ├── models/                 # ✅ Modelos de Gian
    │   └── reports/                # ✅ Reportes de Gian
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

## 🎯 Rutas Correctas en los Notebooks

### ❌ **INCORRECTO** (Causa conflictos)
```python
# NO usar rutas compartidas
CLEAN_DATA_PATH = Path('../../data/clean')
```

### ✅ **CORRECTO** (Cada miembro en su carpeta)
```python
# Ejemplo para Gian
OUTPUT_PATH = Path('../../outputs/gian')
CLEAN_DATA_PATH = OUTPUT_PATH / 'data'

# Guardar dataset limpio
df_clean.to_csv(CLEAN_DATA_PATH / 'data_clean.csv', index=False)
```

### ✅ **Ejemplo para otros miembros**
```python
# Gabriel
OUTPUT_PATH = Path('../../outputs/gabriel')

# Vanessa
OUTPUT_PATH = Path('../../outputs/vanessa')

# Ivan
OUTPUT_PATH = Path('../../outputs/ivan')

# Marcelo
OUTPUT_PATH = Path('../../outputs/marcelo')
```

---

## 📊 Archivos que Genera Cada Miembro

### En `outputs/{nombre}/data/`
- `data_clean.csv` - Dataset después de limpieza (Notebook 03)
- `data_transformed.csv` - Dataset transformado (Notebook 04)
- `data_engineered.csv` - Con features nuevas (Notebook 06)
- `data_final.csv` - Dataset final para modelado (Notebook 07)

### En `outputs/{nombre}/figures/`
- `eda/` - Gráficos de análisis exploratorio
- `feature_importance/` - Importancia de features
- `model_evaluation/` - Gráficos de evaluación

### En `outputs/{nombre}/models/`
- `model_v1.pkl` - Primer modelo
- `model_v2.pkl` - Modelo mejorado
- `best_model.pkl` - Mejor modelo

### En `outputs/{nombre}/reports/`
- `01_collection_report.csv`
- `02_data_quality_report.csv`
- `03_cleaning_report.csv`
- `04_transformation_report.csv`
- etc.

---

## 🔧 Corrección para Notebook 03

**Cambio necesario en `03_data_cleaning.ipynb`:**

```python
# ANTES (líneas 75-78)
DATA_PATH = Path('../../data/data.csv')
OUTPUT_PATH = Path('../../outputs/gian')
CLEAN_DATA_PATH = Path('../../data/clean')  # ❌ INCORRECTO

# DESPUÉS
DATA_PATH = Path('../../data/data.csv')
OUTPUT_PATH = Path('../../outputs/gian')
CLEAN_DATA_PATH = OUTPUT_PATH / 'data'  # ✅ CORRECTO
```

---

## ⚠️ Importante

1. **Dataset original (`data/data.csv`)**: Solo lectura, NUNCA modificar
2. **Outputs individuales**: Cada miembro guarda en `outputs/{su_nombre}/`
3. **No compartir archivos procesados**: Cada uno genera sus propios archivos
4. **Comparación final**: Se hará en la Fase 3 comparando los modelos de cada uno

---

## 📝 Checklist para Cada Miembro

- [ ] Verificar que `OUTPUT_PATH` apunte a tu carpeta
- [ ] Todos los archivos guardados en `outputs/{tu_nombre}/`
- [ ] No modificar el dataset original en `data/data.csv`
- [ ] Mantener la misma estructura de subcarpetas (data, figures, models, reports)

---

**Última actualización:** 2026-01-19
