"""
Schemas (DTOs) para el microservicio ML
"""

from .request import PredictionInput
from .response import PredictionOutput, BatchPredictionOutput

__all__ = [
    "PredictionInput",
    "PredictionOutput",
    "BatchPredictionOutput",
]
