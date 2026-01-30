"""
Constantes del microservicio ML
"""

# Risk Levels
RISK_LOW = "Bajo"
RISK_MEDIUM = "Medio"
RISK_HIGH = "Alto"

# Risk Thresholds
THRESHOLD_LOW = 0.25
THRESHOLD_MEDIUM = 0.40

# Model Features (23 features requeridos)
REQUIRED_FEATURES = [
    'dias_activos_semanales',
    'promedio_conexion',
    'conexiones_mensuales',
    'caracteristicas_usadas',
    'dias_ultima_conexion',
    'intensidad_uso',
    'tickets_soporte',
    'puntuacion_nps',
    'tasa_crecimiento_uso',
    'puntuacion_csat',
    'ratio_carga_financiera',
    'tasa_apertura_email',
    'errores_pago',
    'antiguedad',
    'ingresos_totales',
    'latitud',
    'cargo_mensual',
    'tiempo_resolucion',
    'longitud',
    'codigo_postal',
    'edad',
    'dias_desde_ultimo_contacto',
    'tiempo_sesion_promedio'
]

# Feature Engineering Features (creados en runtime)
ENGINEERED_FEATURES = [
    'intensidad_uso',
    'ratio_carga_financiera',
    'dias_desde_ultimo_contacto'
]
