# RetainAI - Motor de IA (Python)

Servicio de Machine Learning para predicción de churn con explicabilidad avanzada (XAI).

## 📁 Estructura del Proyecto

```
ai-ml/
├── data/                          # Datos del proyecto
│   ├── original/                  # Dataset original del hackathon
│   ├── raw/                       # Datos sin procesar (NYC business data, etc.)
│   └── processed/                 # Datasets procesados por cada notebook
│       ├── 01_dataset_clean.csv
│       ├── 02_dataset_enriched_nyc.csv
│       ├── 04_dataset_engineered.csv
│       └── 04_features_metadata.json
│
├── models/                        # Modelos entrenados
│   ├── champion/                  # Modelo en Producción
│   │   ├── logistic_regression.pkl
│   │   ├── scaler.pkl
│   │   ├── label_encoder.pkl
│   │   └── metadata.json
│   ├── candidates/                # Modelos alternativos
│   │   └── random_forest.pkl
│   └── training_metadata.json
│
├── notebooks/                     # Pipeline de Data Science
│   ├── 01_data_quality_analysis.ipynb
│   ├── 02_data_enrichment_nyc.ipynb
│   ├── 03_eda_correlations.ipynb
│   ├── 04_feature_engineering.ipynb
│   └── 05_model_training.ipynb
│
├── reports/                       # Reportes y visualizaciones
│   ├── figures/                   # Gráficos generados (PNGs)
│   ├── 05_feature_importance.csv
│   └── 05_model_comparison.csv
│
├── src/                           # Código fuente de la API
│   └── main.py                    # FastAPI application
│
├── requirements.txt               # Dependencias Python
├── Dockerfile                     # Container para OCI
└── .gitignore                     # Archivos ignorados por Git
```

## 🚀 Setup Local

### 1. Crear entorno virtual
```bash
python3 -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
```

### 2. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 3. Ejecutar API
```bash
uvicorn src.main:app --reload --port 8000
```

## 📊 Pipeline de Data Science

El pipeline sigue una metodología profesional con 5 notebooks secuenciales:

| Notebook | Descripción | Output |
|----------|-------------|--------|
| **01** | Análisis de calidad de datos | `01_dataset_clean.csv` |
| **02** | Enriquecimiento con datos NYC | `02_dataset_enriched_nyc.csv` |
| **03** | EDA, correlaciones y VIF | Visualizaciones + insights |
| **04** | Feature Engineering | `04_dataset_engineered.csv` |
| **05** | Entrenamiento de modelos | Modelos `.pkl` + métricas |

## 🏆 Modelo Campeón

- **Algoritmo**: Logistic Regression
- **AUC (Validación)**: 0.9088
- **F1-Score**: 0.694
- **Overfitting**: 0.3% (excelente generalización)

**Artifacts en `models/champion/`:**
- `logistic_regression.pkl` - Modelo entrenado
- `scaler.pkl` - StandardScaler para features numéricos
- `label_encoder.pkl` - Encoder para variable target
- `metadata.json` - Hiperparámetros y métricas

## 🔗 Integración con Backend Java

La API FastAPI (puerto 8000) se comunica con el backend Spring Boot (puerto 8080) mediante:

**Endpoint**: `POST /predict`

**Input** (datos crudos desde BD):
```json
{
  "city": "New York",
  "monthly_charges": 79.99,
  "tenure": 12,
  "internet_type": "Fiber Optic",
  "contract_type": "Month-to-Month",
  ...
}
```

**Output** (respuesta enriquecida con XAI):
```json
{
  "risk": "High",
  "probability": 0.85,
  "main_factor": "Precio Alto",
  "next_best_action": "Ofrecer Descuento"
}
```

## 📦 Deployment (OCI)

El servicio está dockerizado y listo para desplegarse en **OCI Container Instances**.

```bash
docker build -t retainai-ml .
docker run -p 8000:8000 retainai-ml
```

## 📄 Licencia

Proyecto desarrollado para Challenge ONE - Oracle + Alura 2025
