"""
Entity: Prediction

Entidad de dominio que representa el resultado de una predicción de churn.
"""

from dataclasses import dataclass
from typing import Optional
from ..value_objects.risk_level import RiskLevel


@dataclass
class Prediction:
    """
    Entidad de dominio: Resultado de una predicción de churn.

    Esta entidad encapsula toda la información relacionada con la
    predicción de churn para un cliente, incluyendo la probabilidad,
    nivel de riesgo, y explicabilidad (XAI).
    """

    probability: float
    """Probabilidad de churn (0.0 - 1.0)"""

    risk_level: RiskLevel
    """Nivel de riesgo calculado"""

    main_factor: str
    """Factor principal que contribuye al riesgo (XAI)"""

    next_best_action: str
    """Acción recomendada para retener al cliente"""

    feature_importances: Optional[dict] = None
    """Importancia de cada feature (opcional, para debugging)"""

    def __post_init__(self):
        """Validaciones post-inicialización"""
        if not 0.0 <= self.probability <= 1.0:
            raise ValueError(
                f"Probability must be between 0.0 and 1.0, got {self.probability}"
            )

        # Validar consistencia entre probability y risk_level
        expected_risk = RiskLevel.from_probability(self.probability)
        if self.risk_level != expected_risk:
            # Advertencia: inconsistencia detectada
            import warnings
            warnings.warn(
                f"Risk level {self.risk_level} doesn't match probability {self.probability:.2%}. "
                f"Expected {expected_risk}"
            )

    @classmethod
    def create(
        cls,
        probability: float,
        main_factor: str,
        next_best_action: str,
        feature_importances: Optional[dict] = None
    ) -> "Prediction":
        """
        Factory method para crear una Prediction.

        Calcula automáticamente el risk_level basándose en la probabilidad.

        Args:
            probability: Probabilidad de churn (0.0 - 1.0)
            main_factor: Factor principal (XAI)
            next_best_action: Acción recomendada
            feature_importances: Importancias (opcional)

        Returns:
            Nueva instancia de Prediction
        """
        risk_level = RiskLevel.from_probability(probability)

        return cls(
            probability=probability,
            risk_level=risk_level,
            main_factor=main_factor,
            next_best_action=next_best_action,
            feature_importances=feature_importances
        )

    def is_high_risk(self) -> bool:
        """
        Verifica si el cliente tiene alto riesgo de churn.

        Returns:
            True si el riesgo es HIGH
        """
        return self.risk_level == RiskLevel.HIGH

    def requires_action(self) -> bool:
        """
        Determina si este cliente requiere acción de retención.

        Returns:
            True si el riesgo es MEDIUM o HIGH
        """
        return self.risk_level.is_actionable()

    def to_dict(self) -> dict:
        """
        Convierte la entidad a diccionario (para serialización).

        Returns:
            Diccionario con los datos de la predicción
        """
        return {
            "probability": self.probability,
            "risk": self.risk_level.value,
            "main_factor": self.main_factor,
            "next_best_action": self.next_best_action
        }

    def __str__(self) -> str:
        return (
            f"Prediction(risk={self.risk_level.value}, "
            f"probability={self.probability:.2%})"
        )
