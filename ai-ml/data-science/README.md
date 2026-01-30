# Data Science - RetainAI ML Training

This directory contains all artifacts related to machine learning model development, training, and experimentation for the RetainAI churn prediction system.

---

## 📂 Directory Structure

```
data-science/
├── notebooks/          # Jupyter notebooks for training and analysis
├── data/              # Training and validation datasets
├── models/            # Trained model files
│   └── champion/      # Production model artifacts
└── outputs/           # Experiment results and reports
```

---

## 📓 Notebooks

**Location:** `notebooks/`

Contains Jupyter notebooks used throughout the machine learning development lifecycle:

- **Data Collection:** Initial data loading and validation
- **Data Quality:** Analysis of missing values, duplicates, outliers
- **Data Cleaning:** Standardization and preprocessing
- **Feature Engineering:** Creation of predictive features
- **EDA:** Exploratory data analysis and insights
- **Model Training:** Training of various ML algorithms
- **Model Evaluation:** Performance metrics and validation
- **Model Selection:** Comparison and champion selection

**Count:** 15 notebooks

---

## 📊 Data

**Location:** `data/`

Contains datasets used for model training and validation:

- **Training Data:** Historical customer data with churn labels
- **Validation Data:** Hold-out sets for model evaluation
- **Test Data:** Final test sets for production readiness

**Format:** CSV files
**Count:** 10 files
**Source:** New York City telecom customer data

---

## 🤖 Models

**Location:** `models/`

Contains serialized machine learning models in pickle format (`.pkl`):

### Champion Model
**Location:** `models/champion/`

The current production model selected through rigorous evaluation:

- **File:** `11_production_pipeline.pkl`
- **Algorithm:** RandomForest with complete preprocessing pipeline
- **Performance:**
  - Accuracy: 95.54%
  - AUC-ROC: 0.9843
  - Precision: 94.2%
  - Recall: 93.8%
  - F1-Score: 94.0%
- **Features:** 23 total (engagement, satisfaction, support, financial, geographic)
- **Pipeline Stages:**
  1. Feature Engineering
  2. Column Selection
  3. Standard Scaling
  4. RandomForest Classifier

### Other Models
Experimental models and previous versions are stored in `models/` for comparison and rollback purposes.

**Count:** 11 model files

---

## 📈 Outputs

**Location:** `outputs/`

Contains results from machine learning experiments:

- **Reports:** JSON and CSV files with model metrics
- **Visualizations:** Performance charts (ROC curves, confusion matrices)
- **Feature Importance:** Analysis of predictive features
- **Experiment Logs:** Training history and hyperparameters

**Count:** 4 files

---

## 🔄 ML Development Workflow

### 1. Data Preparation
```bash
cd notebooks/
jupyter notebook 01_data_collection.ipynb
```

### 2. Model Training
```bash
jupyter notebook 08_model_training.ipynb
```

### 3. Model Evaluation
```bash
jupyter notebook 09_model_evaluation.ipynb
```

### 4. Model Deployment
Copy the best model to `models/champion/`:
```bash
cp outputs/models/best_model.pkl models/champion/11_production_pipeline.pkl
```

---

## 📊 Dataset Information

### Customer Features (23 total)

**Engagement Features:**
- `dias_activos_semanales`: Weekly active days (0-7)
- `conexiones_mensuales`: Monthly connections
- `intensidad_uso`: Usage intensity (calculated)
- `promedio_conexion`: Average connection duration
- `caracteristicas_usadas`: Number of features used
- `tiempo_sesion_promedio`: Average session time
- `tasa_crecimiento_uso`: Usage growth rate

**Satisfaction Features:**
- `puntuacion_nps`: Net Promoter Score (0-100)
- `puntuacion_csat`: Customer Satisfaction Score (1-5)
- `tasa_apertura_email`: Email open rate (0-1)

**Support Features:**
- `tickets_soporte`: Number of support tickets
- `tiempo_resolucion`: Average resolution time (hours)
- `dias_desde_ultimo_contacto`: Days since last contact

**Financial Features:**
- `cargo_mensual`: Monthly charges (USD)
- `ingresos_totales`: Total revenue (USD)
- `ratio_carga_financiera`: Financial load ratio
- `errores_pago`: Payment errors

**Geographic Features:**
- `latitud`: Latitude
- `longitud`: Longitude
- `codigo_postal`: Postal code

**Account Features:**
- `antiguedad`: Account age (months)
- `edad`: Customer age
- `dias_ultima_conexion`: Days since last connection

---

## 🎯 Model Performance Target

For production deployment, models must meet these criteria:

- **Accuracy:** > 90%
- **AUC-ROC:** > 0.90
- **Recall (Churn Class):** > 85%
- **Precision (Churn Class):** > 85%

---

## 📝 Notes

- All models are trained using scikit-learn pipelines
- Models include preprocessing steps (imputation, encoding, scaling)
- Champion model is updated when a new model outperforms it
- Previous champion models are archived with version numbers
- All experiments are documented in notebooks with timestamps

---

## 🔗 Integration with Microservice

The production model in `models/champion/` is loaded by the ML microservice at startup:

**Service Location:** `../src/`
**Model Loader:** `src/infrastructure/ml/model_loader.py`
**Configuration:** `src/shared/config.py` (MODEL_PATH setting)

---

## 👥 Team

This work is part of the RetainAI project for the ChurnInsight Hackathon (Challenge ONE - Oracle + Alura 2025).

---

## 📚 Additional Resources

- **Microservice Documentation:** See `../README.md`
- **API Documentation:** See `../src/` for code documentation
- **Testing:** See `../tests/` for model validation tests
