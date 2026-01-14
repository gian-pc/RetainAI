"""
Script de prueba para el endpoint /predict con modelo limpio
"""
import requests
import json

# URL del servidor (ajustar según donde corra)
BASE_URL = "http://localhost:8000"

print("="*80)
print("PRUEBA DE API - MODELO LIMPIO")
print("="*80)

# 1. Health Check
print("\n1️⃣ Health Check...")
response = requests.get(f"{BASE_URL}/")
print(json.dumps(response.json(), indent=2))

# 2. Predicción con cliente de ALTO RIESGO
print("\n2️⃣ Cliente de ALTO RIESGO (debe predecir churn)...")
print("-" * 80)

cliente_alto_riesgo = {
    # Demográficos
    "Genero": "Masculino",
    "EsMayor": 0,
    "TienePareja": "No",
    "TieneDependientes": "No",

    # Geográficos
    "IngresoMediano": 42000.0,
    "DensidadPoblacional": 13000.0,
    "borough_risk": 25.66,
    "high_density_area": 0,

    # Servicios (POCOS servicios adicionales)
    "ServicioTelefono": "Si",
    "LineasMultiples": "No",
    "TipoInternet": "Fibra óptica",  # Servicio caro
    "SeguridadOnline": "No",
    "RespaldoOnline": "No",
    "ProteccionDispositivo": "No",
    "SoporteTecnico": "No",
    "StreamingTV": "No",
    "StreamingPeliculas": "No",
    "servicios_premium_count": 0,  # Sin servicios adicionales

    # Contrato (RIESGO ALTO)
    "TipoContrato": "Mensual",  # Sin compromiso
    "FacturacionSinPapel": "Si",
    "MetodoPago": "Cheque electrónico",
    "Antiguedad": 4,  # Cliente NUEVO (0-12 meses)
    "tenure_group": "0-12 meses",

    # Financiero (PRECIO ALTO)
    "CargoMensual": 73.9,
    "CargosTotal": 280.85,

    # Segmento
    "SegmentoCliente": "PYME",
    "income_bracket": "Medium",

    # Features derivados
    "nivel_riesgo": "Alto",
    "score_riesgo": 11.0,  # ALTO
    "risk_flag": 0
}

print("📝 Perfil del cliente:")
print(f"   - Contrato: {cliente_alto_riesgo['TipoContrato']}")
print(f"   - Antiguedad: {cliente_alto_riesgo['Antiguedad']} meses")
print(f"   - Precio: ${cliente_alto_riesgo['CargoMensual']}")
print(f"   - Servicios adicionales: {cliente_alto_riesgo['servicios_premium_count']}")
print(f"   - Score riesgo: {cliente_alto_riesgo['score_riesgo']}")

response = requests.post(f"{BASE_URL}/predict", json=cliente_alto_riesgo)
result = response.json()

print(f"\n✅ Respuesta:")
print(json.dumps(result, indent=2, ensure_ascii=False))

# 3. Predicción con cliente de BAJO RIESGO
print("\n" + "="*80)
print("3️⃣ Cliente de BAJO RIESGO (debe predecir NO churn)...")
print("-" * 80)

cliente_bajo_riesgo = {
    # Demográficos
    "Genero": "Femenino",
    "EsMayor": 1,
    "TienePareja": "Si",
    "TieneDependientes": "Si",

    # Geográficos
    "IngresoMediano": 85000.0,
    "DensidadPoblacional": 28000.0,
    "borough_risk": 29.02,
    "high_density_area": 1,

    # Servicios (MUCHOS servicios adicionales)
    "ServicioTelefono": "Si",
    "LineasMultiples": "Si",
    "TipoInternet": "Fibra óptica",
    "SeguridadOnline": "Si",
    "RespaldoOnline": "Si",
    "ProteccionDispositivo": "Si",
    "SoporteTecnico": "Si",
    "StreamingTV": "Si",
    "StreamingPeliculas": "Si",
    "servicios_premium_count": 4,  # Muchos servicios

    # Contrato (BAJO RIESGO)
    "TipoContrato": "Dos años",  # Compromiso largo
    "FacturacionSinPapel": "Si",
    "MetodoPago": "Transferencia bancaria",
    "Antiguedad": 72,  # Cliente ANTIGUO
    "tenure_group": "49+ meses",

    # Financiero
    "CargoMensual": 116.8,
    "CargosTotal": 8456.75,

    # Segmento
    "SegmentoCliente": "Corporativo",
    "income_bracket": "High",

    # Features derivados
    "nivel_riesgo": "Medio",
    "score_riesgo": 4.0,  # BAJO
    "risk_flag": 0
}

print("📝 Perfil del cliente:")
print(f"   - Contrato: {cliente_bajo_riesgo['TipoContrato']}")
print(f"   - Antiguedad: {cliente_bajo_riesgo['Antiguedad']} meses")
print(f"   - Precio: ${cliente_bajo_riesgo['CargoMensual']}")
print(f"   - Servicios adicionales: {cliente_bajo_riesgo['servicios_premium_count']}")
print(f"   - Score riesgo: {cliente_bajo_riesgo['score_riesgo']}")

response = requests.post(f"{BASE_URL}/predict", json=cliente_bajo_riesgo)
result = response.json()

print(f"\n✅ Respuesta:")
print(json.dumps(result, indent=2, ensure_ascii=False))

print("\n" + "="*80)
print("✅ PRUEBAS COMPLETADAS")
print("="*80)
