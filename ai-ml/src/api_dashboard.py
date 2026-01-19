"""
API Endpoints para Dashboard Ejecutivo
Proporciona datos agregados para visualizaciones
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, List, Any
import pandas as pd
import numpy as np
from pathlib import Path

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# Cargar datos una vez al iniciar
DATA_PATH = Path(__file__).parent.parent / "data" / "processed" / "retain-data.csv"

# Verificar que el archivo existe
if not DATA_PATH.exists():
    raise FileNotFoundError(f"Dataset no encontrado en: {DATA_PATH}")

df = pd.read_csv(DATA_PATH)
print(f"✅ Dashboard: Dataset cargado - {len(df):,} clientes")

@router.get("/stats")
async def get_dashboard_stats() -> Dict[str, Any]:
    """
    Retorna estadísticas principales del dashboard
    """
    try:
        # Calcular métricas
        churners = df[df['Cancelacion'] == 'Si']
        total_customers = len(df)
        churn_rate = (len(churners) / total_customers) * 100
        
        # Revenue en riesgo
        revenue_at_risk = churners['CargoMensual'].sum() * 12
        
        # Clientes en riesgo (predicción del modelo)
        # Simulamos con clientes de alto riesgo
        high_risk = df[
            (df['TicketsSoporte'] >= 6) |
            (df['TipoContrato'] == 'Mensual') |
            (df['nps_categoria'] == 'Detractor')
        ]
        customers_at_risk = len(high_risk)
        
        # NPS Score promedio
        nps_score = df['PuntuacionNPS'].mean()
        
        # Trends (simulados - en producción calcular vs mes anterior)
        trends = {
            "revenue": -12,  # -12% vs mes anterior
            "churn": 2,      # +2% vs mes anterior
            "customers": 8,  # +8% vs mes anterior
            "nps": -5        # -5 puntos vs mes anterior
        }
        
        return {
            "revenue_at_risk": float(revenue_at_risk),
            "churn_rate": float(churn_rate),
            "customers_at_risk": int(customers_at_risk),
            "nps_score": float(nps_score),
            "trends": trends
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/segments")
async def get_segments() -> Dict[str, List[Dict[str, Any]]]:
    """
    Retorna análisis de segmentación
    """
    try:
        segments = []
        
        for segment in df['SegmentoCliente'].unique():
            segment_data = df[df['SegmentoCliente'] == segment]
            churners = segment_data[segment_data['Cancelacion'] == 'Si']
            
            segments.append({
                "name": segment,
                "total_customers": int(len(segment_data)),
                "revenue": float(segment_data['CargoMensual'].sum()),
                "churn_rate": float((len(churners) / len(segment_data)) * 100),
                "avg_clv": float(segment_data['CargoMensual'].mean() * segment_data['Antiguedad'].mean())
            })
        
        return {"segments": segments}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/geographic")
async def get_geographic_data() -> Dict[str, List[Dict[str, Any]]]:
    """
    Retorna datos geográficos para heatmap
    """
    try:
        boroughs = []
        
        for borough in df['Borough'].unique():
            borough_data = df[df['Borough'] == borough]
            churners = borough_data[borough_data['Cancelacion'] == 'Si']
            
            # Obtener coordenadas promedio
            avg_lat = borough_data['Latitud'].mean()
            avg_lng = borough_data['Longitud'].mean()
            
            boroughs.append({
                "name": borough,
                "churn_rate": float((len(churners) / len(borough_data)) * 100),
                "customers": int(len(borough_data)),
                "coordinates": {
                    "lat": float(avg_lat),
                    "lng": float(avg_lng)
                }
            })
        
        return {"boroughs": boroughs}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/alerts")
async def get_alerts() -> Dict[str, List[Dict[str, Any]]]:
    """
    Retorna alertas de clientes en riesgo
    """
    try:
        # Clientes críticos (6+ tickets)
        critical = df[df['TicketsSoporte'] >= 6].to_dict('records')
        
        # Clientes de alto riesgo (otros factores)
        high = df[
            (df['TipoContrato'] == 'Mensual') &
            (df['nps_categoria'] == 'Detractor')
        ].to_dict('records')
        
        # Clientes de riesgo medio
        medium = df[
            (df['Antiguedad'] <= 12) &
            (df['servicios_premium_count'] == 0)
        ].to_dict('records')
        
        return {
            "critical": critical[:100],  # Limitar a 100
            "high": high[:100],
            "medium": medium[:100]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cohorts")
async def get_cohort_analysis() -> Dict[str, List[Dict[str, Any]]]:
    """
    Retorna análisis de cohortes por antigüedad
    """
    try:
        cohorts = []
        
        for tenure_group in df['tenure_group'].unique():
            cohort_data = df[df['tenure_group'] == tenure_group]
            churners = cohort_data[cohort_data['Cancelacion'] == 'Si']
            
            cohorts.append({
                "tenure_group": tenure_group,
                "total": int(len(cohort_data)),
                "churned": int(len(churners)),
                "churn_rate": float((len(churners) / len(cohort_data)) * 100)
            })
        
        # Ordenar por antigüedad
        order = ['0-12 meses', '13-24 meses', '25-48 meses', '49+ meses']
        cohorts_sorted = sorted(cohorts, key=lambda x: order.index(x['tenure_group']))
        
        return {"cohorts": cohorts_sorted}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/engagement")
async def get_engagement_analysis() -> Dict[str, List[Dict[str, Any]]]:
    """
    Retorna análisis de engagement por servicios
    """
    try:
        engagement = []
        
        for service_count in sorted(df['servicios_premium_count'].unique()):
            service_data = df[df['servicios_premium_count'] == service_count]
            churners = service_data[service_data['Cancelacion'] == 'Si']
            
            engagement.append({
                "service_count": int(service_count),
                "customers": int(len(service_data)),
                "churn_rate": float((len(churners) / len(service_data)) * 100)
            })
        
        return {"by_services": engagement}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pricing")
async def get_price_sensitivity() -> Dict[str, List[Dict[str, Any]]]:
    """
    Retorna análisis de sensibilidad al precio
    """
    try:
        # Crear rangos de precio
        df['price_range'] = pd.cut(
            df['CargoMensual'],
            bins=[0, 30, 60, 90, 999],
            labels=['Bajo (<$30)', 'Medio ($30-60)', 'Alto ($60-90)', 'Premium ($90+)']
        )
        
        price_ranges = []
        
        for price_range in df['price_range'].unique():
            range_data = df[df['price_range'] == price_range]
            churners = range_data[range_data['Cancelacion'] == 'Si']
            
            price_ranges.append({
                "range": str(price_range),
                "customers": int(len(range_data)),
                "churn_rate": float((len(churners) / len(range_data)) * 100),
                "avg_revenue": float(range_data['CargoMensual'].mean())
            })
        
        return {"price_ranges": price_ranges}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/top-risk")
async def get_top_risk_customers(limit: int = 100) -> Dict[str, List[Dict[str, Any]]]:
    """
    Retorna top clientes en riesgo
    """
    try:
        # Calcular score de riesgo
        df['risk_score'] = (
            (df['TicketsSoporte'] / df['TicketsSoporte'].max()) * 0.3 +
            ((100 - df['PuntuacionNPS']) / 100) * 0.3 +
            (df['TipoContrato'] == 'Mensual').astype(int) * 0.2 +
            (df['Antiguedad'] <= 12).astype(int) * 0.2
        )
        
        # Ordenar por riesgo
        top_risk = df.nlargest(limit, 'risk_score')
        
        customers = []
        for _, row in top_risk.iterrows():
            # Determinar nivel de riesgo
            if row['risk_score'] >= 0.7:
                risk_level = "Critical"
            elif row['risk_score'] >= 0.5:
                risk_level = "High"
            elif row['risk_score'] >= 0.3:
                risk_level = "Medium"
            else:
                risk_level = "Low"
            
            # Factor principal
            if row['TicketsSoporte'] >= 6:
                main_factor = f"Alto soporte: {row['TicketsSoporte']} tickets"
            elif row['PuntuacionNPS'] < 50:
                main_factor = f"NPS bajo: {row['PuntuacionNPS']}"
            elif row['TipoContrato'] == 'Mensual':
                main_factor = "Contrato mensual sin compromiso"
            else:
                main_factor = "Cliente nuevo en onboarding"
            
            # Acción recomendada
            if row['TicketsSoporte'] >= 6:
                action = "Resolución prioritaria + crédito $75"
            elif row['TipoContrato'] == 'Mensual':
                action = "Ofrecer upgrade anual con 10% descuento"
            else:
                action = "Programa de onboarding mejorado"
            
            customers.append({
                "id": str(row['ClienteID']),
                "risk_level": risk_level,
                "probability": float(row['risk_score']),
                "main_factor": main_factor,
                "recommended_action": action,
                "clv": float(row['CargoMensual'] * row['Antiguedad'])
            })
        
        return {"customers": customers}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
