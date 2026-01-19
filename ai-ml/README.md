# 🤖 RetainAI - Machine Learning Module

## 📊 Dataset Principal

**Archivo:** `data/data.csv`  
**Registros:** 9,701 clientes  
**Columnas:** 67  
**Ubicación:** New York City  
**Diccionario de Datos:** [Ver detalle completo en docs/data_dictionary.md](docs/data_dictionary.md)  
**Estado:** ✅ Limpio y Procesado

---

## 📁 Estructura del Proyecto

```
ai-ml/
├── data/
│   └── data.csv                    # Dataset principal (NYC Telecom)
│
├── notebooks/                      # Pipelines de ML
│   ├── gian/                       # 🚧 EN PROCESO (Fase Feature Eng.)
│   ├── gabriel/                    # (Pendiente)
│   ├── vanessa/                    # (Pendiente)
│   ├── ivan/                       # (Pendiente)
│   └── marcelo/                    # (Pendiente)
│
├── outputs/                        # Resultados Individuales
│   └── gian/
│       ├── data/                   # Datasets procesados (clean, engineered)
│       ├── figures/                # Gráficos (EDA, Model Performance)
│       ├── models/                 # Modelos entrenados
│       └── reports/                # Reportes técnicos del pipeline
│
├── reports/                        # Resultados Consolidados (Negocio)
│   ├── bi_insights.json            # Insights para Business Intelligence
│   ├── roi_analysis.json           # Análisis de Retorno de Inversión
│   └── figures/                    # Gráficos ejecutivos
│
├── models/                         # Modelos Finales
│   └── champion_model.pkl          # Modelo actual en producción
│
└── docs/                           # Documentación
    ├── data_structure.md           # Guía de estructura de carpetas
    └── data_dictionary.md          # Diccionario de variables
```

---

## 🚀 Estado del Proyecto

### ✅ Fase 1: Setup & Data Access
- Estructura de carpetas creada y validada
- Acceso centralizado a `data/data.csv`
- Documentación inicial (`data_structure.md`)

### 🚧 Fase 2: Desarrollo de Pipelines (Actual)

#### Pipeline de Gian
- [x] **01 Collection:** Carga y validación inicial
- [x] **02 Quality:** Análisis de nulos, duplicados y outliers
- [x] **03 Cleaning:** Limpieza y estandarización
- [x] **04 Transformation:** Encoding y escalado
- [x] **05 EDA:** Análisis exploratorio profundo & Insights
- [x] **06 Feature Engineering:** Creación de variables predictivas
- [ ] **07 Feature Selection:** Selección de inputs clave
- [ ] **08 Training:** Entrenamiento de modelos
- [ ] **09 Evaluation:** Validación cruzada y métricas
- [ ] **10 Deployment:** Preparación para producción

---

## 👥 Equipo de Data Science

- **Gian**
- **Gabriel**
- **Vanessa**
- **Ivan**
- **Marcelo**

---

## 🗽 Características del Dataset

- **Precios:** Realistas para NYC ($15-$350/mes)
- **Churn Rate:** ~16.5% (Realista para Telecom)
- **Segmentos:** Residencial, PyME, Corporativo
- **Riesgo:** Score calculado de 0-100 con alta predictibilidad
- **Calidad:** 100% snake_case, sin duplicados

---

## 📝 Notas Técnicas

- **Entorno:** Python 3.11+
- **Librerías Clave:** Pandas, Scikit-learn, XGBoost, Seaborn
- **Tracking:** Todos los experimentos de Gian se guardan en `outputs/gian/reports/`

**Fecha de última actualización:** 2026-01-19
