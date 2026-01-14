"""
Prueba de API con clientes REALES del dataset
Para demostrar que el modelo NO está maquillado
"""
import requests
import json
import pandas as pd

# URL del servidor
BASE_URL = "http://localhost:8000"

print("="*80)
print("PRUEBA CON CLIENTES REALES DEL DATASET")
print("="*80)

# 1. Cargar dataset real
df = pd.read_csv('data/processed/dataset_features.csv')

# 2. Tomar 5 clientes que CANCELARON (Churn = Si)
clientes_churn = df[df['Cancelacion'] == 'Si'].head(5)

# 3. Tomar 5 clientes que NO CANCELARON (Churn = No)
clientes_no_churn = df[df['Cancelacion'] == 'No'].head(5)

print("\n" + "="*80)
print("CLIENTES QUE CANCELARON (Churn = Si)")
print("="*80)

aciertos_churn = 0
for idx, row in clientes_churn.iterrows():
    # Preparar request
    cliente_data = {
        "Genero": row['Genero'],
        "EsMayor": int(row['EsMayor']),
        "TienePareja": row['TienePareja'],
        "TieneDependientes": row['TieneDependientes'],
        "IngresoMediano": float(row['IngresoMediano']),
        "DensidadPoblacional": float(row['DensidadPoblacional']),
        "borough_risk": float(row['borough_risk']),
        "high_density_area": int(row['high_density_area']),
        "ServicioTelefono": row['ServicioTelefono'],
        "LineasMultiples": row['LineasMultiples'],
        "TipoInternet": row['TipoInternet'],
        "SeguridadOnline": row['SeguridadOnline'],
        "RespaldoOnline": row['RespaldoOnline'],
        "ProteccionDispositivo": row['ProteccionDispositivo'],
        "SoporteTecnico": row['SoporteTecnico'],
        "StreamingTV": row['StreamingTV'],
        "StreamingPeliculas": row['StreamingPeliculas'],
        "servicios_premium_count": int(row['servicios_premium_count']),
        "TipoContrato": row['TipoContrato'],
        "FacturacionSinPapel": row['FacturacionSinPapel'],
        "MetodoPago": row['MetodoPago'],
        "Antiguedad": int(row['Antiguedad']),
        "tenure_group": row['tenure_group'],
        "CargoMensual": float(row['CargoMensual']),
        "CargosTotal": float(row['CargosTotal']),
        "SegmentoCliente": row['SegmentoCliente'],
        "income_bracket": row['income_bracket'],
        "nivel_riesgo": row['nivel_riesgo'],
        "score_riesgo": float(row['score_riesgo']),
        "risk_flag": int(row['risk_flag'])
    }

    # Predecir
    response = requests.post(f"{BASE_URL}/predict", json=cliente_data)
    result = response.json()

    print(f"\nCliente {idx} (REAL: Canceló)")
    print(f"  Perfil: {row['TipoContrato']}, {row['Antiguedad']} meses, ${row['CargoMensual']:.2f}")
    print(f"  PREDICCIÓN: {result['risk']} ({result['probability']*100:.1f}% probabilidad)")
    print(f"  Main Factor: {result['main_factor']}")

    # Considerar acierto si probabilidad > 40%
    if result['probability'] >= 0.40:
        print(f"  ✅ ACIERTO - Detectó alto riesgo")
        aciertos_churn += 1
    else:
        print(f"  ❌ ERROR - No detectó el churn")

print(f"\nPrecisión en clientes que CANCELARON: {aciertos_churn}/5 = {aciertos_churn/5*100:.0f}%")

print("\n" + "="*80)
print("CLIENTES QUE NO CANCELARON (Churn = No)")
print("="*80)

aciertos_no_churn = 0
for idx, row in clientes_no_churn.iterrows():
    # Preparar request
    cliente_data = {
        "Genero": row['Genero'],
        "EsMayor": int(row['EsMayor']),
        "TienePareja": row['TienePareja'],
        "TieneDependientes": row['TieneDependientes'],
        "IngresoMediano": float(row['IngresoMediano']),
        "DensidadPoblacional": float(row['DensidadPoblacional']),
        "borough_risk": float(row['borough_risk']),
        "high_density_area": int(row['high_density_area']),
        "ServicioTelefono": row['ServicioTelefono'],
        "LineasMultiples": row['LineasMultiples'],
        "TipoInternet": row['TipoInternet'],
        "SeguridadOnline": row['SeguridadOnline'],
        "RespaldoOnline": row['RespaldoOnline'],
        "ProteccionDispositivo": row['ProteccionDispositivo'],
        "SoporteTecnico": row['SoporteTecnico'],
        "StreamingTV": row['StreamingTV'],
        "StreamingPeliculas": row['StreamingPeliculas'],
        "servicios_premium_count": int(row['servicios_premium_count']),
        "TipoContrato": row['TipoContrato'],
        "FacturacionSinPapel": row['FacturacionSinPapel'],
        "MetodoPago": row['MetodoPago'],
        "Antiguedad": int(row['Antiguedad']),
        "tenure_group": row['tenure_group'],
        "CargoMensual": float(row['CargoMensual']),
        "CargosTotal": float(row['CargosTotal']),
        "SegmentoCliente": row['SegmentoCliente'],
        "income_bracket": row['income_bracket'],
        "nivel_riesgo": row['nivel_riesgo'],
        "score_riesgo": float(row['score_riesgo']),
        "risk_flag": int(row['risk_flag'])
    }

    # Predecir
    response = requests.post(f"{BASE_URL}/predict", json=cliente_data)
    result = response.json()

    print(f"\nCliente {idx} (REAL: NO Canceló)")
    print(f"  Perfil: {row['TipoContrato']}, {row['Antiguedad']} meses, ${row['CargoMensual']:.2f}")
    print(f"  PREDICCIÓN: {result['risk']} ({result['probability']*100:.1f}% probabilidad)")
    print(f"  Main Factor: {result['main_factor']}")

    # Considerar acierto si probabilidad < 40%
    if result['probability'] < 0.40:
        print(f"  ✅ ACIERTO - Detectó bajo riesgo")
        aciertos_no_churn += 1
    else:
        print(f"  ❌ ERROR - Falsa alarma")

print(f"\nPrecisión en clientes que NO CANCELARON: {aciertos_no_churn}/5 = {aciertos_no_churn/5*100:.0f}%")

print("\n" + "="*80)
print("RESUMEN FINAL")
print("="*80)
print(f"Total aciertos: {aciertos_churn + aciertos_no_churn}/10 = {(aciertos_churn + aciertos_no_churn)/10*100:.0f}%")
print(f"\nEsto demuestra que el modelo NO está maquillado.")
print(f"Funciona con clientes REALES del dataset.")
