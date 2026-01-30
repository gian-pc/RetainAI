"""
Value Object: Risk Level

Representa los niveles de riesgo de churn en el dominio.
"""

from enum import Enum


class RiskLevel(str, Enum):
    """
    Enum que representa el nivel de riesgo de churn de un cliente.

    Los niveles se calculan basándose en la probabilidad de churn:
    - LOW (Bajo): < 25%
    - MEDIUM (Medio): 25% - 40%
    - HIGH (Alto): > 40%
    """

    LOW = "Bajo"
    MEDIUM = "Medio"
    HIGH = "Alto"

    @classmethod
    def from_probability(cls, probability: float) -> "RiskLevel":
        """
        Factory method para crear RiskLevel desde una probabilidad.

        Args:
            probability: Probabilidad de churn (0.0 - 1.0)

        Returns:
            RiskLevel correspondiente

        Examples:
            >>> RiskLevel.from_probability(0.15)
            RiskLevel.LOW
            >>> RiskLevel.from_probability(0.30)
            RiskLevel.MEDIUM
            >>> RiskLevel.from_probability(0.75)
            RiskLevel.HIGH
        """
        if probability < 0.25:
            return cls.LOW
        elif probability < 0.40:
            return cls.MEDIUM
        else:
            return cls.HIGH

    def is_actionable(self) -> bool:
        """
        Determina si este nivel de riesgo requiere acción.

        Returns:
            True si el riesgo es MEDIUM o HIGH, False si es LOW
        """
        return self in [RiskLevel.MEDIUM, RiskLevel.HIGH]

    def to_spanish(self) -> str:
        """
        Retorna el nombre en español.

        Returns:
            Nombre del nivel en español
        """
        return self.value

    def __str__(self) -> str:
        return self.value
