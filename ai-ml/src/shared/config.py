"""
Configuración centralizada del microservicio ML
"""

from pathlib import Path
from pydantic import BaseModel


class Settings(BaseModel):
    """
    Configuración del microservicio ML.

    Usa variables de entorno para configuración en producción.
    """

    # App Info
    APP_NAME: str = "RetainAI ML Prediction Engine"
    VERSION: str = "2.0.0"
    DEBUG: bool = False

    # Model Configuration
    MODEL_PATH: Path = Path(__file__).parent.parent.parent / "data-science" / "models" / "champion" / "11_production_pipeline.pkl"

    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8080"
    ]

    # Risk Thresholds (usados en Java, pero documentados aquí)
    RISK_THRESHOLD_LOW: float = 0.25    # < 25% = Bajo
    RISK_THRESHOLD_MEDIUM: float = 0.40  # 25-40% = Medio, >40% = Alto

    class Config:
        env_file = ".env"
        case_sensitive = True


# Singleton instance
settings = Settings()
