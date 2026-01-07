from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import pandas as pd
import numpy as np
from pathlib import Path

# ========== CONFIGURACIÓN ==========
app = FastAPI(
    title="RetainAI Prediction Engine XAI",
    description="Microservicio de inferencia con Inteligencia Artificial Explicable",
    version="2.0.0"
)

# ========== CARGA DE MODELOS (Al iniciar el servidor) ==========
MODEL_PATH = Path(__file__).parent.parent / "models" / "champion"

print("🔄 Cargando modelos...")
try:
    model = pickle.load(open(MODEL_PATH / "modelo_inicial_champion.pkl", "rb"))
    transformer = pickle.load(open(MODEL_PATH / "modelo_inicial_onehotencoder.pkl", "rb"))
    print("✅ Modelos cargados exitosamente")
    print(f"   - Modelo: {type(model).__name__}")
    print(f"   - Transformer: {type(transformer).__name__}")
except Exception as e:
    print(f"❌ ERROR al cargar modelos: {e}")
    raise

# ========== MAPEOS XAI ==========
# Mapeo de features técnicas a razones legibles
FEATURE_TO_REASON = {
    "remainder__puntuacion_csates": "Baja Satisfacción (CSAT)",
    "remainder__tickets_de_soporte": "Alta Fricción en Soporte",
    "remainder__cuota_mensual": "Precio Elevado",
    "remainder__meses_permanencia": "Cliente Nuevo (Alta Rotación)",
    "remainder__ultima_coneccion": "Inactividad Reciente",
    "remainder__conecciones_mensuales": "Bajo Uso del Servicio",
    "remainder__errores_de_pago": "Problemas de Facturación",
    "remainder__tiempo_promedio_de_resolucion": "Soporte Lento",
    "remainder__escaladas": "Incidentes Escalados",
    "remainder__puntuacion_nps": "Baja Recomendación (NPS)",
    "onehotencoder__respuesta_de_la_encuesta_Insatisfecho": "Encuesta Negativa",
    "onehotencoder__tipo_de_queja_Tecnico": "Quejas Técnicas Recurrentes",
    "onehotencoder__tipo_contrato_Mensual": "Contrato Sin Compromiso",
}

# Mapeo de razones a acciones concretas
REASON_TO_ACTION = {
    "Baja Satisfacción (CSAT)": "Contactar para soporte prioritario VIP",
    "Alta Fricción en Soporte": "Asignar gestor de cuenta dedicado",
    "Precio Elevado": "Ofrecer descuento 20% por 3 meses",
    "Cliente Nuevo (Alta Rotación)": "Activar programa de onboarding personalizado",
    "Inactividad Reciente": "Campaña de reactivación con incentivo exclusivo",
    "Bajo Uso del Servicio": "Sesión de formación sobre features no utilizadas",
    "Problemas de Facturación": "Revisar métodos de pago y ofrecer alternativas",
    "Soporte Lento": "Priorizar tickets en cola y seguimiento directo",
    "Incidentes Escalados": "Llamada de seguimiento del gerente de operaciones",
    "Baja Recomendación (NPS)": "Encuesta detallada y plan de mejora personalizado",
    "Encuesta Negativa": "Contacto inmediato del equipo de retención",
    "Quejas Técnicas Recurrentes": "Auditoría técnica del servicio del cliente",
    "Contrato Sin Compromiso": "Ofrecer upgrade anual con beneficios adicionales",
}

# Acción por defecto
DEFAULT_ACTION = "Monitorear comportamiento y preparar estrategia de retención"

# ========== DTOs (29 campos completos) ==========
class PredictionInput(BaseModel):
    # CUSTOMER (4)
    genero: str
    edad: int
    ciudad: str
    segmento_de_cliente: str

    # SUBSCRIPTION (9)
    meses_permanencia: int
    canal_de_registro: str
    tipo_contrato: str
    cuota_mensual: float
    ingresos_totales: float
    metodo_de_pago: str
    errores_de_pago: int
    descuento_aplicado: str
    aumento_ultimos_3_meses: str

    # CUSTOMER_METRICS (16)
    conecciones_mensuales: int
    dias_activos_semanales: int
    promedio_coneccion: float
    caracteristicas_usadas: int
    tasa_crecimiento_uso: float
    ultima_coneccion: int
    tickets_de_soporte: int
    tiempo_promedio_de_resolucion: float
    tipo_de_queja: str
    puntuacion_csates: float
    escaladas: int
    tasa_apertura_email: float
    tasa_clics_marketing: float
    puntuacion_nps: int
    respuesta_de_la_encuesta: str
    recuento_de_referencias: int


class PredictionOutput(BaseModel):
    risk: str
    probability: float
    main_factor: str
    next_best_action: str


# ========== ENDPOINTS ==========

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "RetainAI-ML-Engine-XAI",
        "model_type": type(model).__name__,
        "features_expected": 48
    }


@app.post("/predict", response_model=PredictionOutput)
def predict_churn(data: PredictionInput):
    try:
        # 1. Convertir input a DataFrame
        input_dict = data.dict()
        df = pd.DataFrame([input_dict])

        print(f"📥 [INPUT] Cliente: {data.genero}, {data.edad} años, {data.ciudad}")
        print(f"   CSAT: {data.puntuacion_csates}, Tickets: {data.tickets_de_soporte}")

        # 2. Aplicar transformación (OneHotEncoder + Passthrough)
        X_transformed = transformer.transform(df)

        # 3. Predicción
        prediction_class = model.predict(X_transformed)[0]
        probabilities = model.predict_proba(X_transformed)[0]

        prob_no_churn = probabilities[0]
        prob_churn = probabilities[1]

        # 4. Determinar riesgo
        if prob_churn >= 0.70:
            risk_label = "High"
        elif prob_churn >= 0.35:
            risk_label = "Medium"
        else:
            risk_label = "Low"

        # 5. 🧠 XAI: Feature Importance
        importances = model.feature_importances_
        feature_names = transformer.get_feature_names_out()

        # Crear pares (feature, importance)
        feature_importance_pairs = list(zip(feature_names, importances))

        # Ordenar por importancia descendente
        feature_importance_pairs.sort(key=lambda x: x[1], reverse=True)

        # Buscar el top feature que tenga mapeo conocido
        main_factor = "Factor No Clasificado"
        for feat, imp in feature_importance_pairs[:10]:  # Top 10
            if feat in FEATURE_TO_REASON:
                main_factor = FEATURE_TO_REASON[feat]
                print(f"🧠 [XAI] Top Feature: {feat} → {main_factor} (importance: {imp:.4f})")
                break

        # 6. Mapear a acción
        next_best_action = REASON_TO_ACTION.get(main_factor, DEFAULT_ACTION)

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
        raise HTTPException(status_code=500, detail=f"Error en predicción: {str(e)}")