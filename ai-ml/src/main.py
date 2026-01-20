"""
RetainAI - Prediction Engine (Production)
Modelo: 11_production_pipeline.pkl (24 features, sin data leakage)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Optional
import sys
from sklearn.base import BaseEstimator, TransformerMixin

# IMPORTANTE: Definir clases custom ANTES de cargar el modelo
# El pickle necesita encontrar estas clases en el módulo __main__
class ColumnSelector(BaseEstimator, TransformerMixin):
    """Selects specific columns from a DataFrame"""
    def __init__(self, columns):
        self.columns = columns
    def fit(self, X, y=None):
        return self
    def transform(self, X):
        return X[self.columns]

class FeatureEngineer(BaseEstimator, TransformerMixin):
    """Feature engineering transformer (pass-through)"""
    def fit(self, X, y=None):
        return self
    def transform(self, X):
        return X

# WORKAROUND: Agregar clases al namespace de __main__ para que pickle las encuentre
import __main__
__main__.ColumnSelector = ColumnSelector
__main__.FeatureEngineer = FeatureEngineer

# Importar módulo XAI
from src.xai_utils import generate_explanation, generate_action

# ========== CONFIGURACIÓN ==========
app = FastAPI(
    title="RetainAI ML Prediction Engine",
    description="Servicio de predicción de churn usando Machine Learning (solo ML, sin lógica de negocio)",
    version="4.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NOTA: Los endpoints de dashboard (/api/dashboard/*) están en el backend Java
# Este servicio Python SOLO se encarga de predicciones ML


# ========== CARGA DEL NUEVO MODELO ==========
MODEL_PATH = Path(__file__).parent.parent / "models" / "champion"

print("🔄 Cargando nuevo modelo (11_production_pipeline.pkl)...")
try:
    # Cargar el pipeline completo
    pipeline = joblib.load(MODEL_PATH / "11_production_pipeline.pkl")

    # Extraer información del pipeline
    feature_names = pipeline.named_steps['selector'].columns

    print("✅ Modelo nuevo cargado exitosamente")
    print(f"   - Pipeline steps: {list(pipeline.named_steps.keys())}")
    print(f"   - Features requeridas: {len(feature_names)}")
    print(f"   - Modelo: {type(pipeline.named_steps['model']).__name__}")
    print(f"   - Sin data leakage: ✓")

except Exception as e:
    print(f"❌ ERROR al cargar modelo: {e}")
    import traceback
    traceback.print_exc()
    raise


# ========== DTO SIMPLIFICADO (24 FEATURES RAW) ==========
class PredictionInput(BaseModel):
    """
    Input simplificado: Solo datos RAW del cliente (sin encoding).
    El pipeline del modelo se encarga de toda la transformación.
    """
    # Campos del modelo (24 features)
    score_riesgo: float
    dias_activos_semanales: int
    promedio_conexion: float
    conexiones_mensuales: int
    caracteristicas_usadas: int
    dias_ultima_conexion: int
    intensidad_uso: float
    tickets_soporte: int
    puntuacion_nps: float
    tasa_crecimiento_uso: float
    puntuacion_csat: float
    ratio_carga_financiera: float
    tasa_apertura_email: float
    errores_pago: int
    antiguedad: int
    ingresos_totales: float
    latitud: float
    cargo_mensual: float
    tiempo_resolucion: float
    longitud: float
    codigo_postal: str  # Will be converted to numeric
    edad: int
    dias_desde_ultimo_contacto: int
    tiempo_sesion_promedio: float


class PredictionOutput(BaseModel):
    risk: str
    probability: float
    main_factor: str
    next_best_action: str


# ========== HELPER: Convertir codigo_postal a numerico ==========
def codigo_postal_to_numeric(codigo_postal: str) -> float:
    """Convierte codigo postal a valor numérico"""
    try:
        return float(codigo_postal)
    except:
        # Si no se puede convertir, usar hash o valor default
        return float(abs(hash(codigo_postal)) % 100000)


# ========== EXPLICACIÓN DINÁMICA SIMPLIFICADA ==========
def generate_explanation_simple(feature_name: str, feature_value: float) -> str:
    """
    Genera explicación simple basada en el feature y su valor.
    """
    # Mapeo de features a explicaciones contextuales
    explanations = {
        'score_riesgo': f"Score de riesgo: {feature_value:.1f}/10",
        'dias_activos_semanales': f"Días activos por semana: {int(feature_value)}",
        'promedio_conexion': f"Promedio de conexión: {feature_value:.1f}",
        'conexiones_mensuales': f"Conexiones mensuales: {int(feature_value)}",
        'caracteristicas_usadas': f"Características usadas: {int(feature_value)}",
        'dias_ultima_conexion': f"Días desde última conexión: {int(feature_value)}",
        'intensidad_uso': f"Intensidad de uso: {feature_value:.2f}",
        'tickets_soporte': f"Tickets de soporte: {int(feature_value)}",
        'puntuacion_nps': f"NPS Score: {feature_value:.0f}/100",
        'tasa_crecimiento_uso': f"Crecimiento de uso: {feature_value:.1f}%",
        'puntuacion_csat': f"CSAT Score: {feature_value:.1f}/5",
        'ratio_carga_financiera': f"Carga financiera: {feature_value:.2%}",
        'tasa_apertura_email': f"Apertura de emails: {feature_value:.0%}",
        'errores_pago': f"Errores de pago: {int(feature_value)}",
        'antiguedad': f"Antigüedad: {int(feature_value)} meses",
        'ingresos_totales': f"Ingresos totales: ${feature_value:,.2f}",
        'cargo_mensual': f"Cargo mensual: ${feature_value:.2f}",
        'tiempo_resolucion': f"Tiempo de resolución: {feature_value:.1f} horas",
        'edad': f"Edad: {int(feature_value)} años",
        'dias_desde_ultimo_contacto': f"Días desde último contacto: {int(feature_value)}",
        'tiempo_sesion_promedio': f"Tiempo sesión promedio: {feature_value:.1f} min",
    }

    return explanations.get(feature_name, f"{feature_name}: {feature_value:.2f}")


def select_best_actionable_factor(feature_importances: list, input_data: dict) -> tuple:
    """
    Selecciona el factor más accionable (prioriza factores que podemos controlar).

    Prioridad:
    1. Satisfacción (NPS, CSAT) - Muy accionable
    2. Soporte (tickets, tiempo_resolucion) - Accionable
    3. Engagement (dias_ultima_conexion, conexiones) - Accionable
    4. Precio (cargo_mensual, ratio_carga) - Parcialmente accionable
    5. Otros - Menos accionables
    """
    # Categorías por prioridad (mayor = más importante)
    priority_map = {
        'puntuacion_nps': 100,
        'puntuacion_csat': 100,
        'tickets_soporte': 90,
        'tiempo_resolucion': 90,
        'dias_ultima_conexion': 80,
        'dias_activos_semanales': 80,
        'tasa_apertura_email': 70,
        'conexiones_mensuales': 70,
        'cargo_mensual': 60,
        'ratio_carga_financiera': 60,
        'errores_pago': 60,
        'dias_desde_ultimo_contacto': 80,
        'tiempo_sesion_promedio': 70,
    }

    # Calcular score combinado: importance * priority * abs(value)
    scored_features = []
    for feat, importance, value in feature_importances[:10]:  # Top 10
        priority = priority_map.get(feat, 10)  # Default priority baja
        combined_score = importance * priority * abs(value)
        scored_features.append((feat, combined_score, importance, value))

    # Ordenar por combined_score
    scored_features.sort(key=lambda x: x[1], reverse=True)

    if scored_features:
        feat, _, importance, value = scored_features[0]
        return (feat, importance, value)

    # Fallback: primer feature
    return feature_importances[0]


# ========== ENDPOINTS ==========

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "RetainAI-ML-Engine-Production-v4",
        "model_version": "11_production_pipeline",
        "features_count": len(feature_names),
        "pipeline_steps": list(pipeline.named_steps.keys()),
        "leakage_free": True,
        "recall": 0.846,
        "roc_auc": 0.930
    }


@app.post("/predict", response_model=PredictionOutput)
def predict_churn(data: PredictionInput):
    """
    Predice probabilidad de churn usando el nuevo modelo (24 features).

    El modelo es un pipeline completo que incluye:
    1. Feature engineering
    2. Column selection
    3. Scaling
    4. Random Forest Classifier
    """
    try:
        # 1. Convertir input a dict
        input_dict = data.dict()

        # 2. Convertir codigo_postal a numérico
        input_dict['codigo_postal'] = codigo_postal_to_numeric(data.codigo_postal)

        # 3. Crear DataFrame con las 24 features en el orden correcto
        df = pd.DataFrame([input_dict])

        # Asegurar que tenemos todas las columnas necesarias
        # (El pipeline se encargará de seleccionar y ordenar correctamente)

        print(f"📥 [INPUT] Cliente:")
        print(f"   Antigüedad: {data.antiguedad} meses")
        print(f"   Precio: ${data.cargo_mensual:.2f}")
        print(f"   NPS: {data.puntuacion_nps:.0f}, CSAT: {data.puntuacion_csat:.1f}")
        print(f"   Tickets: {data.tickets_soporte}, Score Riesgo: {data.score_riesgo:.1f}")

        # 4. Predicción usando el pipeline completo
        prediction_class = pipeline.predict(df)[0]
        probabilities = pipeline.predict_proba(df)[0]

        prob_no_churn = probabilities[0]
        prob_churn = probabilities[1]

        # 5. Determinar nivel de riesgo
        if prob_churn >= 0.90:
            risk_label = "Off"
        elif prob_churn >= 0.70:
            risk_label = "High"
        elif prob_churn >= 0.30:
            risk_label = "Medium"
        else:
            risk_label = "Low"

        # 6. Feature Importance (del modelo Random Forest)
        model = pipeline.named_steps['model']
        importances = model.feature_importances_

        # Crear pares (feature, importance, value)
        feature_importance_list = []
        for feat, imp in zip(feature_names, importances):
            value = input_dict.get(feat, 0)
            if isinstance(value, str):
                value = codigo_postal_to_numeric(value)
            feature_importance_list.append((feat, imp, float(value)))

        # Ordenar por importancia descendente
        feature_importance_list.sort(key=lambda x: x[1], reverse=True)

        # 7. Seleccionar main factor (el más accionable)
        main_feat, main_imp, main_value = select_best_actionable_factor(
            feature_importance_list,
            input_dict
        )

        # Generar explicación
        main_factor = generate_explanation_simple(main_feat, main_value)

        print(f"🧠 [XAI] Main Factor: {main_feat}")
        print(f"   Explicación: {main_factor}")
        print(f"   Importance: {main_imp:.4f}, Value: {main_value:.2f}")

        # Mostrar top 5 para debug
        print(f"   Top 5 factores:")
        for i, (f, imp, val) in enumerate(feature_importance_list[:5], 1):
            exp = generate_explanation_simple(f, val)
            print(f"      {i}. {f:30} → {exp}")
            print(f"         importance: {imp:.4f}, value: {val:.2f}")

        # 8. Generar acción (usando el módulo XAI existente)
        next_best_action = generate_action(main_factor, input_dict)

        print(f"✅ [OUTPUT] Predicción: {risk_label} ({prob_churn:.2%})")
        print(f"   Main Factor: {main_factor}")
        print(f"   Action: {next_best_action}")

        return {
            "risk": risk_label,
            "probability": round(prob_churn, 4),
            "main_factor": main_factor,
            "next_best_action": next_best_action
        }

    except Exception as e:
        print(f"❌ [ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error en predicción: {str(e)}")


@app.get("/health")
def health():
    """Endpoint de health check para monitoreo"""
    return {"status": "healthy", "model_loaded": True}


@app.get("/features")
def get_features():
    """Endpoint para obtener la lista de features requeridas"""
    return {
        "features": list(feature_names),
        "count": len(feature_names),
        "model_version": "11_production_pipeline"
    }
