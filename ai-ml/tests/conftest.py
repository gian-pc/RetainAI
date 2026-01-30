"""
Pytest configuration and shared fixtures
"""

import pytest
from pathlib import Path
from typing import Dict, Any

from src.schemas.request import PredictionInput


@pytest.fixture
def sample_customer_data() -> Dict[str, Any]:
    """
    Sample customer data for testing predictions.
    Returns a dictionary with valid customer features.
    """
    return {
        "dias_activos_semanales": 5,
        "promedio_conexion": 12.5,
        "conexiones_mensuales": 45,
        "caracteristicas_usadas": 8,
        "dias_ultima_conexion": 2,
        "intensidad_uso": 2.25,
        "tickets_soporte": 3,
        "puntuacion_nps": 75.0,
        "tasa_crecimiento_uso": 5.2,
        "puntuacion_csat": 4.2,
        "ratio_carga_financiera": 0.02,
        "tasa_apertura_email": 0.65,
        "errores_pago": 0,
        "antiguedad": 24,
        "ingresos_totales": 5000.0,
        "latitud": 40.7128,
        "cargo_mensual": 89.99,
        "tiempo_resolucion": 12.5,
        "longitud": -74.0060,
        "codigo_postal": "10001",
        "edad": 35,
        "dias_desde_ultimo_contacto": 45,
        "tiempo_sesion_promedio": 25.3
    }


@pytest.fixture
def sample_prediction_input(sample_customer_data) -> PredictionInput:
    """
    Sample PredictionInput DTO for testing.
    """
    return PredictionInput(**sample_customer_data)


@pytest.fixture
def high_risk_customer_data() -> Dict[str, Any]:
    """
    High-risk customer data for testing (expected churn probability > 50%).
    """
    return {
        "dias_activos_semanales": 1,
        "promedio_conexion": 5.0,
        "conexiones_mensuales": 5,
        "caracteristicas_usadas": 2,
        "dias_ultima_conexion": 15,
        "intensidad_uso": 0.5,
        "tickets_soporte": 10,
        "puntuacion_nps": 20.0,
        "tasa_crecimiento_uso": -15.5,
        "puntuacion_csat": 1.5,
        "ratio_carga_financiera": 0.08,
        "tasa_apertura_email": 0.1,
        "errores_pago": 5,
        "antiguedad": 36,
        "ingresos_totales": 1200.0,
        "latitud": 40.7128,
        "cargo_mensual": 95.99,
        "tiempo_resolucion": 72.0,
        "longitud": -74.0060,
        "codigo_postal": "10001",
        "edad": 55,
        "dias_desde_ultimo_contacto": 5,
        "tiempo_sesion_promedio": 8.5
    }


@pytest.fixture
def low_risk_customer_data() -> Dict[str, Any]:
    """
    Low-risk customer data for testing (expected churn probability < 25%).
    """
    return {
        "dias_activos_semanales": 7,
        "promedio_conexion": 45.0,
        "conexiones_mensuales": 120,
        "caracteristicas_usadas": 15,
        "dias_ultima_conexion": 0,
        "intensidad_uso": 4.5,
        "tickets_soporte": 0,
        "puntuacion_nps": 95.0,
        "tasa_crecimiento_uso": 15.5,
        "puntuacion_csat": 5.0,
        "ratio_carga_financiera": 0.01,
        "tasa_apertura_email": 0.95,
        "errores_pago": 0,
        "antiguedad": 48,
        "ingresos_totales": 10000.0,
        "latitud": 40.7128,
        "cargo_mensual": 75.99,
        "tiempo_resolucion": 8.0,
        "longitud": -74.0060,
        "codigo_postal": "10001",
        "edad": 35,
        "dias_desde_ultimo_contacto": 90,
        "tiempo_sesion_promedio": 45.5
    }


@pytest.fixture
def model_path() -> Path:
    """
    Path to the production model file.
    """
    return Path(__file__).parent.parent / "models" / "champion" / "11_production_pipeline.pkl"
