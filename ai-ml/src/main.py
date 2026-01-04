from fastapi import FastAPI
from pydantic import BaseModel
import time

# PyCharm detectará que esto es una FastAPI App y te activará herramientas especiales
app = FastAPI(
    title="RetainAI Prediction Engine",
    description="Microservicio de inferencia para predecir Churn",
    version="1.0.0"
)


# --- DTOs (Data Transfer Objects) ---
class PredictionInput(BaseModel):
    edad: int
    genero: str
    meses_permanencia: int
    cuota_mensual: float
    total_tickets: int
    score_csat: int
    uso_promedio: float


class PredictionOutput(BaseModel):
    risk: str
    probability: float
    reason: str


# --- Endpoints ---

@app.get("/")
def health_check():
    return {"status": "online", "service": "RetainAI-ML-Engine"}


@app.post("/predict", response_model=PredictionOutput)
def predict_churn(data: PredictionInput):
    # Log para ver en consola que llegó la petición
    print(f"📥 [FASTAPI] Analizando cliente: {data.genero}, {data.edad} años")

    # --- LÓGICA MOCK (Simulando IA) ---
    risk_score = 0.10
    risk_label = "Low"
    reason_text = "Comportamiento estable"

    # Regla 1: Cliente enojado
    if data.score_csat <= 3 and data.total_tickets > 2:
        risk_score = 0.85
        risk_label = "High"
        reason_text = "Fricción en soporte y baja satisfacción"

    # Regla 2: Nuevo y caro
    elif data.meses_permanencia < 6 and data.cuota_mensual > 60:
        risk_score = 0.65
        risk_label = "Medium"
        reason_text = "Cliente nuevo con cuota alta"

    # Regla 3: No lo usa
    elif data.uso_promedio < 5.0:
        risk_score = 0.55
        risk_label = "Medium"
        reason_text = "Baja utilización del servicio"

    time.sleep(0.2)  # Simular latencia

    print(f"🧠 [AI] Predicción: {risk_label} ({risk_score})")

    return {
        "risk": risk_label,
        "probability": round(risk_score, 2),
        "reason": reason_text
    }