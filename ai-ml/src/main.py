from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Optional

# ========== CONFIGURACIÓN ==========
app = FastAPI(
    title="RetainAI Prediction Engine (Production)",
    description="Motor de predicción de churn con modelo limpio (sin data leakage)",
    version="3.0.0"
)

# ========== CARGA DE MODELO LIMPIO ==========
MODEL_PATH = Path(__file__).parent.parent / "models" / "champion_clean"

print("🔄 Cargando modelo production-ready...")
try:
    model = joblib.load(MODEL_PATH / "model_champion.pkl")
    scaler = joblib.load(MODEL_PATH / "scaler.pkl")
    model_columns = joblib.load(MODEL_PATH / "model_columns.pkl")

    print("✅ Modelo limpio cargado exitosamente")
    print(f"   - Modelo: {type(model).__name__}")
    print(f"   - Features: {len(model_columns)}")
    print(f"   - Sin data leakage: ✓")
except Exception as e:
    print(f"❌ ERROR al cargar modelo: {e}")
    raise

# ========== MAPEOS XAI (Features Limpias) ==========
# Mapeo de features técnicas a razones de negocio
FEATURE_TO_REASON = {
    # Top causas del modelo limpio
    "score_riesgo": "Cliente de Alto Riesgo",
    "TipoContrato_Mensual": "Contrato Sin Compromiso",
    "Antiguedad": "Cliente Nuevo (Alta Rotación)",
    "nivel_riesgo_Medio": "Perfil de Riesgo Medio",
    "nivel_riesgo_Alto": "Perfil de Riesgo Alto",
    "CargosTotal": "Acumulado de Pagos Elevado",
    "CargoMensual": "Precio Mensual Alto",
    "TipoInternet_Fibra óptica": "Servicio Premium Costoso",
    "tenure_group_0-12 meses": "Periodo de Prueba Crítico",
    "tenure_group_13-24 meses": "Cliente en Segundo Año",
    "servicios_premium_count": "Pocos Servicios Adicionales",
    "TipoContrato_Un año": "Contrato Anual",
    "TipoContrato_Dos años": "Contrato Largo Plazo",
    "IngresoMediano": "Zona de Bajo Ingreso",
    "DensidadPoblacional": "Área de Alta Competencia",
}

# Mapeo de razones a acciones concretas
REASON_TO_ACTION = {
    "Cliente de Alto Riesgo": "Asignar gestor de cuenta dedicado + revisión completa",
    "Contrato Sin Compromiso": "Ofrecer upgrade a contrato anual con 20% descuento",
    "Cliente Nuevo (Alta Rotación)": "Programa de onboarding personalizado + seguimiento",
    "Perfil de Riesgo Medio": "Monitoreo activo + campaña de fidelización",
    "Perfil de Riesgo Alto": "Intervención inmediata del equipo de retención",
    "Acumulado de Pagos Elevado": "Revisar historial y ofrecer plan de lealtad",
    "Precio Mensual Alto": "Evaluar bundle de servicios con mejor relación precio/valor",
    "Servicio Premium Costoso": "Ofrecer servicios adicionales sin costo extra",
    "Periodo de Prueba Crítico": "Contacto proactivo + incentivos de permanencia",
    "Cliente en Segundo Año": "Renovación anticipada con beneficios exclusivos",
    "Pocos Servicios Adicionales": "Demostración de features premium gratuita",
    "Contrato Anual": "Preparar renovación con 3 meses de anticipación",
    "Contrato Largo Plazo": "Programa VIP de lealtad",
    "Zona de Bajo Ingreso": "Planes ajustados a capacidad de pago",
    "Área de Alta Competencia": "Diferenciación con servicio superior",
}

DEFAULT_ACTION = "Monitorear comportamiento y preparar estrategia de retención"

# ========== DTOs (SOLO FEATURES LIMPIAS) ==========
class PredictionInput(BaseModel):
    """
    Input para predicción con SOLO features disponibles ANTES del churn.
    NO requiere NPS, CSAT, tickets de soporte (esos son síntomas, no causas).
    """
    # Demográficos
    Genero: str  # "Masculino" o "Femenino"
    EsMayor: int  # 0 o 1
    TienePareja: str  # "Si" o "No"
    TieneDependientes: str  # "Si" o "No"

    # Geográficos
    IngresoMediano: float
    DensidadPoblacional: float
    borough_risk: float
    high_density_area: int  # 0 o 1

    # Servicios
    ServicioTelefono: str  # "Si" o "No"
    LineasMultiples: str  # "Si", "No", "Sin servicio"
    TipoInternet: str  # "DSL", "Fibra óptica", "No"
    SeguridadOnline: str  # "Si", "No", "No internet service"
    RespaldoOnline: str  # "Si", "No", "No internet service"
    ProteccionDispositivo: str  # "Si", "No", "No internet service"
    SoporteTecnico: str  # "Si", "No", "No internet service"
    StreamingTV: str  # "Si", "No", "No internet service"
    StreamingPeliculas: str  # "Si", "No", "No internet service"
    servicios_premium_count: int

    # Contrato
    TipoContrato: str  # "Mensual", "Un año", "Dos años"
    FacturacionSinPapel: str  # "Si" o "No"
    MetodoPago: str  # "Cheque electrónico", "Cheque por correo", "Transferencia bancaria", "Tarjeta de crédito"
    Antiguedad: int
    tenure_group: str  # "0-12 meses", "13-24 meses", "25-48 meses", "49+ meses"

    # Financiero
    CargoMensual: float
    CargosTotal: float

    # Segmento
    SegmentoCliente: str  # "Residencial", "PYME", "Corporativo"
    income_bracket: str  # "Low", "Medium", "High"

    # Features derivados limpios
    nivel_riesgo: str  # "Bajo", "Medio", "Alto"
    score_riesgo: float
    risk_flag: int  # 0 o 1


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
        "service": "RetainAI-ML-Engine-Production",
        "model_type": type(model).__name__,
        "model_version": "clean_v1",
        "features_count": len(model_columns),
        "leakage_free": True,
        "f1_score": 0.64,
        "roc_auc": 0.86
    }


@app.post("/predict", response_model=PredictionOutput)
def predict_churn(data: PredictionInput):
    """
    Predice probabilidad de churn usando SOLO features limpias.

    No requiere:
    - PuntuacionNPS
    - PuntuacionCSAT
    - TicketsSoporte
    - TasaAperturaEmail
    - Etc.

    Funciona con datos básicos del cliente disponibles al momento de la suscripción.
    """
    try:
        # 1. Convertir input a DataFrame
        input_dict = data.dict()
        df = pd.DataFrame([input_dict])

        print(f"📥 [INPUT] Cliente:")
        print(f"   Contrato: {data.TipoContrato}, Antiguedad: {data.Antiguedad} meses")
        print(f"   Precio: ${data.CargoMensual}, Score Riesgo: {data.score_riesgo}")

        # 2. Crear DataFrame con TODAS las columnas del modelo inicializadas en 0
        df_encoded = pd.DataFrame(0, index=[0], columns=model_columns, dtype=float)

        # 3. Llenar features numéricos directamente
        numeric_features = ['EsMayor', 'IngresoMediano', 'DensidadPoblacional', 'Antiguedad',
                           'CargoMensual', 'CargosTotal', 'score_riesgo',
                           'servicios_premium_count', 'risk_flag', 'borough_risk', 'high_density_area']

        for feat in numeric_features:
            if feat in input_dict:
                df_encoded.loc[0, feat] = input_dict[feat]

        # 4. Encoding manual de categóricos (basado en las columnas del modelo)
        # Genero
        if data.Genero == "Masculino" and "Genero_Masculino" in model_columns:
            df_encoded.loc[0, "Genero_Masculino"] = 1

        # TienePareja
        if data.TienePareja == "Si" and "TienePareja_Si" in model_columns:
            df_encoded.loc[0, "TienePareja_Si"] = 1

        # TieneDependientes
        if data.TieneDependientes == "Si" and "TieneDependientes_Si" in model_columns:
            df_encoded.loc[0, "TieneDependientes_Si"] = 1

        # ServicioTelefono
        if data.ServicioTelefono == "Si" and "ServicioTelefono_Si" in model_columns:
            df_encoded.loc[0, "ServicioTelefono_Si"] = 1

        # LineasMultiples
        if data.LineasMultiples == "Si" and "LineasMultiples_Si" in model_columns:
            df_encoded.loc[0, "LineasMultiples_Si"] = 1
        elif data.LineasMultiples == "Sin servicio" and "LineasMultiples_Sin servicio" in model_columns:
            df_encoded.loc[0, "LineasMultiples_Sin servicio"] = 1

        # TipoInternet
        if data.TipoInternet == "Fibra óptica" and "TipoInternet_Fibra óptica" in model_columns:
            df_encoded.loc[0, "TipoInternet_Fibra óptica"] = 1
        elif data.TipoInternet == "No" and "TipoInternet_No" in model_columns:
            df_encoded.loc[0, "TipoInternet_No"] = 1

        # SeguridadOnline
        if data.SeguridadOnline == "Si" and "SeguridadOnline_Si" in model_columns:
            df_encoded.loc[0, "SeguridadOnline_Si"] = 1
        elif data.SeguridadOnline == "No internet service" and "SeguridadOnline_No internet service" in model_columns:
            df_encoded.loc[0, "SeguridadOnline_No internet service"] = 1

        # RespaldoOnline
        if data.RespaldoOnline == "Si" and "RespaldoOnline_Si" in model_columns:
            df_encoded.loc[0, "RespaldoOnline_Si"] = 1
        elif data.RespaldoOnline == "No internet service" and "RespaldoOnline_No internet service" in model_columns:
            df_encoded.loc[0, "RespaldoOnline_No internet service"] = 1

        # ProteccionDispositivo
        if data.ProteccionDispositivo == "Si" and "ProteccionDispositivo_Si" in model_columns:
            df_encoded.loc[0, "ProteccionDispositivo_Si"] = 1
        elif data.ProteccionDispositivo == "No internet service" and "ProteccionDispositivo_No internet service" in model_columns:
            df_encoded.loc[0, "ProteccionDispositivo_No internet service"] = 1

        # SoporteTecnico
        if data.SoporteTecnico == "Si" and "SoporteTecnico_Si" in model_columns:
            df_encoded.loc[0, "SoporteTecnico_Si"] = 1
        elif data.SoporteTecnico == "No internet service" and "SoporteTecnico_No internet service" in model_columns:
            df_encoded.loc[0, "SoporteTecnico_No internet service"] = 1

        # StreamingTV
        if data.StreamingTV == "Si" and "StreamingTV_Si" in model_columns:
            df_encoded.loc[0, "StreamingTV_Si"] = 1
        elif data.StreamingTV == "No internet service" and "StreamingTV_No internet service" in model_columns:
            df_encoded.loc[0, "StreamingTV_No internet service"] = 1

        # StreamingPeliculas
        if data.StreamingPeliculas == "Si" and "StreamingPeliculas_Si" in model_columns:
            df_encoded.loc[0, "StreamingPeliculas_Si"] = 1
        elif data.StreamingPeliculas == "No internet service" and "StreamingPeliculas_No internet service" in model_columns:
            df_encoded.loc[0, "StreamingPeliculas_No internet service"] = 1

        # TipoContrato (IMPORTANTE!)
        if data.TipoContrato == "Mensual" and "TipoContrato_Mensual" in model_columns:
            df_encoded.loc[0, "TipoContrato_Mensual"] = 1
        elif data.TipoContrato == "Un año" and "TipoContrato_Un año" in model_columns:
            df_encoded.loc[0, "TipoContrato_Un año"] = 1

        # FacturacionSinPapel
        if data.FacturacionSinPapel == "Si" and "FacturacionSinPapel_Si" in model_columns:
            df_encoded.loc[0, "FacturacionSinPapel_Si"] = 1

        # MetodoPago
        if data.MetodoPago == "Cheque por correo" and "MetodoPago_Cheque por correo" in model_columns:
            df_encoded.loc[0, "MetodoPago_Cheque por correo"] = 1
        elif data.MetodoPago == "Tarjeta de crédito" and "MetodoPago_Tarjeta de crédito" in model_columns:
            df_encoded.loc[0, "MetodoPago_Tarjeta de crédito"] = 1
        elif data.MetodoPago == "Transferencia bancaria" and "MetodoPago_Transferencia bancaria" in model_columns:
            df_encoded.loc[0, "MetodoPago_Transferencia bancaria"] = 1

        # tenure_group
        if data.tenure_group == "13-24 meses" and "tenure_group_13-24 meses" in model_columns:
            df_encoded.loc[0, "tenure_group_13-24 meses"] = 1
        elif data.tenure_group == "25-48 meses" and "tenure_group_25-48 meses" in model_columns:
            df_encoded.loc[0, "tenure_group_25-48 meses"] = 1
        elif data.tenure_group == "49+ meses" and "tenure_group_49+ meses" in model_columns:
            df_encoded.loc[0, "tenure_group_49+ meses"] = 1

        # SegmentoCliente
        if data.SegmentoCliente == "PYME" and "SegmentoCliente_PYME" in model_columns:
            df_encoded.loc[0, "SegmentoCliente_PYME"] = 1
        elif data.SegmentoCliente == "Residencial" and "SegmentoCliente_Residencial" in model_columns:
            df_encoded.loc[0, "SegmentoCliente_Residencial"] = 1

        # income_bracket
        if data.income_bracket == "Low" and "income_bracket_Low" in model_columns:
            df_encoded.loc[0, "income_bracket_Low"] = 1
        elif data.income_bracket == "Medium" and "income_bracket_Medium" in model_columns:
            df_encoded.loc[0, "income_bracket_Medium"] = 1

        # nivel_riesgo
        if data.nivel_riesgo == "Medio" and "nivel_riesgo_Medio" in model_columns:
            df_encoded.loc[0, "nivel_riesgo_Medio"] = 1
        elif data.nivel_riesgo == "Bajo" and "nivel_riesgo_Bajo" in model_columns:
            df_encoded.loc[0, "nivel_riesgo_Bajo"] = 1

        # DEBUG: Comentado para producción
        # print(f"🔍 [DEBUG] Features activas (valor == 1):")
        # active_features = df_encoded.loc[0, df_encoded.loc[0] == 1]
        # print(f"   Total categóricas: {len(active_features)}")

        # 4. Normalizar features numéricos
        numeric_cols = df_encoded.select_dtypes(include=[np.number]).columns
        binary_cols = [col for col in numeric_cols if df_encoded[col].nunique() <= 2]
        cols_to_scale = [col for col in numeric_cols if col not in binary_cols]

        df_scaled = df_encoded.copy()
        if len(cols_to_scale) > 0:
            df_scaled[cols_to_scale] = scaler.transform(df_encoded[cols_to_scale])

        # 5. Predicción
        prediction_class = model.predict(df_scaled)[0]
        probabilities = model.predict_proba(df_scaled)[0]

        prob_no_churn = probabilities[0]
        prob_churn = probabilities[1]

        # 6. Determinar nivel de riesgo
        if prob_churn >= 0.70:
            risk_label = "High"
        elif prob_churn >= 0.40:
            risk_label = "Medium"
        else:
            risk_label = "Low"

        # 7. 🧠 XAI: Feature Importance global del modelo
        importances = model.feature_importances_

        # Crear pares (feature, importance)
        feature_importance_pairs = list(zip(model_columns, importances))

        # Ordenar por importancia descendente
        feature_importance_pairs.sort(key=lambda x: x[1], reverse=True)

        # 8. Identificar main_factor basado en el cliente específico
        # Priorizar features CATEGÓRICAS activas (valor == 1), luego numéricas
        main_factor = "Factor No Clasificado"

        # Primero: Buscar features categóricas activas (valor == 1)
        for feat, imp in feature_importance_pairs[:20]:  # Top 20
            # Si la feature categórica está activa (valor == 1) y tiene mapeo
            if feat in FEATURE_TO_REASON and df_encoded[feat].values[0] == 1:
                main_factor = FEATURE_TO_REASON[feat]
                print(f"🧠 [XAI] Main Factor (categórica): {feat} → {main_factor} (importance: {imp:.4f})")
                break

        # Si no encuentra categórica, buscar numéricas importantes
        if main_factor == "Factor No Clasificado":
            for feat, imp in feature_importance_pairs[:10]:
                # Features numéricas (score_riesgo, Antiguedad, etc.)
                if feat in FEATURE_TO_REASON and df_encoded[feat].values[0] > 0:
                    main_factor = FEATURE_TO_REASON[feat]
                    print(f"🧠 [XAI] Main Factor (numérica): {feat} → {main_factor} (importance: {imp:.4f}, valor: {df_encoded[feat].values[0]:.2f})")
                    break

        # 9. Mapear a acción
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
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error en predicción: {str(e)}")


@app.get("/health")
def health():
    """Endpoint de health check para monitoreo"""
    return {"status": "healthy", "model_loaded": True}
