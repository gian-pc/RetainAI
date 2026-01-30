"""
Feature Engineering para el modelo de churn.

Este módulo contiene la lógica para crear features derivados que son
requeridos por el modelo pero no vienen en los datos crudos.
"""

import pandas as pd
from datetime import datetime


class FeatureEngineer:
    """
    Clase para aplicar feature engineering a datos de clientes.

    Features creados:
    1. intensidad_uso: conexiones_mensuales / (dias_activos_semanales * 4 + 1)
    2. ratio_carga_financiera: cargo_mensual / (ingresos_totales + 1)
    3. dias_desde_ultimo_contacto: (fecha_ref - ultimo_contacto_soporte).days
    """

    @staticmethod
    def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Aplica feature engineering a un DataFrame.

        Args:
            df: DataFrame con datos crudos de clientes

        Returns:
            DataFrame con features adicionales creados

        Features creados:
            - intensidad_uso: Mide qué tan intensivo es el uso
            - ratio_carga_financiera: Affordability del servicio
            - dias_desde_ultimo_contacto: Recencia de soporte
        """
        df = df.copy()

        # 1. Intensidad de uso
        # Conexiones por día activo (normalizado a mes)
        df['intensidad_uso'] = (
            df['conexiones_mensuales'] /
            (df['dias_activos_semanales'] * 4 + 1)  # +1 para evitar div/0
        )

        # 2. Ratio de carga financiera
        # Qué porcentaje del ingreso representa el servicio
        df['ratio_carga_financiera'] = (
            df['cargo_mensual'] /
            (df['ingresos_totales'] + 1)  # +1 para evitar div/0
        )

        # 3. Días desde último contacto con soporte
        if 'ultimo_contacto_soporte' in df.columns:
            # Convertir a datetime
            df['ultimo_contacto_soporte'] = pd.to_datetime(
                df['ultimo_contacto_soporte'],
                errors='coerce'
            )

            # Usar fecha máxima como referencia
            ref_date = df['ultimo_contacto_soporte'].max()

            # Calcular días transcurridos
            df['dias_desde_ultimo_contacto'] = (
                ref_date - df['ultimo_contacto_soporte']
            ).dt.days

            # Imputar -1 para clientes sin contacto previo
            df['dias_desde_ultimo_contacto'] = (
                df['dias_desde_ultimo_contacto'].fillna(-1)
            )

            # Eliminar columna de fecha original (no la necesita el modelo)
            df.drop(columns=['ultimo_contacto_soporte'], inplace=True)
        else:
            # Si no existe la columna, usar -1 (sin contacto)
            df['dias_desde_ultimo_contacto'] = -1

        return df

    @staticmethod
    def validate_features(df: pd.DataFrame) -> bool:
        """
        Valida que todos los features requeridos estén presentes.

        Args:
            df: DataFrame a validar

        Returns:
            True si todos los features están presentes, False si falta alguno

        Raises:
            ValueError: Si faltan features críticos
        """
        required_features = [
            'intensidad_uso',
            'ratio_carga_financiera',
            'dias_desde_ultimo_contacto'
        ]

        missing = [f for f in required_features if f not in df.columns]

        if missing:
            raise ValueError(
                f"Faltan features requeridos: {missing}. "
                "Ejecuta engineer_features() primero."
            )

        return True
