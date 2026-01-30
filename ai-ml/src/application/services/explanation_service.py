"""
Explanation Service - Servicio de Explicabilidad (XAI).

Refactorizado desde xai_utils.py para seguir arquitectura de servicios.
"""

from typing import Dict, Tuple, List
import numpy as np

from src.schemas.request import PredictionInput
from src.application.services.prediction_service import PredictionService


class ExplanationService:
    """
    Servicio para generar explicaciones de predicciones (XAI).

    Proporciona:
    - Identificación del factor principal de riesgo
    - Generación de acciones recomendadas
    - Explicaciones human-readable
    """

    def __init__(self, prediction_service: PredictionService):
        """
        Inicializa el servicio de explicabilidad.

        Args:
            prediction_service: Servicio de predicción (para obtener importances)
        """
        self.prediction_service = prediction_service

    def _get_feature_explanations(
        self,
        feature_name: str,
        feature_value: float
    ) -> str:
        """
        Genera explicación human-readable para un feature.

        Args:
            feature_name: Nombre del feature
            feature_value: Valor del feature

        Returns:
            Explicación en texto
        """
        explanations = {
            'dias_activos_semanales': f"Días activos: {feature_value:.0f}/7 días",
            'promedio_conexion': f"Conexión promedio: {feature_value:.1f} min",
            'conexiones_mensuales': f"Conexiones al mes: {int(feature_value)}",
            'caracteristicas_usadas': f"Features usadas: {int(feature_value)}",
            'dias_ultima_conexion': f"Días sin conectarse: {int(feature_value)}",
            'intensidad_uso': f"Intensidad de uso: {feature_value:.2f}",
            'tickets_soporte': f"Tickets de soporte: {int(feature_value)}",
            'puntuacion_nps': f"NPS: {feature_value:.0f}/100",
            'tasa_crecimiento_uso': f"Crecimiento en uso: {feature_value:+.1f}%",
            'puntuacion_csat': f"CSAT: {feature_value:.1f}/5",
            'ratio_carga_financiera': f"Carga financiera: {feature_value:.2%}",
            'tasa_apertura_email': f"Apertura emails: {feature_value:.0%}",
            'errores_pago': f"Errores de pago: {int(feature_value)}",
            'antiguedad': f"Antigüedad: {int(feature_value)} meses",
            'ingresos_totales': f"Ingresos totales: ${feature_value:,.2f}",
            'cargo_mensual': f"Cargo mensual: ${feature_value:.2f}",
            'tiempo_resolucion': f"Tiempo resolución: {feature_value:.1f}h",
            'edad': f"Edad: {int(feature_value)} años",
            'dias_desde_ultimo_contacto': f"Días desde contacto: {int(feature_value)}",
            'tiempo_sesion_promedio': f"Sesión promedio: {feature_value:.1f} min",
        }

        return explanations.get(
            feature_name,
            f"{feature_name}: {feature_value:.2f}"
        )

    def _select_best_actionable_factor(
        self,
        feature_importances_list: List[Tuple[str, float, float]],
        input_data: Dict
    ) -> Tuple[str, float, str]:
        """
        Selecciona el factor más accionable.

        Prioriza factores que la empresa puede controlar.

        Args:
            feature_importances_list: Lista de (feature, importance, value)
            input_data: Datos de entrada del cliente

        Returns:
            Tuple de (feature_name, combined_score, explanation)
        """
        # Prioridad de accionabilidad (mayor = más accionable)
        priority_map = {
            'puntuacion_nps': 100,  # Muy accionable
            'puntuacion_csat': 100,
            'tickets_soporte': 90,
            'tiempo_resolucion': 90,
            'dias_ultima_conexion': 80,
            'dias_activos_semanales': 80,
            'tasa_apertura_email': 70,
            'conexiones_mensuales': 70,
            'cargo_mensual': 60,
            'ratio_carga_financiera': 60,
            'errores_pago': 60,
            'dias_desde_ultimo_contacto': 80,
            'tiempo_sesion_promedio': 70,
        }

        # Calcular score combinado: importance * priority * abs(value)
        scored_features = []
        for feat, importance, value in feature_importances_list[:10]:  # Top 10
            priority = priority_map.get(feat, 10)  # Default priority baja
            combined_score = importance * priority * abs(value)

            explanation = self._get_feature_explanations(feat, value)
            scored_features.append((feat, combined_score, explanation))

        # Ordenar por score combinado
        scored_features.sort(key=lambda x: x[1], reverse=True)

        if scored_features:
            return scored_features[0]  # Mejor factor accionable
        else:
            return ("unknown", 0.0, "No hay factores identificables")

    def explain(
        self,
        probability: float,
        data: PredictionInput
    ) -> Tuple[str, str]:
        """
        Genera explicación completa de la predicción.

        Args:
            probability: Probabilidad de churn
            data: Datos de entrada del cliente

        Returns:
            Tuple de (main_factor, next_best_action)
        """
        # Obtener feature importances del modelo
        feature_importances_dict = (
            self.prediction_service.get_feature_importances()
        )

        # Convertir input data a dict
        input_dict = data.model_dump()

        # Crear lista de (feature, importance, value)
        feature_importances_list = []
        for feature, importance in feature_importances_dict.items():
            value = input_dict.get(feature, 0)
            feature_importances_list.append((feature, importance, value))

        # Ordenar por importancia
        feature_importances_list.sort(key=lambda x: x[1], reverse=True)

        # Seleccionar mejor factor accionable
        best_feature, score, explanation = self._select_best_actionable_factor(
            feature_importances_list,
            input_dict
        )

        # Generar main_factor
        main_factor = explanation

        # Generar next_best_action basado en el factor
        next_best_action = self._generate_action(
            best_feature,
            input_dict.get(best_feature, 0),
            probability
        )

        return main_factor, next_best_action

    def _generate_action(
        self,
        feature_name: str,
        feature_value: float,
        probability: float
    ) -> str:
        """
        Genera acción recomendada basada en el factor principal.

        Args:
            feature_name: Nombre del feature principal
            feature_value: Valor del feature
            probability: Probabilidad de churn

        Returns:
            Acción recomendada
        """
        # Acciones específicas por feature
        actions = {
            'puntuacion_nps': self._action_nps,
            'puntuacion_csat': self._action_csat,
            'tickets_soporte': self._action_tickets,
            'tiempo_resolucion': self._action_tiempo_resolucion,
            'dias_ultima_conexion': self._action_dias_conexion,
            'cargo_mensual': self._action_cargo,
            'errores_pago': self._action_errores_pago,
        }

        # Obtener acción específica o usar genérica
        action_func = actions.get(feature_name, self._action_generic)
        return action_func(feature_value, probability)

    def _action_nps(self, value: float, prob: float) -> str:
        if value < 30:
            return "Contacto urgente para entender insatisfacción y ofrecer solución personalizada"
        elif value < 50:
            return "Encuesta de satisfacción y oferta de mejora del servicio"
        else:
            return "Mantener calidad del servicio y considerar programa de lealtad"

    def _action_csat(self, value: float, prob: float) -> str:
        if value < 3:
            return "Llamada de gerente para resolver problemas y ofrecer compensación"
        elif value < 4:
            return "Seguimiento proactivo y mejora de experiencia"
        else:
            return "Solicitar feedback para mantener satisfacción"

    def _action_tickets(self, value: float, prob: float) -> str:
        if value > 5:
            return "Revisión de cuenta por equipo especializado y resolución prioritaria"
        elif value > 2:
            return "Seguimiento de tickets pendientes y mejora de soporte"
        else:
            return "Mantener calidad de soporte"

    def _action_tiempo_resolucion(self, value: float, prob: float) -> str:
        if value > 48:
            return "Escalamiento inmediato y asignación de técnico dedicado"
        elif value > 24:
            return "Priorizar resolución y seguimiento cercano"
        else:
            return "Mantener eficiencia en resolución"

    def _action_dias_conexion(self, value: float, prob: float) -> str:
        if value > 14:
            return "Email personalizado ofreciendo asistencia y descuento temporal"
        elif value > 7:
            return "Notificación con recordatorio de valor del servicio"
        else:
            return "Mantener engagement con contenido relevante"

    def _action_cargo(self, value: float, prob: float) -> str:
        if value > 100:
            return "Oferta de plan más económico o descuento por lealtad"
        elif value > 75:
            return "Revisión de plan y optimización de costos"
        else:
            return "Informar sobre valor recibido vs precio pagado"

    def _action_errores_pago(self, value: float, prob: float) -> str:
        if value > 2:
            return "Contacto de cobranza con opciones de pago flexibles"
        elif value > 0:
            return "Recordatorio amigable y oferta de auto-pago"
        else:
            return "Reconocer buen historial de pago"

    def _action_generic(self, value: float, prob: float) -> str:
        if prob > 0.6:
            return "Contactar proactivamente para entender necesidades y ofrecer mejoras"
        elif prob > 0.4:
            return "Seguimiento preventivo y oferta de optimización del servicio"
        else:
            return "Mantener comunicación regular y monitorear satisfacción"
