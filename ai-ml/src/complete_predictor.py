"""
Predictor Completo Todo-en-Uno para RetainAI
Incluye: ETL + Encoding + Scaling + Modelo

Uso:
    from src.complete_predictor import predict_churn
    
    # Datos pueden venir sucios
    raw_data = {'Antiguedad': '  12  ', 'CargoMensual': None, ...}
    
    result = predict_churn(raw_data)
    # {'risk': 'Medium', 'probability': 0.45, ...}
"""
import joblib
import pandas as pd
import numpy as np
from pathlib import Path

# Cargar modelo y componentes (una sola vez al importar)
MODEL_PATH = Path(__file__).parent.parent / "models" / "champion"

model = joblib.load(MODEL_PATH / "model_champion.pkl")
scaler = joblib.load(MODEL_PATH / "scaler.pkl")
model_columns = joblib.load(MODEL_PATH / "model_columns.pkl")
scaled_columns = joblib.load(MODEL_PATH / "scaled_columns.pkl")

print("✅ Modelo completo cargado")


def clean_and_validate(data: dict) -> dict:
    """
    Paso 1: ETL - Limpia y valida datos sucios
    """
    cleaned = data.copy()
    
    # Defaults para valores nulos
    defaults = {
        'Antiguedad': 0,
        'CargoMensual': 0.0,
        'IngresoMediano': 50000.0,
        'DensidadPoblacional': 10000.0,
        'TicketsSoporte': 0,
        'Escaladas': 0,
        'TiempoResolucion': 24.0,
        'PuntuacionNPS': 50.0,
        'PuntuacionCSAT': 3.0,
        'TasaAperturaEmail': 0.3,
        'borough_risk': 20.0,
        'EsMayor': 0,
    }
    
    # Limpiar nulos
    for key, default_value in defaults.items():
        if key not in cleaned or cleaned[key] is None or cleaned[key] == '':
            cleaned[key] = default_value
        else:
            # Limpiar strings (trim)
            if isinstance(cleaned[key], str):
                cleaned[key] = cleaned[key].strip()
    
    # Convertir a numéricos
    numeric_fields = ['Antiguedad', 'CargoMensual', 'IngresoMediano', 'DensidadPoblacional',
                     'TicketsSoporte', 'Escaladas', 'TiempoResolucion', 'PuntuacionNPS',
                     'PuntuacionCSAT', 'TasaAperturaEmail', 'borough_risk', 'EsMayor']
    
    for field in numeric_fields:
        if field in cleaned:
            try:
                cleaned[field] = float(cleaned[field])
            except (ValueError, TypeError):
                cleaned[field] = defaults.get(field, 0)
    
    # Validar rangos
    if 'PuntuacionNPS' in cleaned:
        cleaned['PuntuacionNPS'] = max(0, min(100, cleaned['PuntuacionNPS']))
    
    if 'PuntuacionCSAT' in cleaned:
        cleaned['PuntuacionCSAT'] = max(1, min(5, cleaned['PuntuacionCSAT']))
    
    if 'TasaAperturaEmail' in cleaned:
        cleaned['TasaAperturaEmail'] = max(0, min(1, cleaned['TasaAperturaEmail']))
    
    # Calcular CargosTotal si no existe
    if 'CargosTotal' not in cleaned:
        cleaned['CargosTotal'] = cleaned.get('CargoMensual', 0) * cleaned.get('Antiguedad', 0)
    
    # Derivar features
    cleaned = derive_features(cleaned)
    
    return cleaned


def derive_features(data: dict) -> dict:
    """
    Calcula features derivados
    """
    # tenure_group
    antiguedad = data.get('Antiguedad', 0)
    if antiguedad <= 12:
        data['tenure_group'] = '0-12 meses'
    elif antiguedad <= 24:
        data['tenure_group'] = '13-24 meses'
    elif antiguedad <= 48:
        data['tenure_group'] = '25-48 meses'
    else:
        data['tenure_group'] = '49+ meses'
    
    # income_bracket
    ingreso = data.get('IngresoMediano', 50000)
    if ingreso < 50000:
        data['income_bracket'] = 'Low'
    elif ingreso < 80000:
        data['income_bracket'] = 'Medium'
    else:
        data['income_bracket'] = 'High'
    
    # nps_categoria
    nps = data.get('PuntuacionNPS', 50)
    if nps < 50:
        data['nps_categoria'] = 'Detractor'
    elif nps < 70:
        data['nps_categoria'] = 'Pasivo'
    else:
        data['nps_categoria'] = 'Promotor'
    
    # csat_categoria
    csat = data.get('PuntuacionCSAT', 3.0)
    if csat < 3.0:
        data['csat_categoria'] = 'Insatisfecho'
    elif csat < 4.0:
        data['csat_categoria'] = 'Neutral'
    else:
        data['csat_categoria'] = 'Satisfecho'
    
    # has_queja
    data['has_queja'] = 0 if data.get('TipoDeQueja') == 'Ninguna' else 1
    
    # alto_tickets
    data['alto_tickets'] = 1 if data.get('TicketsSoporte', 0) >= 5 else 0
    
    # high_density_area
    data['high_density_area'] = 1 if data.get('DensidadPoblacional', 0) > 30000 else 0
    
    # ratio_precio_ingreso
    cargo = data.get('CargoMensual', 0)
    ingreso = data.get('IngresoMediano', 50000)
    data['ratio_precio_ingreso'] = (cargo * 12) / ingreso if ingreso > 0 else 0.01
    
    # servicios_premium_count
    servicios = [
        data.get('SeguridadOnline') == 'Si',
        data.get('RespaldoOnline') == 'Si',
        data.get('ProteccionDispositivo') == 'Si',
        data.get('SoporteTecnico') == 'Si',
        data.get('StreamingTV') == 'Si',
        data.get('StreamingPeliculas') == 'Si',
    ]
    data['servicios_premium_count'] = sum(servicios)
    
    return data


def encode_and_align(data: dict) -> pd.DataFrame:
    """
    Paso 2: One-hot encoding y alineación con columnas del modelo
    """
    df = pd.DataFrame([data])
    
    # Columnas categóricas
    categorical_cols = [
        'Genero', 'TienePareja', 'TieneDependientes', 'ServicioTelefono',
        'LineasMultiples', 'TipoInternet', 'SeguridadOnline', 'RespaldoOnline',
        'ProteccionDispositivo', 'SoporteTecnico', 'StreamingTV', 'StreamingPeliculas',
        'TipoContrato', 'FacturacionSinPapel', 'MetodoPago', 'tenure_group',
        'SegmentoCliente', 'income_bracket', 'TipoDeQueja', 'nps_categoria', 'csat_categoria'
    ]
    
    # Aplicar one-hot encoding
    df_encoded = pd.get_dummies(df, columns=categorical_cols, drop_first=False)
    
    # Alinear con columnas del modelo
    df_aligned = df_encoded.reindex(columns=model_columns, fill_value=0)
    
    return df_aligned


def scale_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Paso 3: Escalar features numéricos
    """
    df_scaled = df.copy()
    df_scaled[scaled_columns] = scaler.transform(df[scaled_columns])
    return df_scaled


def predict_churn(raw_data: dict) -> dict:
    """
    Función principal: Predice churn desde datos crudos.
    
    Args:
        raw_data: Diccionario con datos del cliente (pueden estar sucios)
        
    Returns:
        dict con: risk, probability, main_factor, next_best_action
    """
    # Paso 1: ETL
    clean_data = clean_and_validate(raw_data)
    
    # Paso 2: Encoding
    df_encoded = encode_and_align(clean_data)
    
    # Paso 3: Scaling
    df_scaled = scale_features(df_encoded)
    
    # Paso 4: Predicción
    prediction = model.predict(df_scaled)[0]
    probability = model.predict_proba(df_scaled)[0, 1]
    
    # Determinar nivel de riesgo
    if probability >= 0.90:
        risk = "Off"
    elif probability >= 0.70:
        risk = "High"
    elif probability >= 0.30:
        risk = "Medium"
    else:
        risk = "Low"
    
    # XAI: Feature importance
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
    else:
        importances = np.abs(model.coef_[0])
    
    # Top feature
    top_idx = np.argmax(importances)
    main_factor = model_columns[top_idx]
    
    # Generar explicación simple
    main_factor_explanation = f"{main_factor}: {clean_data.get(main_factor, 'N/A')}"
    
    # Acción recomendada
    if probability >= 0.70:
        action = "Contacto inmediato de retención"
    elif probability >= 0.30:
        action = "Monitoreo y seguimiento"
    else:
        action = "Cliente estable, mantener calidad"
    
    return {
        'risk': risk,
        'probability': round(probability, 4),
        'main_factor': main_factor_explanation,
        'next_best_action': action
    }


# Función para batch prediction
def predict_batch(data_list: list) -> list:
    """
    Predice para múltiples clientes.
    
    Args:
        data_list: Lista de diccionarios con datos de clientes
        
    Returns:
        Lista de resultados
    """
    results = []
    for data in data_list:
        try:
            result = predict_churn(data)
            results.append(result)
        except Exception as e:
            results.append({
                'risk': 'Error',
                'probability': 0.0,
                'main_factor': f'Error: {str(e)}',
                'next_best_action': 'Revisar datos'
            })
    return results
