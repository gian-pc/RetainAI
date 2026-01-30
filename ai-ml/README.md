# RetainAI - ML Prediction Microservice

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Python](https://img.shields.io/badge/python-3.9+-green)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-teal)
![License](https://img.shields.io/badge/license-MIT-orange)

Microservicio de Machine Learning para predicción de churn de clientes con explicabilidad (XAI) integrada. Construido con **Clean Architecture** y principios **SOLID** para el Hackathon ChurnInsight - Challenge ONE (Oracle + Alura 2025).

---

## 🚀 Características

- ✅ **Predicciones en tiempo real** con modelo RandomForest (95.54% accuracy, AUC-ROC 0.9843)
- ✅ **Explicabilidad (XAI)** con factores principales y acciones recomendadas
- ✅ **Clean Architecture** con 6 capas bien definidas
- ✅ **Logging estructurado** con niveles y colores
- ✅ **Healthcheck mejorado** con métricas del sistema (CPU, memoria, uptime)
- ✅ **Tests automatizados** con pytest (unit + integration)
- ✅ **Docker optimizado** multi-stage para OCI Container Instances
- ✅ **Production-ready** con validación de datos y manejo de errores

---

## 🏗️ Arquitectura del Microservicio (Clean Architecture)

```
┌──────────────────────────────────────────────────────────────────┐
│                    HTTP Request (POST /predict)                  │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   API Layer (FastAPI)   │
                    │  - health_controller    │
                    │  - prediction_router    │
                    └────────────┬────────────┘
                                 │ calls
                    ┌────────────▼─────────────┐
                    │  Application Layer       │
                    │  - PredictionService     │ ◄─── Business Logic
                    │  - ExplanationService    │
                    └─────┬──────────────┬─────┘
                          │              │
                    uses  │              │ uses
                          │              │
            ┌─────────────▼──┐      ┌───▼──────────────┐
            │  Domain Layer  │      │ Infrastructure   │
            │  - Prediction  │      │  - ModelLoader   │ ◄─── ML Pipeline
            │  - RiskLevel   │      │  - FeatureEngin. │
            │  - Customer    │      │  - Transformers  │
            └────────────────┘      └──────────────────┘
                    │                        │
                    │                        │ loads
                    │                        │
            ┌───────▼────────┐      ┌────────▼─────────────────┐
            │  Schemas       │      │   Trained Model (.pkl)   │
            │  - Request DTO │      │  RandomForest Pipeline   │
            │  - Response DTO│      │  - Imputer → Encoder     │
            └────────────────┘      │  - Scaler → Model        │
                                    └──────────────────────────┘
                    │
            ┌───────▼────────┐
            │  Shared        │
            │  - Config      │ ◄─── Settings & Constants
            │  - Logger      │
            │  - Exceptions  │
            └────────────────┘

Flujo de una Predicción:
1. POST /predict → API Layer valida request con Pydantic
2. API llama PredictionService.predict(data)
3. PredictionService carga modelo via ModelLoader
4. Infrastructure ejecuta pipeline: FeatureEngineer → Model
5. Domain Layer clasifica riesgo (High/Medium/Low)
6. ExplanationService genera main_factor y next_best_action
7. Response DTO serializa y retorna JSON
```

**Principios SOLID aplicados:**
- **SRP:** Cada clase tiene una sola responsabilidad (PredictionService solo predice)
- **OCP:** Extensible sin modificar código (nuevos modelos via interface)
- **DIP:** Dependencias invertidas (Services dependen de abstracciones)

---

## 📦 Estructura del Proyecto

```
ai-ml/
├── src/                        # Código fuente del microservicio
│   ├── application/services/   # Prediction + Explanation services
│   ├── domain/                 # Entities + Value Objects
│   ├── infrastructure/ml/      # Model loader + Feature engineering
│   ├── schemas/                # DTOs (request/response)
│   ├── shared/                 # Config, logger, exceptions
│   └── main.py                 # Entry point (215 líneas)
├── tests/                      # Tests (unit + integration)
├── data-science/              # Artefactos de ML (notebooks, datos, modelos)
│   ├── notebooks/             # Jupyter notebooks de entrenamiento
│   ├── data/                  # Datasets
│   ├── models/champion/       # Modelo de producción
│   └── outputs/               # Resultados de experimentos
├── Dockerfile                  # Multi-stage optimized
├── docker-compose.yml          # Local orchestration
├── pytest.ini                  # Test configuration
└── requirements.txt            # Dependencias Python
```

---

## 🔧 Instalación

### Opción 1: Desarrollo Local

```bash
cd ai-ml
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn src.main:app --reload --port 8000
```

### Opción 2: Docker

```bash
docker build -t retainai-ml:latest .
docker run -p 8000:8000 retainai-ml:latest
```

### Opción 3: Docker Compose

```bash
docker-compose up -d
```

---

## 📡 API Endpoints

### `GET /health`
Health check con métricas del sistema.

**Response:**
```json
{
  "status": "healthy",
  "uptime_seconds": 1234.56,
  "model": { "loaded": true },
  "system": {
    "cpu_percent": 15.2,
    "memory": { "used_mb": 245.8, "percent": 12.3 }
  }
}
```

### `POST /predict`
Predicción de churn para un cliente.

**Request:**
```json
{
  "dias_activos_semanales": 5,
  "promedio_conexion": 12.5,
  "puntuacion_nps": 75.0,
  ... (23 features total)
}
```

**Response:**
```json
{
  "probability": 0.23,
  "main_factor": "Conexiones al mes: 45",
  "next_best_action": "Mantener comunicación regular"
}
```

**Risk Levels:**
- `< 0.25`: Bajo | `0.25-0.40`: Medio | `> 0.40`: Alto

### `POST /predict/batch`
Predicción por lotes.

### `GET /features`
Lista de 23 features requeridos.

**API Docs:** http://localhost:8000/docs

---

## 🧪 Testing

```bash
source .venv/bin/activate

# Run todos los tests
pytest

# Con coverage
pytest --cov=src --cov-report=html

# Solo unitarios
pytest tests/unit/ -v
```

**Target:** >70% coverage

---

## 📊 Modelo ML

**Pipeline:** `data-science/models/champion/11_production_pipeline.pkl`

```
FeatureEngineer → ColumnSelector → StandardScaler → RandomForest
```

**Performance:**
- Accuracy: 95.54%
- AUC-ROC: 0.9843
- 23 features (engagement, satisfaction, support, financial, geographic)

---

## 🐳 Despliegue en Oracle Cloud

```bash
# Build
docker build -t retainai-ml:2.0.0 .

# Tag para OCI Registry
docker tag retainai-ml:2.0.0 <region>.ocir.io/<tenancy>/retainai-ml:2.0.0

# Push
docker push <region>.ocir.io/<tenancy>/retainai-ml:2.0.0

# Deploy con OCI Container Instances
oci container-instances create \
  --image <region>.ocir.io/<tenancy>/retainai-ml:2.0.0 \
  --shape CI.Standard.E4.Flex
```

---

## 📝 Logging

```python
from src.shared.logger import logger

logger.info("Model loaded")
logger.error("Prediction failed", exc_info=True)
```

Colored console output con niveles: DEBUG, INFO, WARNING, ERROR, CRITICAL

---

## 🛠 Troubleshooting

**Modelo no carga:**
```bash
ls -lh data-science/models/champion/11_production_pipeline.pkl
```

**Puerto ocupado:**
```bash
uvicorn src.main:app --port 8001
```

**Tests fallan:**
```bash
rm -rf .pytest_cache __pycache__
pip install --force-reinstall -r requirements.txt
```

---

## 🎯 Roadmap Post-Hackathon

- [ ] Autenticación JWT
- [ ] Rate limiting
- [ ] Métricas Prometheus
- [ ] CI/CD GitHub Actions
- [ ] A/B testing de modelos

---

## 👤 Autores

**RetainAI Team** - Hackathon ChurnInsight 2025

---

**¿Preguntas?** Abre un issue en el repositorio.
