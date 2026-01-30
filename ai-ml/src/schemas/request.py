"""
Request DTOs para el microservicio ML
"""

from pydantic import BaseModel, Field


class PredictionInput(BaseModel):
    """
    DTO de entrada para predicción de churn.

    Contiene los 23 features requeridos por el modelo de producción.
    Todos los datos deben venir RAW (sin preprocesamiento), el pipeline
    del modelo se encarga de las transformaciones.

    NOTA: score_riesgo fue eliminado para evitar data leakage.
    """

    # Engagement features
    dias_activos_semanales: int = Field(
        ...,
        ge=0,
        le=7,
        description="Días promedio activo por semana (0-7)"
    )
    promedio_conexion: float = Field(
        ...,
        ge=0,
        description="Duración promedio de conexión en minutos"
    )
    conexiones_mensuales: int = Field(
        ...,
        ge=0,
        description="Total de conexiones en el mes"
    )
    caracteristicas_usadas: int = Field(
        ...,
        ge=0,
        description="Número de features del servicio utilizadas"
    )
    dias_ultima_conexion: int = Field(
        ...,
        ge=0,
        description="Días desde la última conexión"
    )
    intensidad_uso: float = Field(
        ...,
        ge=0,
        description="Intensidad de uso (conexiones/días activos)"
    )
    tasa_crecimiento_uso: float = Field(
        ...,
        description="Tasa de crecimiento en uso (puede ser negativa)"
    )
    tiempo_sesion_promedio: float = Field(
        ...,
        ge=0,
        description="Duración promedio de sesión en minutos"
    )

    # Customer support features
    tickets_soporte: int = Field(
        ...,
        ge=0,
        description="Número total de tickets de soporte"
    )
    tiempo_resolucion: float = Field(
        ...,
        ge=0,
        description="Tiempo promedio de resolución en horas"
    )
    dias_desde_ultimo_contacto: int = Field(
        ...,
        description="Días desde último contacto con soporte (-1 si nunca)"
    )

    # Satisfaction features
    puntuacion_nps: float = Field(
        ...,
        ge=0,
        le=100,
        description="Net Promoter Score (0-100)"
    )
    puntuacion_csat: float = Field(
        ...,
        ge=1,
        le=5,
        description="Customer Satisfaction Score (1-5)"
    )
    tasa_apertura_email: float = Field(
        ...,
        ge=0,
        le=1,
        description="Tasa de apertura de emails (0-1)"
    )

    # Financial features
    cargo_mensual: float = Field(
        ...,
        ge=0,
        description="Cargo mensual en USD"
    )
    ingresos_totales: float = Field(
        ...,
        ge=0,
        description="Ingresos totales acumulados en USD"
    )
    ratio_carga_financiera: float = Field(
        ...,
        ge=0,
        description="Ratio cargo_mensual / ingresos_totales"
    )
    errores_pago: int = Field(
        ...,
        ge=0,
        description="Número de errores en pagos"
    )

    # Account features
    antiguedad: int = Field(
        ...,
        ge=0,
        description="Antigüedad de la cuenta en meses"
    )
    edad: int = Field(
        ...,
        ge=18,
        le=120,
        description="Edad del cliente"
    )

    # Geographic features
    latitud: float = Field(
        ...,
        ge=-90,
        le=90,
        description="Latitud de la ubicación"
    )
    longitud: float = Field(
        ...,
        ge=-180,
        le=180,
        description="Longitud de la ubicación"
    )
    codigo_postal: str = Field(
        ...,
        description="Código postal (será convertido a numérico)"
    )

    class Config:
        schema_extra = {
            "example": {
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
        }
