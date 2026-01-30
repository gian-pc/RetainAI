"""
Domain Layer - Entidades y Value Objects del dominio
"""

from .entities import Prediction
from .value_objects import RiskLevel

__all__ = [
    "Prediction",
    "RiskLevel",
]
