"""
Unit tests for schemas (DTOs)
"""

import pytest
from pydantic import ValidationError

from src.schemas.request import PredictionInput
from src.schemas.response import PredictionOutput


class TestPredictionInput:
    """Tests for PredictionInput DTO"""

    def test_valid_input(self, sample_customer_data):
        """Test that valid data creates a PredictionInput instance"""
        input_dto = PredictionInput(**sample_customer_data)
        assert input_dto.dias_activos_semanales == 5
        assert input_dto.puntuacion_nps == 75.0
        assert input_dto.codigo_postal == "10001"

    def test_invalid_dias_activos_semanales(self, sample_customer_data):
        """Test that dias_activos_semanales must be between 0-7"""
        sample_customer_data["dias_activos_semanales"] = 10
        with pytest.raises(ValidationError):
            PredictionInput(**sample_customer_data)

    def test_invalid_nps_range(self, sample_customer_data):
        """Test that NPS must be between 0-100"""
        sample_customer_data["puntuacion_nps"] = 150
        with pytest.raises(ValidationError):
            PredictionInput(**sample_customer_data)

    def test_invalid_csat_range(self, sample_customer_data):
        """Test that CSAT must be between 1-5"""
        sample_customer_data["puntuacion_csat"] = 6.0
        with pytest.raises(ValidationError):
            PredictionInput(**sample_customer_data)

    def test_negative_cargo_mensual(self, sample_customer_data):
        """Test that cargo_mensual cannot be negative"""
        sample_customer_data["cargo_mensual"] = -10.0
        with pytest.raises(ValidationError):
            PredictionInput(**sample_customer_data)

    def test_missing_required_field(self, sample_customer_data):
        """Test that missing required fields raise ValidationError"""
        del sample_customer_data["dias_activos_semanales"]
        with pytest.raises(ValidationError):
            PredictionInput(**sample_customer_data)


class TestPredictionOutput:
    """Tests for PredictionOutput DTO"""

    def test_valid_output(self):
        """Test that valid data creates a PredictionOutput instance"""
        output = PredictionOutput(
            probability=0.75,
            main_factor="NPS Bajo",
            next_best_action="Contactar al cliente"
        )
        assert output.probability == 0.75
        assert output.main_factor == "NPS Bajo"
        assert output.next_best_action == "Contactar al cliente"

    def test_probability_range(self):
        """Test that probability must be between 0 and 1"""
        with pytest.raises(ValidationError):
            PredictionOutput(
                probability=1.5,
                main_factor="Test",
                next_best_action="Test"
            )

    def test_negative_probability(self):
        """Test that probability cannot be negative"""
        with pytest.raises(ValidationError):
            PredictionOutput(
                probability=-0.1,
                main_factor="Test",
                next_best_action="Test"
            )
