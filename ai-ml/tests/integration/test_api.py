"""
Integration tests for API endpoints
"""

import pytest
from fastapi.testclient import TestClient

from src.main import app


@pytest.fixture
def client():
    """FastAPI test client"""
    return TestClient(app)


class TestHealthEndpoints:
    """Tests for health check endpoints"""

    def test_root_endpoint(self, client):
        """Test root endpoint returns service info"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "RetainAI ML Prediction Engine"
        assert data["version"] == "2.0.0"
        assert data["status"] == "running"

    def test_health_endpoint(self, client):
        """Test health endpoint returns model status"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "model_loaded" in data
        assert "model_info" in data

    def test_features_endpoint(self, client):
        """Test features endpoint returns model features"""
        response = client.get("/features")
        assert response.status_code == 200
        data = response.json()
        assert "features" in data
        assert "total_features" in data
        assert data["total_features"] == 23


class TestPredictionEndpoint:
    """Tests for prediction endpoint"""

    def test_predict_valid_input(self, client, sample_customer_data):
        """Test prediction with valid customer data"""
        response = client.post("/predict", json=sample_customer_data)
        assert response.status_code == 200
        data = response.json()

        assert "probability" in data
        assert "main_factor" in data
        assert "next_best_action" in data

        assert 0 <= data["probability"] <= 1
        assert isinstance(data["main_factor"], str)
        assert isinstance(data["next_best_action"], str)

    def test_predict_high_risk_customer(self, client, high_risk_customer_data):
        """Test prediction returns high probability for high-risk customer"""
        response = client.post("/predict", json=high_risk_customer_data)
        assert response.status_code == 200
        data = response.json()

        # High-risk customer should have probability > 0.4
        assert data["probability"] > 0.4

    def test_predict_low_risk_customer(self, client, low_risk_customer_data):
        """Test prediction returns low probability for low-risk customer"""
        response = client.post("/predict", json=low_risk_customer_data)
        assert response.status_code == 200
        data = response.json()

        # Low-risk customer should have probability < 0.4
        assert data["probability"] < 0.4

    def test_predict_missing_field(self, client, sample_customer_data):
        """Test prediction fails with missing required field"""
        del sample_customer_data["dias_activos_semanales"]
        response = client.post("/predict", json=sample_customer_data)
        assert response.status_code == 422

    def test_predict_invalid_field_value(self, client, sample_customer_data):
        """Test prediction fails with invalid field value"""
        sample_customer_data["dias_activos_semanales"] = 10  # Must be 0-7
        response = client.post("/predict", json=sample_customer_data)
        assert response.status_code == 422


class TestBatchPredictionEndpoint:
    """Tests for batch prediction endpoint"""

    def test_batch_predict_multiple_customers(self, client, sample_customer_data, high_risk_customer_data):
        """Test batch prediction with multiple customers"""
        customers = [sample_customer_data, high_risk_customer_data]
        response = client.post("/predict/batch", json=customers)

        assert response.status_code == 200
        data = response.json()

        assert data["total_processed"] == 2
        assert len(data["predictions"]) == 2

        for prediction in data["predictions"]:
            assert "probability" in prediction
            assert "main_factor" in prediction
            assert "next_best_action" in prediction

    def test_batch_predict_empty_list(self, client):
        """Test batch prediction with empty list"""
        response = client.post("/predict/batch", json=[])
        assert response.status_code == 200
        data = response.json()
        assert data["total_processed"] == 0
        assert len(data["predictions"]) == 0
