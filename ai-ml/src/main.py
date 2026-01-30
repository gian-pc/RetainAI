"""
RetainAI - ML Prediction Microservice (REFACTORED with Clean Architecture)

Punto de entrada del microservicio de predicción de churn.
Usa arquitectura limpia con separación de capas.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import sys
import time
import psutil
from datetime import datetime

# Shared layer
from src.shared.config import settings
from src.shared.logger import logger
from src.shared.exceptions import (
    PredictionError,
    ModelNotLoadedException,
    MLServiceException
)

# Infrastructure layer
from src.infrastructure.ml.model_loader import ModelLoader

# Application layer
from src.application.services.prediction_service import PredictionService
from src.application.services.explanation_service import ExplanationService

# Schemas (DTOs)
from src.schemas.request import PredictionInput
from src.schemas.response import PredictionOutput, BatchPredictionOutput

# Domain layer
from src.domain.entities.prediction import Prediction


# ========== APP INITIALIZATION ==========
app = FastAPI(
    title=settings.APP_NAME,
    description="Microservicio de predicción de churn usando Machine Learning",
    version=settings.VERSION
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ========== SERVICES INITIALIZATION ==========
# Singletons de servicios
prediction_service = PredictionService()
explanation_service = ExplanationService(prediction_service)

# Track service start time for uptime calculation
_start_time = time.time()


# ========== STARTUP/SHUTDOWN EVENTS ==========
@app.on_event("startup")
def load_model():
    """Carga el modelo ML al iniciar la aplicación"""
    try:
        logger.info(f"Loading model from: {settings.MODEL_PATH}")
        model_loader = ModelLoader()
        model_loader.load(settings.MODEL_PATH)
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load model: {e}", exc_info=True)
        raise


# ========== API ENDPOINTS ==========

@app.get("/")
def root():
    """Health check simple"""
    return {
        "service": "RetainAI ML Prediction Engine",
        "version": settings.VERSION,
        "status": "running"
    }


@app.get("/health")
def health():
    """
    Health check detallado con métricas del sistema.

    Returns:
        - status: Estado general del servicio
        - uptime: Tiempo activo del servicio en segundos
        - timestamp: Timestamp actual ISO 8601
        - model: Información del modelo ML
        - system: Métricas del sistema (CPU, memoria, disco)
    """
    model_loader = ModelLoader()

    # Calculate uptime
    uptime_seconds = time.time() - _start_time

    # Get system metrics
    process = psutil.Process()
    memory_info = process.memory_info()

    return {
        "status": "healthy",
        "uptime_seconds": round(uptime_seconds, 2),
        "timestamp": datetime.now().isoformat(),
        "version": settings.VERSION,
        "model": {
            "loaded": model_loader.is_loaded,
            "info": model_loader.get_info() if model_loader.is_loaded else None
        },
        "system": {
            "cpu_percent": psutil.cpu_percent(interval=0.1),
            "memory": {
                "used_mb": round(memory_info.rss / 1024 / 1024, 2),
                "percent": round(process.memory_percent(), 2)
            },
            "disk_percent": psutil.disk_usage('/').percent
        }
    }


@app.get("/features")
def get_features():
    """Obtiene información sobre los features del modelo"""
    model_loader = ModelLoader()

    if not model_loader.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded"
        )

    return {
        "features": model_loader.feature_names,
        "total_features": len(model_loader.feature_names) if model_loader.feature_names else 0
    }


@app.post("/predict", response_model=PredictionOutput)
def predict_churn(data: PredictionInput):
    """
    Predice la probabilidad de churn para un cliente.

    Args:
        data: Datos del cliente (23 features)

    Returns:
        PredictionOutput con probabilidad, factor principal y acción recomendada

    Raises:
        HTTPException: Si ocurre error en la predicción
    """
    try:
        # 1. Hacer predicción
        probability, _ = prediction_service.predict_single(data)

        # 2. Generar explicación (XAI)
        main_factor, next_best_action = explanation_service.explain(
            probability,
            data
        )

        # 3. Retornar respuesta
        return PredictionOutput(
            probability=float(probability),
            main_factor=main_factor,
            next_best_action=next_best_action
        )

    except ModelNotLoadedException as e:
        raise HTTPException(status_code=503, detail=str(e))
    except PredictionError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )


@app.post("/predict/batch")
def predict_churn_batch(customers: List[PredictionInput]):
    """
    Predice churn para múltiples clientes (batch).

    Args:
        customers: Lista de datos de clientes

    Returns:
        Lista de predicciones

    Raises:
        HTTPException: Si ocurre error en la predicción
    """
    try:
        # 1. Hacer predicciones batch
        results = prediction_service.predict_batch(customers)

        # 2. Generar explicaciones para cada uno
        predictions = []
        for i, (probability, _) in enumerate(results):
            customer_data = customers[i]

            main_factor, next_best_action = explanation_service.explain(
                probability,
                customer_data
            )

            predictions.append(
                PredictionOutput(
                    probability=float(probability),
                    main_factor=main_factor,
                    next_best_action=next_best_action
                )
            )

        return {
            "total_processed": len(customers),
            "predictions": predictions
        }

    except ModelNotLoadedException as e:
        raise HTTPException(status_code=503, detail=str(e))
    except PredictionError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )


# ========== MAIN ==========
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.API_HOST,
        port=settings.API_PORT
    )
