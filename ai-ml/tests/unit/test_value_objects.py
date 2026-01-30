"""
Unit tests for domain value objects
"""

import pytest

from src.domain.value_objects.risk_level import RiskLevel


class TestRiskLevel:
    """Tests for RiskLevel value object"""

    def test_risk_level_from_low_probability(self):
        """Test that probability < 0.25 returns LOW risk"""
        risk = RiskLevel.from_probability(0.20)
        assert risk == RiskLevel.LOW
        assert risk.value == "Bajo"

    def test_risk_level_from_medium_probability(self):
        """Test that probability 0.25-0.40 returns MEDIUM risk"""
        risk = RiskLevel.from_probability(0.30)
        assert risk == RiskLevel.MEDIUM
        assert risk.value == "Medio"

    def test_risk_level_from_high_probability(self):
        """Test that probability > 0.40 returns HIGH risk"""
        risk = RiskLevel.from_probability(0.75)
        assert risk == RiskLevel.HIGH
        assert risk.value == "Alto"

    def test_risk_level_boundary_low_medium(self):
        """Test boundary between LOW and MEDIUM (0.25)"""
        risk_low = RiskLevel.from_probability(0.24)
        risk_medium = RiskLevel.from_probability(0.25)
        assert risk_low == RiskLevel.LOW
        assert risk_medium == RiskLevel.MEDIUM

    def test_risk_level_boundary_medium_high(self):
        """Test boundary between MEDIUM and HIGH (0.40)"""
        risk_medium = RiskLevel.from_probability(0.39)
        risk_high = RiskLevel.from_probability(0.40)
        assert risk_medium == RiskLevel.MEDIUM
        assert risk_high == RiskLevel.HIGH

    def test_risk_level_zero_probability(self):
        """Test that probability 0 returns LOW risk"""
        risk = RiskLevel.from_probability(0.0)
        assert risk == RiskLevel.LOW

    def test_risk_level_max_probability(self):
        """Test that probability 1.0 returns HIGH risk"""
        risk = RiskLevel.from_probability(1.0)
        assert risk == RiskLevel.HIGH
