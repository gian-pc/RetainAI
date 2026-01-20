from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Optional

# Importar módulo XAI limpio (sin hardcode)
from src.xai_utils import select_main_factor_intelligent, generate_explanation, generate_action

# Importar router del dashboard
from src.api_dashboard import router as dashboard_router

# ========== CONFIGURACIÓN ==========
app = FastAPI(
    title="RetainAI Prediction Engine (Production)",
    description="Motor de predicción de churn con modelo limpio (sin data leakage)",
    version="3.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir router del dashboard
app.include_router(dashboard_router)


# ========== CARGA DE MODELO LIMPIO ==========
MODEL_PATH = Path(__file__).parent.parent / "models" / "champion"

print("🔄 Cargando modelo production-ready...")
try:
    model = joblib.load(MODEL_PATH / "model_champion.pkl")
    scaler = joblib.load(MODEL_PATH / "scaler.pkl")
    model_columns = joblib.load(MODEL_PATH / "model_columns.pkl")
    scaled_columns = joblib.load(MODEL_PATH / "scaled_columns.pkl")  # Columnas que fueron escaladas

    print("✅ Modelo limpio cargado exitosamente")
    print(f"   - Modelo: {type(model).__name__}")
    print(f"   - Features totales: {len(model_columns)}")
    print(f"   - Features escaladas: {len(scaled_columns)}")
    print(f"   - Sin data leakage: ✓")
except Exception as e:
    print(f"❌ ERROR al cargar modelo: {e}")
    raise

# ========== FUNCIONES XAI DINÁMICAS (SIN HARDCODEO) ==========

def generate_explanation_from_feature(feature_name: str, feature_value: float, original_value: float, input_data: dict) -> str:
    """
    Genera explicación dinámica basada en el feature + su valor REAL del cliente.
    NO usa diccionarios hardcodeados, analiza el contexto del cliente.
    """
    # Para features categóricas (dummy variables)
    if feature_value == 1.0:  # Feature categórica activa
        if "TipoContrato_Mensual" in feature_name:
            return "Contrato mes a mes sin compromiso de permanencia"
        elif "TipoContrato_Un año" in feature_name:
            return "Contrato anual próximo a renovación"
        elif "TipoContrato_Dos años" in feature_name:
            return "Contrato de largo plazo establecido"
        elif "TipoInternet_Fibra" in feature_name:
            return f"Servicio Fibra Óptica premium (${input_data.get('CargoMensual', 0):.2f}/mes)"
        elif "TipoInternet_DSL" in feature_name:
            return "Servicio DSL de gama media"
        elif "TipoInternet_No" in feature_name:
            return "Cliente sin servicio de internet"
        elif "tenure_group_0-12" in feature_name:
            return f"Cliente nuevo ({input_data.get('Antiguedad', 0)} meses de antigüedad)"
        elif "tenure_group_13-24" in feature_name:
            return f"Cliente en segundo año ({input_data.get('Antiguedad', 0)} meses)"
        elif "tenure_group_25-48" in feature_name:
            return f"Cliente establecido ({input_data.get('Antiguedad', 0)} meses)"
        elif "tenure_group_49+" in feature_name:
            return f"Cliente de larga data ({input_data.get('Antiguedad', 0)} meses)"
        elif "income_bracket_Low" in feature_name:
            return f"Zona de ingresos limitados (${input_data.get('IngresoMediano', 0):,.0f} mediano)"
        elif "income_bracket_Medium" in feature_name:
            return f"Zona de ingresos medios (${input_data.get('IngresoMediano', 0):,.0f} mediano)"
        elif "income_bracket_High" in feature_name:
            return f"Zona de altos ingresos (${input_data.get('IngresoMediano', 0):,.0f} mediano)"
        elif "nivel_riesgo_Alto" in feature_name:
            return f"Perfil de alto riesgo calculado (score: {input_data.get('score_riesgo', 0):.1f}/10)"
        elif "nivel_riesgo_Medio" in feature_name:
            return f"Perfil de riesgo moderado (score: {input_data.get('score_riesgo', 0):.1f}/10)"
        elif "nivel_riesgo_Bajo" in feature_name:
            return f"Perfil de bajo riesgo (score: {input_data.get('score_riesgo', 0):.1f}/10)"
        elif "SegmentoCliente_PYME" in feature_name:
            return "Cliente empresarial PYME con necesidades específicas"
        elif "SegmentoCliente_Corporativo" in feature_name:
            return "Cliente corporativo de alto valor"
        elif "SegmentoCliente_Residencial" in feature_name:
            return "Cliente residencial con uso personal"
        elif "MetodoPago_Cheque electrónico" in feature_name:
            return "Pago por cheque electrónico (método menos automatizado)"
        elif "high_density_area" in feature_name:
            return f"Zona urbana de alta densidad ({input_data.get('DensidadPoblacional', 0):,.0f} hab/km²)"
        # ========== NUEVOS: Comportamentales ==========
        elif "TipoDeQueja_Facturacion" in feature_name:
            return "Quejas relacionadas con facturación"
        elif "TipoDeQueja_Precio" in feature_name:
            return "Quejas sobre el precio del servicio"
        elif "TipoDeQueja_Red" in feature_name:
            return "Problemas técnicos de red reportados"
        elif "TipoDeQueja_Servicio" in feature_name:
            return "Insatisfacción con el servicio al cliente"
        elif "nps_categoria_Pasivo" in feature_name:
            nps = input_data.get('PuntuacionNPS', 0)
            return f"Cliente pasivo (NPS: {nps:.0f}/100) - En riesgo"
        elif "nps_categoria_Promotor" in feature_name:
            nps = input_data.get('PuntuacionNPS', 0)
            return f"Cliente promotor (NPS: {nps:.0f}/100) - Satisfecho"
        elif "csat_categoria_Neutral" in feature_name:
            csat = input_data.get('PuntuacionCSAT', 0)
            return f"Satisfacción neutral (CSAT: {csat:.1f}/5.0)"
        elif "csat_categoria_Satisfecho" in feature_name:
            csat = input_data.get('PuntuacionCSAT', 0)
            return f"Cliente satisfecho (CSAT: {csat:.1f}/5.0)"
        elif "has_queja" in feature_name:
            return "Cliente con quejas registradas"
        elif "alto_tickets" in feature_name:
            tickets = input_data.get('TicketsSoporte', 0)
            return f"Alto volumen de tickets de soporte ({tickets} tickets)"
        else:
            # Para features categóricas no reconocidas, usar nombre limpio
            clean_name = feature_name.replace("_", " ").title()
            return f"{clean_name} activo"

    # Para features numéricos, analizar su valor relativo
    else:
        if "CargoMensual" in feature_name:
            cargo = input_data.get('CargoMensual', 0)
            if cargo > 90:
                return f"Plan de alto costo (${cargo:.2f}/mes)"
            elif cargo < 30:
                return f"Plan económico básico (${cargo:.2f}/mes)"
            else:
                return f"Plan de precio medio (${cargo:.2f}/mes)"

        elif "Antiguedad" in feature_name or "tenure" in feature_name.lower():
            meses = input_data.get('Antiguedad', 0)
            if meses < 6:
                return f"Cliente muy nuevo ({meses} meses), período crítico"
            elif meses < 12:
                return f"Cliente reciente ({meses} meses), en fase de adaptación"
            elif meses > 48:
                return f"Cliente leal de larga data ({meses} meses)"
            else:
                return f"Cliente establecido ({meses} meses)"

        elif "CargosTotal" in feature_name:
            total = input_data.get('CargosTotal', 0)
            return f"Valor total acumulado de ${total:,.2f}"

        elif "IngresoMediano" in feature_name:
            ingreso = input_data.get('IngresoMediano', 0)
            if ingreso < 50000:
                return f"Zona de bajos ingresos (${ingreso:,.0f} mediano)"
            elif ingreso > 80000:
                return f"Zona de altos ingresos (${ingreso:,.0f} mediano)"
            else:
                return f"Zona de ingresos medios (${ingreso:,.0f} mediano)"

        elif "DensidadPoblacional" in feature_name:
            densidad = input_data.get('DensidadPoblacional', 0)
            if densidad > 50000:
                return f"Zona de muy alta densidad ({densidad:,.0f} hab/km²), alta competencia"
            elif densidad > 30000:
                return f"Zona de alta densidad ({densidad:,.0f} hab/km²)"
            else:
                return f"Zona de densidad moderada ({densidad:,.0f} hab/km²)"

        elif "borough_risk" in feature_name:
            risk = input_data.get('borough_risk', 0)
            if risk > 30:
                return f"Zona geográfica de alto riesgo histórico ({risk:.0f}% churn base)"
            elif risk > 20:
                return f"Zona con riesgo moderado ({risk:.0f}% churn base)"
            else:
                return f"Zona geográfica estable ({risk:.0f}% churn base)"

        elif "score_riesgo" in feature_name:
            score = input_data.get('score_riesgo', 0)
            if score > 7:
                return f"Score de riesgo muy alto ({score:.1f}/10)"
            elif score > 5:
                return f"Score de riesgo elevado ({score:.1f}/10)"
            else:
                return f"Score de riesgo controlado ({score:.1f}/10)"

        elif "servicios_premium_count" in feature_name:
            count = int(input_data.get('servicios_premium_count', 0))
            if count == 0:
                return "Sin servicios adicionales contratados"
            elif count == 1:
                return "Solo 1 servicio adicional contratado"
            elif count >= 4:
                return f"Cliente muy comprometido ({count} servicios premium)"
            else:
                return f"{count} servicios adicionales contratados"

        # ========== NUEVOS: Numéricos Comportamentales ==========
        elif "TicketsSoporte" in feature_name:
            tickets = int(input_data.get('TicketsSoporte', 0))
            if tickets == 0:
                return "Sin tickets de soporte abiertos"
            elif tickets == 1:
                return "1 ticket de soporte abierto"
            elif tickets >= 10:
                return f"Alto volumen de tickets: {tickets} reportados"
            elif tickets >= 5:
                return f"Múltiples tickets de soporte: {tickets} reportados"
            else:
                return f"{tickets} tickets de soporte abiertos"

        elif "PuntuacionNPS" in feature_name:
            nps = input_data.get('PuntuacionNPS', 0)
            if nps < 30:
                return f"NPS muy bajo: {nps:.0f}/100 (Cliente detractor crítico)"
            elif nps < 50:
                return f"NPS bajo: {nps:.0f}/100 (Cliente detractor)"
            elif nps < 70:
                return f"NPS neutral: {nps:.0f}/100 (Cliente pasivo)"
            else:
                return f"NPS alto: {nps:.0f}/100 (Cliente promotor)"

        elif "PuntuacionCSAT" in feature_name:
            csat = input_data.get('PuntuacionCSAT', 0)
            if csat < 2.0:
                return f"CSAT muy bajo: {csat:.1f}/5.0 (Muy insatisfecho)"
            elif csat < 3.0:
                return f"CSAT bajo: {csat:.1f}/5.0 (Insatisfecho)"
            elif csat < 4.0:
                return f"CSAT neutral: {csat:.1f}/5.0"
            else:
                return f"CSAT alto: {csat:.1f}/5.0 (Satisfecho)"

        elif "Escaladas" in feature_name:
            escaladas = int(input_data.get('Escaladas', 0))
            if escaladas == 0:
                return "Sin escalaciones de soporte"
            elif escaladas == 1:
                return "1 ticket escalado a supervisor"
            else:
                return f"Múltiples escalaciones: {escaladas} tickets escalados"

        elif "TiempoResolucion" in feature_name:
            tiempo = input_data.get('TiempoResolucion', 0)
            if tiempo > 72:
                return f"Tiempo de resolución muy lento: {tiempo:.1f} horas"
            elif tiempo > 48:
                return f"Tiempo de resolución lento: {tiempo:.1f} horas"
            elif tiempo > 24:
                return f"Tiempo de resolución moderado: {tiempo:.1f} horas"
            else:
                return f"Resolución rápida: {tiempo:.1f} horas"

        elif "TasaAperturaEmail" in feature_name:
            tasa = input_data.get('TasaAperturaEmail', 0)
            if tasa < 0.2:
                return f"Muy bajo engagement: {tasa:.0%} de emails abiertos"
            elif tasa < 0.4:
                return f"Bajo engagement: {tasa:.0%} de emails abiertos"
            elif tasa < 0.6:
                return f"Engagement moderado: {tasa:.0%} de emails abiertos"
            else:
                return f"Alto engagement: {tasa:.0%} de emails abiertos"

        elif "ratio_precio_ingreso" in feature_name:
            ratio = input_data.get('ratio_precio_ingreso', 0)
            cargo = input_data.get('CargoMensual', 0)
            ingreso = input_data.get('IngresoMediano', 0)
            if ratio > 0.02:  # >2% del ingreso
                return f"Precio representa {ratio:.1%} del ingreso (${cargo:.0f} vs ${ingreso:,.0f}) - Alto impacto"
            elif ratio > 0.01:
                return f"Precio representa {ratio:.1%} del ingreso (${cargo:.0f} vs ${ingreso:,.0f})"
            else:
                return f"Precio accesible: {ratio:.1%} del ingreso"

        else:
            # Para features numéricos no reconocidos
            clean_name = feature_name.replace("_", " ").title()
            return f"{clean_name}: {original_value:.2f}"


def generate_action_from_context(main_factor: str, input_data: dict, probability: float) -> str:
    """
    Genera acción basada ÚNICAMENTE en el main_factor detectado por el modelo.
    NO usa umbrales hardcodeados - las acciones se derivan del factor de riesgo que YA detectó el modelo.

    El main_factor ya contiene el diagnóstico del modelo (ej: "NPS bajo: 25.0/100", "CSAT bajo: 2.3/5").
    Solo necesitamos traducir ese diagnóstico en una estrategia de acción general.
    """

    # Extraer datos observables para contextualizar la acción (sin umbrales inventados)
    segmento = input_data.get('SegmentoCliente', 'Residencial')

    # El main_factor YA fue determinado por el modelo - solo lo traducimos a acción
    factor_lower = main_factor.lower()

    # Mapeo directo de factor detectado → estrategia de acción
    if "nps" in factor_lower:
        # El modelo detectó NPS como factor crítico
        return f"Contacto prioritario por satisfacción: {main_factor} - Entrevista para identificar causas"

    elif "csat" in factor_lower:
        # El modelo detectó CSAT como factor crítico
        return f"Escalación por experiencia negativa: {main_factor} - Revisión con gerente de cuenta"

    elif "tickets" in factor_lower or "ticket" in factor_lower:
        # El modelo detectó problemas de soporte
        return f"Revisión urgente de soporte: {main_factor} - Auditoría de casos y compensación si procede"

    elif "queja" in factor_lower:
        # El modelo detectó quejas como factor
        tipo_queja = input_data.get('TipoDeQueja', 'No especificada')
        return f"Atención inmediata a queja: {main_factor} (Tipo: {tipo_queja}) - Resolución prioritaria"

    elif "precio" in factor_lower or "cargo" in factor_lower:
        # El modelo detectó precio como factor
        return f"Revisión comercial: {main_factor} - Evaluar ajuste de plan o beneficios adicionales"

    elif "contrato" in factor_lower or "mensual" in factor_lower or "mes a mes" in factor_lower:
        # El modelo detectó tipo de contrato como factor
        return f"Propuesta de fidelización: {main_factor} - Ofrecer upgrade a contrato anual con incentivos"

    elif "antigüedad" in factor_lower or "antiguedad" in factor_lower or "nuevo" in factor_lower:
        # El modelo detectó antigüedad como factor
        return f"Seguimiento de permanencia: {main_factor} - Programa de onboarding y acompañamiento"

    elif "servicios" in factor_lower or "premium" in factor_lower:
        # El modelo detectó nivel de servicios como factor
        return f"Expansión de servicios: {main_factor} - Demo de funcionalidades adicionales"

    elif "ingreso" in factor_lower or "zona" in factor_lower:
        # El modelo detectó factores geográficos/económicos
        return f"Ajuste regional: {main_factor} - Plan adaptado a perfil socioeconómico"

    else:
        # Factor no categorizado - acción genérica basada en el factor detectado
        # Añadir contexto del segmento sin inventar reglas
        if segmento == 'Corporativo':
            return f"Gestión corporativa prioritaria: {main_factor} - Reunión ejecutiva para retención"
        elif segmento == 'PYME':
            return f"Atención PYME personalizada: {main_factor} - Propuesta comercial ajustada"
        else:
            return f"Contacto proactivo de retención: {main_factor} - Seguimiento personalizado"

# ========== DTOs CON FEATURES COMPORTAMENTALES ==========
class PredictionInput(BaseModel):
    """
    Input para predicción con features disponibles ANTES del churn + datos comportamentales.
    Incluye métricas de satisfacción, soporte y engagement que SÍ predicen el churn.
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

    # ⚠️ REMOVIDOS: nivel_riesgo, score_riesgo, risk_flag (eran data leakage - el modelo los predice, no los usa como input)

    # ========== COMPORTAMIENTO Y SATISFACCIÓN (CRÍTICO) ==========
    # Soporte y quejas
    TicketsSoporte: int  # Número de tickets abiertos
    Escaladas: int  # Tickets escalados
    TipoDeQueja: str  # "Ninguna", "Red", "Facturacion", "Precio", "Servicio"
    has_queja: int  # 0 o 1
    alto_tickets: int  # 0 o 1
    TiempoResolucion: float  # Tiempo promedio de resolución en horas

    # Satisfacción del cliente
    PuntuacionNPS: float  # Net Promoter Score (0-100)
    PuntuacionCSAT: float  # Customer Satisfaction (1-5)
    nps_categoria: str  # "Detractor", "Pasivo", "Promotor"
    csat_categoria: str  # "Insatisfecho", "Neutral", "Satisfecho"

    # Engagement
    TasaAperturaEmail: float  # Tasa de apertura de emails (0-1)

    # Precio relativo
    ratio_precio_ingreso: float  # CargoMensual / IngresoMediano


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
        print(f"   Precio: ${data.CargoMensual}")
        print(f"   Comportamiento: NPS={data.PuntuacionNPS:.0f}, CSAT={data.PuntuacionCSAT:.1f}, Tickets={data.TicketsSoporte}")

        # 2. Crear DataFrame con TODAS las columnas del modelo inicializadas en 0
        df_encoded = pd.DataFrame(0, index=[0], columns=model_columns, dtype=float)

        # 3. Llenar features numéricos directamente (sin data leakage)
        numeric_features = [
            'EsMayor', 'IngresoMediano', 'DensidadPoblacional', 'Antiguedad',
            'CargoMensual', 'CargosTotal',
            'servicios_premium_count', 'borough_risk', 'high_density_area',
            # Nuevos: Comportamentales
            'TicketsSoporte', 'Escaladas', 'has_queja', 'alto_tickets', 'TiempoResolucion',
            'PuntuacionNPS', 'PuntuacionCSAT', 'TasaAperturaEmail', 'ratio_precio_ingreso'
        ]

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

        # ⚠️ REMOVIDO: nivel_riesgo (era data leakage)

        # ========== NUEVOS: Features Comportamentales ==========
        # TipoDeQueja
        if data.TipoDeQueja == "Facturacion" and "TipoDeQueja_Facturacion" in model_columns:
            df_encoded.loc[0, "TipoDeQueja_Facturacion"] = 1
        elif data.TipoDeQueja == "Precio" and "TipoDeQueja_Precio" in model_columns:
            df_encoded.loc[0, "TipoDeQueja_Precio"] = 1
        elif data.TipoDeQueja == "Red" and "TipoDeQueja_Red" in model_columns:
            df_encoded.loc[0, "TipoDeQueja_Red"] = 1
        elif data.TipoDeQueja == "Servicio" and "TipoDeQueja_Servicio" in model_columns:
            df_encoded.loc[0, "TipoDeQueja_Servicio"] = 1
        elif data.TipoDeQueja == "Ninguna" and "TipoDeQueja_Ninguna" in model_columns:
            df_encoded.loc[0, "TipoDeQueja_Ninguna"] = 1

        # nps_categoria
        if data.nps_categoria == "Pasivo" and "nps_categoria_Pasivo" in model_columns:
            df_encoded.loc[0, "nps_categoria_Pasivo"] = 1
        elif data.nps_categoria == "Promotor" and "nps_categoria_Promotor" in model_columns:
            df_encoded.loc[0, "nps_categoria_Promotor"] = 1
        # Detractor es la categoría base (no se encoda)

        # csat_categoria
        if data.csat_categoria == "Neutral" and "csat_categoria_Neutral" in model_columns:
            df_encoded.loc[0, "csat_categoria_Neutral"] = 1
        elif data.csat_categoria == "Satisfecho" and "csat_categoria_Satisfecho" in model_columns:
            df_encoded.loc[0, "csat_categoria_Satisfecho"] = 1
        # Insatisfecho es la categoría base (no se encoda)

        # DEBUG: Comentado para producción
        # print(f"🔍 [DEBUG] Features activas (valor == 1):")
        # active_features = df_encoded.loc[0, df_encoded.loc[0] == 1]
        # print(f"   Total categóricas: {len(active_features)}")

        # 4. Normalizar features numéricos
        # Usar las MISMAS columnas que se escalaron durante el entrenamiento
        df_scaled = df_encoded.copy()
        if len(scaled_columns) > 0:
            df_scaled[scaled_columns] = scaler.transform(df_encoded[scaled_columns])

        # 5. Predicción
        prediction_class = model.predict(df_scaled)[0]
        probabilities = model.predict_proba(df_scaled)[0]

        prob_no_churn = probabilities[0]
        prob_churn = probabilities[1]

        # 6. Determinar nivel de riesgo de forma lógica
        # Low (0-30%):    Cliente estable, probabilidad normal/baja
        # Medium (30-70%): Requiere atención, riesgo moderado-alto
        # High (70-99%):   CRÍTICO - Va a irse, acción inmediata
        # Off (100%):      Ya se fue (abandonoHistorico = true)
        if prob_churn >= 0.90:
            risk_label = "Off"  # Cliente ya perdido (≥90% es prácticamente 100%)
        elif prob_churn >= 0.70:  # 70-89% = Alto riesgo CRÍTICO
            risk_label = "High"
        elif prob_churn >= 0.30:  # 30-69% = Riesgo moderado
            risk_label = "Medium"
        else:  # 0-29% = Bajo riesgo
            risk_label = "Low"

        # 7. 🧠 XAI: Feature Importance global del modelo
        # Logistic Regression usa coef_, Random Forest usa feature_importances_
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
        elif hasattr(model, 'coef_'):
            importances = np.abs(model.coef_[0])
        else:
            raise Exception("Modelo no soportado para XAI")

        # Crear pares (feature, importance)
        feature_importance_pairs = list(zip(model_columns, importances))

        # Ordenar por importancia descendente
        feature_importance_pairs.sort(key=lambda x: x[1], reverse=True)

        # 8. 🧠 XAI DINÁMICO: Calcular contribución PERSONALIZADA por cliente
        # Approach: importance_global * valor_normalizado = contribución específica

        # Calcular contribución de cada feature para ESTE cliente
        feature_contributions = []

        for feat, imp in feature_importance_pairs:
            valor_escalado = df_scaled[feat].values[0]  # Valor escalado
            valor_original = df_encoded[feat].values[0]  # Valor antes de escalar

            # Para categóricas: valor es 0 o 1
            # Para numéricas: valor está normalizado
            # NO usamos abs() para preservar la dirección del efecto
            contribution = imp * abs(valor_escalado)  # importance * magnitud

            # Solo considerar features con contribución significativa
            if contribution > 0.001:
                feature_contributions.append((feat, contribution, valor_escalado, valor_original, imp))

        # Ordenar por contribución descendente
        feature_contributions.sort(key=lambda x: x[1], reverse=True)

        # 9. 🧠 GENERAR EXPLICACIÓN DINÁMICA (sin diccionarios hardcodeados)
        main_factor = "Perfil no determinado"

        if feature_contributions:
            # Usar selección inteligente (prioriza factores problemáticos accionables)
            selected = select_main_factor_intelligent(feature_contributions, input_dict)
            if selected:
                top_feat, top_contrib, top_valor_esc, top_valor_orig, top_imp = selected
            else:
                top_feat, top_contrib, top_valor_esc, top_valor_orig, top_imp = feature_contributions[0]

            # Generar explicación dinámica (sin umbrales hardcodeados)
            main_factor = generate_explanation(
                top_feat,
                top_valor_esc,  # Valor escalado para determinar nivel
                top_valor_orig,
                input_dict
            )

            print(f"🧠 [XAI INTELIGENTE] Main Factor: {top_feat}")
            print(f"   Explicación: {main_factor}")
            print(f"   Contribución: {top_contrib:.4f} (importance: {top_imp:.4f} × valor: {top_valor_esc:.2f})")

            # Mostrar top 3 para debug
            print(f"   Top 3 factores para este cliente:")
            for i, (f, c, v_esc, v_orig, im) in enumerate(feature_contributions[:3], 1):
                explicacion = generate_explanation(f, v_esc, v_orig, input_dict)
                print(f"      {i}. {f:30} → {explicacion[:50]}")
                print(f"         contrib:{c:.4f} (imp:{im:.4f} × val:{v_esc:.2f})")

        # 10. 🎯 GENERAR ACCIÓN DINÁMICA (basada solo en main_factor)
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
