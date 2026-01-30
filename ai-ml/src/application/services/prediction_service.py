"""
Prediction Service - Servicio para realizar predicciones de churn.
"""

import pandas as pd
import numpy as np
from typing import List

from src.domain.entities.prediction import Prediction
from src.infrastructure.ml.model_loader import ModelLoader
from src.infrastructure.ml.feature_engineering import FeatureEngineer
from src.schemas.request import PredictionInput
from src.shared.exceptions import PredictionError, ModelNotLoadedException


class PredictionService:
    """
    Servicio de aplicación para predicciones de churn.

    Orquesta:
    - Feature engineering
    - Carga del modelo
    - Predicción
    - Creación de la entidad Prediction del dominio
    """

    def __init__(self):
        """Inicializa el servicio con el modelo loader"""
        self.model_loader = ModelLoader()
        self.feature_engineer = FeatureEngineer()

    def _codigo_postal_to_numeric(self, codigo_postal: str) -> float:
        """
        Convierte código postal a numérico.

        Args:
            codigo_postal: Código postal como string

        Returns:
            Código postal como float
        """
        try:
            return float(codigo_postal.replace('-', '').replace(' ', ''))
        except (ValueError, AttributeError):
            # Si falla la conversión, usar 0
            return 0.0

    def _prepare_dataframe(self, data: PredictionInput) -> pd.DataFrame:
        """
        Prepara un DataFrame desde PredictionInput.

        Args:
            data: DTO de entrada

        Returns:
            DataFrame listo para el modelo
        """
        # Convertir Pydantic model a dict
        data_dict = data.model_dump()

        # Convertir código postal
        data_dict['codigo_postal'] = self._codigo_postal_to_numeric(
            data_dict['codigo_postal']
        )

        # Crear DataFrame
        df = pd.DataFrame([data_dict])

        return df

    def predict_single(
        self,
        data: PredictionInput
    ) -> tuple[float, np.ndarray]:
        """
        Realiza una predicción individual.

        Args:
            data: DTO con datos del cliente

        Returns:
            Tuple de (probability, probabilities_array)

        Raises:
            ModelNotLoadedException: Si el modelo no está cargado
            PredictionError: Si ocurre error durante la predicción
        """
        if not self.model_loader.is_loaded:
            raise ModelNotLoadedException(
                "El modelo no está cargado. "
                "Asegúrate de llamar a load_model() al inicio."
            )

        try:
            # Preparar DataFrame
            df = self._prepare_dataframe(data)

            # Hacer predicción
            model = self.model_loader.model
            probabilities = model.predict_proba(df)[0]

            # Probabilidad de churn (clase positiva)
            probability = probabilities[1]

            return probability, probabilities

        except Exception as e:
            raise PredictionError(
                f"Error durante la predicción: {str(e)}"
            ) from e

    def predict_batch(
        self,
        customers: List[PredictionInput]
    ) -> List[tuple[float, np.ndarray]]:
        """
        Realiza predicciones en batch.

        Args:
            customers: Lista de DTOs con datos de clientes

        Returns:
            Lista de tuples (probability, probabilities_array)

        Raises:
            ModelNotLoadedException: Si el modelo no está cargado
            PredictionError: Si ocurre error durante la predicción
        """
        if not self.model_loader.is_loaded:
            raise ModelNotLoadedException(
                "El modelo no está cargado"
            )

        try:
            # Convertir todos los inputs a dicts
            customer_dicts = []
            for customer in customers:
                data_dict = customer.model_dump()
                data_dict['codigo_postal'] = self._codigo_postal_to_numeric(
                    data_dict['codigo_postal']
                )
                customer_dicts.append(data_dict)

            # Crear DataFrame
            df = pd.DataFrame(customer_dicts)

            # Hacer predicciones batch (MUCHO más rápido)
            model = self.model_loader.model
            probabilities = model.predict_proba(df)

            # Retornar lista de tuples
            results = []
            for probs in probabilities:
                probability = probs[1]
                results.append((probability, probs))

            return results

        except Exception as e:
            raise PredictionError(
                f"Error durante predicción batch: {str(e)}"
            ) from e

    def get_feature_importances(self) -> dict:
        """
        Obtiene las importancias de features del modelo.

        Returns:
            Diccionario {feature_name: importance}

        Raises:
            ModelNotLoadedException: Si el modelo no está cargado
        """
        if not self.model_loader.is_loaded:
            raise ModelNotLoadedException("El modelo no está cargado")

        model = self.model_loader.model

        # Obtener el modelo RandomForest del pipeline
        if hasattr(model, 'named_steps'):
            rf_model = model.named_steps.get('model')
            selector = model.named_steps.get('selector')

            if rf_model and hasattr(rf_model, 'feature_importances_'):
                importances = rf_model.feature_importances_
                feature_names = selector.columns if selector else []

                return dict(zip(feature_names, importances))

        return {}
