"""
Model Loader - Singleton para cargar el modelo ML una sola vez.

Este módulo se encarga de cargar el modelo de producción de forma eficiente,
cargándolo solo una vez y reutilizándolo en todas las predicciones.
"""

import joblib
from pathlib import Path
from typing import Any, Optional
import sys

# Importar transformers custom
from .transformers import ColumnSelector, FeatureEngineer


class ModelLoader:
    """
    Singleton para cargar y mantener el modelo ML en memoria.

    El modelo se carga solo una vez al inicializar la aplicación y se
    reutiliza en todas las predicciones subsiguientes.

    Usage:
        loader = ModelLoader()
        loader.load(model_path)
        model = loader.model
        predictions = model.predict_proba(X)
    """

    _instance: Optional['ModelLoader'] = None
    _model: Optional[Any] = None
    _feature_names: Optional[list] = None
    _model_path: Optional[Path] = None

    def __new__(cls):
        """Implementación del patrón Singleton"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def load(self, model_path: Path) -> Any:
        """
        Carga el modelo desde el path especificado.

        Args:
            model_path: Path al archivo .pkl del modelo

        Returns:
            El modelo cargado (sklearn Pipeline)

        Raises:
            FileNotFoundError: Si el archivo no existe
            RuntimeError: Si hay error al cargar el modelo
        """
        if self._model is not None and self._model_path == model_path:
            print(f"✅ Modelo ya cargado desde: {model_path}")
            return self._model

        if not model_path.exists():
            raise FileNotFoundError(
                f"Modelo no encontrado en: {model_path}"
            )

        try:
            # Asegurar que transformers custom estén en __main__
            # (requerido por joblib para deserialization pickle)
            import __main__
            __main__.ColumnSelector = ColumnSelector
            __main__.FeatureEngineer = FeatureEngineer

            # Cargar modelo
            print(f"🔄 Cargando modelo desde: {model_path}")
            self._model = joblib.load(model_path)
            self._model_path = model_path

            # Extraer nombres de features
            if hasattr(self._model, 'named_steps'):
                # Es un Pipeline
                selector = self._model.named_steps.get('selector')
                if selector and hasattr(selector, 'columns'):
                    self._feature_names = selector.columns
            else:
                self._feature_names = None

            # Log info
            print(f"✅ Modelo cargado exitosamente")
            print(f"   - Tipo: {type(self._model).__name__}")

            if hasattr(self._model, 'named_steps'):
                print(f"   - Pipeline steps: {list(self._model.named_steps.keys())}")

            if self._feature_names:
                print(f"   - Features requeridas: {len(self._feature_names)}")

            return self._model

        except Exception as e:
            raise RuntimeError(
                f"Error al cargar modelo desde {model_path}: {e}"
            ) from e

    @property
    def model(self) -> Any:
        """
        Getter del modelo cargado.

        Returns:
            El modelo ML cargado

        Raises:
            RuntimeError: Si el modelo no está cargado
        """
        if self._model is None:
            raise RuntimeError(
                "Modelo no cargado. Llama a .load(model_path) primero."
            )
        return self._model

    @property
    def feature_names(self) -> Optional[list]:
        """
        Getter de los nombres de features requeridos.

        Returns:
            Lista de nombres de features o None si no está disponible
        """
        return self._feature_names

    @property
    def is_loaded(self) -> bool:
        """
        Verifica si el modelo está cargado.

        Returns:
            True si el modelo está cargado, False en caso contrario
        """
        return self._model is not None

    def reload(self) -> Any:
        """
        Recarga el modelo desde el mismo path.

        Útil para actualizar el modelo sin reiniciar la aplicación.

        Returns:
            El modelo recargado

        Raises:
            RuntimeError: Si no hay un path de modelo previamente cargado
        """
        if self._model_path is None:
            raise RuntimeError(
                "No hay un modelo cargado previamente. "
                "Usa .load(model_path) primero."
            )

        # Forzar recarga limpiando el modelo actual
        self._model = None
        return self.load(self._model_path)

    def get_info(self) -> dict:
        """
        Obtiene información sobre el modelo cargado.

        Returns:
            Diccionario con metadata del modelo
        """
        if not self.is_loaded:
            return {"status": "No loaded"}

        info = {
            "status": "Loaded",
            "model_type": type(self._model).__name__,
            "model_path": str(self._model_path),
        }

        if hasattr(self._model, 'named_steps'):
            info["pipeline_steps"] = list(self._model.named_steps.keys())

        if self._feature_names:
            info["num_features"] = len(self._feature_names)
            info["features"] = self._feature_names

        return info
