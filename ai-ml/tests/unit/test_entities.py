"""
Unit tests for domain entities
"""

import pytest

from src.domain.entities.prediction import Prediction
from src.domain.value_objects.risk_level import RiskLevel


class TestPrediction:
    """Tests for Prediction entity"""

    def test_create_prediction_low_risk(self):
        """Test creating a low-risk prediction"""
        prediction = Prediction.create(
            probability=0.15,
            main_factor="Alto uso del servicio",
            next_best_action="Mantener satisfacción"
        )
        assert prediction.probability == 0.15
        assert prediction.risk_level == RiskLevel.LOW
        assert prediction.main_factor == "Alto uso del servicio"
        assert prediction.next_best_action == "Mantener satisfacción"

    def test_create_prediction_medium_risk(self):
        """Test creating a medium-risk prediction"""
        prediction = Prediction.create(
            probability=0.35,
            main_factor="Uso decreciente",
            next_best_action="Monitorear de cerca"
        )
        assert prediction.probability == 0.35
        assert prediction.risk_level == RiskLevel.MEDIUM

    def test_create_prediction_high_risk(self):
        """Test creating a high-risk prediction"""
        prediction = Prediction.create(
            probability=0.85,
            main_factor="NPS muy bajo",
            next_best_action="Contacto urgente"
        )
        assert prediction.probability == 0.85
        assert prediction.risk_level == RiskLevel.HIGH

    def test_prediction_with_feature_importances(self):
        """Test creating prediction with feature importances"""
        importances = {
            "puntuacion_nps": 0.25,
            "tickets_soporte": 0.20,
            "dias_activos_semanales": 0.15
        }
        prediction = Prediction.create(
            probability=0.65,
            main_factor="NPS bajo",
            next_best_action="Contactar",
            feature_importances=importances
        )
        assert prediction.feature_importances == importances
        assert len(prediction.feature_importances) == 3
