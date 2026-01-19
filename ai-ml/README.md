# 🤖 RetainAI - Machine Learning Module

## 📊 Dataset Principal

**Archivo:** `data/data.csv`  
**Registros:** 9,701 clientes  
**Columnas:** 67  
**Ubicación:** New York City  
**Estado:** Listo para ETL

---

## 📁 Estructura del Proyecto

```
ai-ml/
├── data/
│   └── data.csv                    # Dataset principal (NYC Telecom)
│
├── notebooks/                      # Notebooks del equipo (PENDIENTE)
│   ├── gian/                       # Pipeline completo de Gian
│   ├── gabriel/                    # Pipeline completo de Gabriel
│   ├── vanessa/                    # Pipeline completo de Vanessa
│   └── ivan/                       # Pipeline completo de Ivan
│
├── outputs/                        # Outputs individuales (PENDIENTE)
│   ├── gian/
│   ├── gabriel/
│   ├── vanessa/
│   └── ivan/
│
├── models/                         # Modelos ML (ACTUAL)
│   └── champion_model.pkl          # Modelo en producción
│
├── src/                            # Código Python reutilizable
│   ├── data_loader.py
│   ├── feature_engineering.py
│   └── model_utils.py
│
├── reports/                        # Reportes generados
│
├── docs/                           # Documentación
│
└── _temp_old_files/                # Archivos antiguos (backup)
```

---

## 🎯 Próximos Pasos

### Fase 1: Crear Estructura de Carpetas
- [ ] Crear carpetas para cada miembro del equipo
- [ ] Crear carpetas de outputs
- [ ] Configurar paths

### Fase 2: Pipeline Individual (Cada Miembro)
Cada persona creará 10 notebooks:
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

### Fase 3: Comparación de Modelos
- Comparar los 4 modelos del equipo
- Seleccionar el mejor
- Deployment

---

## 👥 Equipo de Data Science

- **Gian** - Random Forest / XGBoost
- **Gabriel** - LightGBM / CatBoost
- **Vanessa** - Neural Networks
- **Ivan** - Ensemble Methods

---

## 🗽 Características del Dataset

- **Precios:** Realistas para NYC ($15-$350/mes)
- **Outliers:** 3.5% de casos extremos
- **Valores nulos:** ~10% estratégicos
- **Naming:** 100% snake_case
- **Calidad:** Listo para ETL profesional

---

## 📝 Notas

- Dataset original renombrado de `raw_data_nyc.csv` a `data.csv`
- Archivos antiguos movidos a `_temp_old_files/`
- Modelo actual en producción: `models/champion_model.pkl`

**Fecha de última actualización:** 2026-01-19
