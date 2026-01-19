"""
Utilidades para explicación de IA (XAI) sin código hardcodeado.
TODO viene del modelo (feature importance + scaled values).
"""

def select_main_factor_intelligent(feature_contributions: list, input_dict: dict) -> tuple:
    """
    Selecciona el factor principal usando scoring multi-criterio.
    
    Criterios (en orden de relevancia):
    1. Quejas activas (muy accionable)
    2. Alto volumen de tickets (problema operacional)
    3. CSAT muy bajo (insatisfacción crítica)
    4. NPS bajo (riesgo de boca-a-boca negativo)
    5. Engagement muy bajo (cliente desconectado)
    6. Otros factores por contribution
    
    Returns: (feature_name, contribution, scaled_value, original_value, importance)
    """
    if not feature_contributions:
        return None
    
    # SCORING: Asignar puntos a cada factor según relevancia
    scored_factors = []
    
    for feat, contrib, val_scaled, val_orig, importance in feature_contributions:
        score = contrib  # Base score = contribution
        
        # BOOST 1: Quejas activas (+50% priority)
        if 'TipoDeQueja' in feat and val_orig > 0 and 'Ninguna' not in feat:
            score *= 1.5
        elif 'has_queja' in feat and val_orig > 0:
            score *= 1.5
        
        # BOOST 2: Alto volumen de tickets (+40% priority)
        elif 'alto_tickets' in feat and val_orig > 0:
            score *= 1.4
        elif 'TicketsSoporte' in feat and abs(val_scaled) > 1.0:
            score *= 1.4
        
        # BOOST 3: CSAT muy bajo (+30% priority si scaled < -1.0)
        elif 'PuntuacionCSAT' in feat and val_scaled < -1.0:
            score *= 1.3
        elif 'csat_categoria_Insatisfecho' in feat and val_orig > 0:
            score *= 1.3
        
        # BOOST 4: NPS bajo (+20% priority si scaled < -1.0)
        elif 'PuntuacionNPS' in feat and val_scaled < -1.0:
            score *= 1.2
        elif 'nps_categoria_Detractor' in feat and val_orig > 0:
            score *= 1.2
        
        # BOOST 5: Engagement muy bajo (+25% priority)
        elif 'TasaAperturaEmail' in feat and val_scaled < -1.0:
            score *= 1.25
        
        # BOOST 6: Escaladas (+35% priority)
        elif 'Escaladas' in feat and val_orig > 0:
            score *= 1.35
        
        scored_factors.append((feat, contrib, val_scaled, val_orig, importance, score))
    
    # Ordenar por score descendente
    scored_factors.sort(key=lambda x: x[5], reverse=True)
    
    # Retornar el de mayor score
    best = scored_factors[0]
    return (best[0], best[1], best[2], best[3], best[4])


def generate_explanation(feature_name: str, scaled_value: float, original_value: float, input_data: dict) -> str:
    """
    Genera explicación basada SOLO en scaled_value del modelo (no umbrales hardcodeados).

    scaled_value > 1.0 = valor alto (por encima media)
    scaled_value < -1.0 = valor bajo (por debajo media)
    """

    # Determinar nivel basado en scaled_value
    if abs(scaled_value) > 2.0:
        nivel = "muy alto" if scaled_value > 0 else "muy bajo"
    elif abs(scaled_value) > 1.0:
        nivel = "alto" if scaled_value > 0 else "bajo"
    else:
        nivel = "normal"

    # Features comportamentales (los más importantes)
    if "PuntuacionNPS" in feature_name:
        nps = input_data.get('PuntuacionNPS', 0)
        return f"NPS {nivel}: {nps:.0f}/100"

    elif "PuntuacionCSAT" in feature_name:
        csat = input_data.get('PuntuacionCSAT', 0)
        return f"CSAT {nivel}: {csat:.1f}/5.0"

    elif "TicketsSoporte" in feature_name:
        tickets = int(input_data.get('TicketsSoporte', 0))
        return f"Tickets {nivel}: {tickets} reportados"

    elif "CargoMensual" in feature_name:
        cargo = input_data.get('CargoMensual', 0)
        return f"Precio {nivel}: ${cargo:.2f}/mes"

    elif "Antiguedad" in feature_name:
        meses = input_data.get('Antiguedad', 0)
        return f"Antigüedad {nivel}: {meses} meses"

    elif "ratio_precio_ingreso" in feature_name:
        ratio = input_data.get('ratio_precio_ingreso', 0)
        cargo = input_data.get('CargoMensual', 0)
        ingreso = input_data.get('IngresoMediano', 0)
        return f"Impacto precio {nivel}: {ratio:.1%} (${cargo:.0f}/${ingreso:,.0f})"

    elif "Escaladas" in feature_name:
        esc = int(input_data.get('Escaladas', 0))
        return f"Escalaciones {nivel}: {esc}"

    elif "TiempoResolucion" in feature_name:
        tiempo = input_data.get('TiempoResolucion', 0)
        return f"Tiempo resolución {nivel}: {tiempo:.1f}h"

    elif "TasaAperturaEmail" in feature_name:
        tasa = input_data.get('TasaAperturaEmail', 0)
        return f"Engagement {nivel}: {tasa:.0%}"

    # Features categóricos
    elif "TipoContrato_" in feature_name:
        return feature_name.replace("TipoContrato_", "Contrato: ")

    elif "csat_categoria_" in feature_name:
        cat = feature_name.replace("csat_categoria_", "")
        csat = input_data.get('PuntuacionCSAT', 0)
        return f"CSAT: {cat} ({csat:.1f}/5.0)"

    elif "nps_categoria_" in feature_name:
        cat = feature_name.replace("nps_categoria_", "")
        nps = input_data.get('PuntuacionNPS', 0)
        return f"NPS: {cat} ({nps:.0f}/100)"

    elif "TipoDeQueja_" in feature_name:
        queja = feature_name.replace("TipoDeQueja_", "")
        return f"Queja: {queja}"

    elif "has_queja" in feature_name:
        tipo = input_data.get('TipoDeQueja', 'No especificada')
        return f"Queja activa: {tipo}" if original_value > 0 else "Sin quejas"

    elif "alto_tickets" in feature_name:
        tickets = int(input_data.get('TicketsSoporte', 0))
        return f"Alto volumen: {tickets} tickets" if original_value > 0 else f"Volumen normal: {tickets}"

    # Default: nombre limpio + valor
    else:
        clean_name = feature_name.replace("_", " ").title()
        return f"{clean_name}: {original_value:.2f}"


def generate_action(main_factor_explanation: str, input_data: dict) -> str:
    """
    Genera acción SOLO basada en la explicación del main_factor (ya determinada por el modelo).
    NO usa umbrales - el main_factor ya contiene el diagnóstico.
    """
    factor_lower = main_factor_explanation.lower()
    segmento = input_data.get('SegmentoCliente', 'Residencial')

    # Mapeo simple: factor detectado → acción
    if "nps" in factor_lower and ("bajo" in factor_lower or "muy bajo" in factor_lower):
        return f"Contacto prioritario por baja satisfacción: {main_factor_explanation}"

    elif "csat" in factor_lower and ("bajo" in factor_lower or "muy bajo" in factor_lower):
        return f"Escalación por experiencia negativa: {main_factor_explanation}"

    elif "tickets" in factor_lower and ("alto" in factor_lower or "muy alto" in factor_lower):
        return f"Revisión urgente de soporte: {main_factor_explanation}"

    elif "queja" in factor_lower:
        tipo_queja = input_data.get('TipoDeQueja', 'No especificada')
        return f"Atención inmediata a queja ({tipo_queja}): {main_factor_explanation}"

    elif "precio" in factor_lower and ("alto" in factor_lower or "muy alto" in factor_lower):
        return f"Revisión comercial de pricing: {main_factor_explanation}"

    elif "contrato" in factor_lower and "mensual" in factor_lower:
        return f"Propuesta de fidelización con contrato anual: {main_factor_explanation}"

    elif "antigüedad" in factor_lower and ("baja" in factor_lower or "muy baja" in factor_lower):
        return f"Programa de onboarding intensivo: {main_factor_explanation}"

    elif "engagement" in factor_lower and ("bajo" in factor_lower or "muy bajo" in factor_lower):
        return f"Campaña de reactivación: {main_factor_explanation}"

    # Default: acción genérica basada en segmento
    else:
        if segmento == 'Corporativo':
            return f"Gestión ejecutiva prioritaria: {main_factor_explanation}"
        elif segmento == 'PYME':
            return f"Atención comercial personalizada: {main_factor_explanation}"
        else:
            return f"Contacto proactivo de retención: {main_factor_explanation}"
