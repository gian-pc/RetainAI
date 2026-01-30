"""
Excepciones custom del microservicio ML
"""


class MLServiceException(Exception):
    """Excepción base para el microservicio ML"""
    pass


class ModelNotLoadedException(MLServiceException):
    """El modelo no está cargado en memoria"""
    pass


class ModelLoadError(MLServiceException):
    """Error al cargar el modelo desde disco"""
    pass


class PredictionError(MLServiceException):
    """Error durante la predicción"""
    pass


class FeatureEngineeringError(MLServiceException):
    """Error durante feature engineering"""
    pass


class ValidationError(MLServiceException):
    """Error de validación de datos de entrada"""
    pass
