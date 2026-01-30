"""
Response DTOs para el microservicio ML
"""

from pydantic import BaseModel, Field


class PredictionOutput(BaseModel):
    """
    DTO de salida para predicción de churn.

    Contiene la probabilidad de churn y explicabilidad (XAI).

    NOTA: El campo 'risk' (Bajo/Medio/Alto) se calcula en el backend Java
    usando @PrePersist basándose en la probabilidad retornada aquí.
    """

    probability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Probabilidad de churn (0.0 - 1.0)"
    )

    main_factor: str = Field(
        ...,
        description="Factor principal que contribuye al riesgo (XAI)"
    )

    next_best_action: str = Field(
        ...,
        description="Acción recomendada para retener al cliente"
    )

    class Config:
        schema_extra = {
            "example": {
                "probability": 0.65,
                "main_factor": "NPS Bajo (25/100) - Cliente insatisfecho",
                "next_best_action": "Contactar al cliente para entender insatisfacción y ofrecer mejoras"
            }
        }


class BatchPredictionOutput(BaseModel):
    """
    DTO de salida para predicción batch.
    """

    total_processed: int = Field(
        ...,
        description="Total de clientes procesados"
    )

    predictions: list[PredictionOutput] = Field(
        ...,
        description="Lista de predicciones individuales"
    )

    class Config:
        schema_extra = {
            "example": {
                "total_processed": 100,
                "predictions": [
                    {
                        "probability": 0.65,
                        "main_factor": "NPS Bajo",
                        "next_best_action": "Contactar cliente"
                    }
                ]
            }
        }
