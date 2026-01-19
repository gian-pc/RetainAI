"""
Pipeline ETL para RetainAI
Limpieza, validación y transformación de datos de clientes
"""
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RetainAIETL:
    """
    Pipeline ETL para procesar datos de clientes nuevos o sucios.
    Maneja: limpieza, validación, imputación y transformación.
    """
    
    def __init__(self):
        """Inicializa el pipeline con valores por defecto"""
        # Valores por defecto para imputación
        self.defaults = {
            # Numéricos
            'Antiguedad': 0,
            'CargoMensual': 0.0,
            'CargosTotal': 0.0,
            'IngresoMediano': 50000.0,  # Mediana nacional
            'DensidadPoblacional': 10000.0,
            'TicketsSoporte': 0,
            'Escaladas': 0,
            'TiempoResolucion': 24.0,  # 24 horas default
            'PuntuacionNPS': 50.0,  # Neutral
            'PuntuacionCSAT': 3.0,  # Neutral
            'TasaAperturaEmail': 0.3,  # 30% default
            'borough_risk': 20.0,  # Riesgo medio
            'servicios_premium_count': 0,
            'ratio_precio_ingreso': 0.01,
            
            # Categóricos
            'Genero': 'Masculino',
            'TienePareja': 'No',
            'TieneDependientes': 'No',
            'ServicioTelefono': 'Si',
            'LineasMultiples': 'No',
            'TipoInternet': 'Fibra óptica',
            'SeguridadOnline': 'No',
            'RespaldoOnline': 'No',
            'ProteccionDispositivo': 'No',
            'SoporteTecnico': 'No',
            'StreamingTV': 'No',
            'StreamingPeliculas': 'No',
            'TipoContrato': 'Mensual',
            'FacturacionSinPapel': 'Si',
            'MetodoPago': 'Cheque electrónico',
            'SegmentoCliente': 'Residencial',
            'TipoDeQueja': 'Ninguna',
            
            # Binarios
            'EsMayor': 0,
            'has_queja': 0,
            'alto_tickets': 0,
            'high_density_area': 0,
        }
        
        # Mapeos de valores válidos
        self.valid_values = {
            'Genero': ['Masculino', 'Femenino'],
            'TienePareja': ['Si', 'No'],
            'TieneDependientes': ['Si', 'No'],
            'ServicioTelefono': ['Si', 'No'],
            'LineasMultiples': ['Si', 'No', 'Sin servicio'],
            'TipoInternet': ['DSL', 'Fibra óptica', 'No'],
            'SeguridadOnline': ['Si', 'No', 'No internet service'],
            'RespaldoOnline': ['Si', 'No', 'No internet service'],
            'ProteccionDispositivo': ['Si', 'No', 'No internet service'],
            'SoporteTecnico': ['Si', 'No', 'No internet service'],
            'StreamingTV': ['Si', 'No', 'No internet service'],
            'StreamingPeliculas': ['Si', 'No', 'No internet service'],
            'TipoContrato': ['Mensual', 'Un año', 'Dos años'],
            'FacturacionSinPapel': ['Si', 'No'],
            'MetodoPago': ['Cheque electrónico', 'Cheque por correo', 'Transferencia bancaria', 'Tarjeta de crédito'],
            'SegmentoCliente': ['Residencial', 'PYME', 'Corporativo'],
            'TipoDeQueja': ['Ninguna', 'Red', 'Facturacion', 'Precio', 'Servicio'],
        }
    
    def clean_string(self, value: Any) -> str:
        """Limpia strings: trim, capitalización, etc."""
        if pd.isna(value) or value is None:
            return None
        
        # Convertir a string y limpiar
        value = str(value).strip()
        
        # Eliminar espacios múltiples
        value = ' '.join(value.split())
        
        return value
    
    def clean_numeric(self, value: Any, field_name: str) -> float:
        """Limpia valores numéricos"""
        if pd.isna(value) or value is None or value == '':
            return None
        
        try:
            # Intentar convertir a float
            numeric_value = float(value)
            
            # Validar rangos lógicos
            if field_name == 'Antiguedad' and numeric_value < 0:
                logger.warning(f"Antiguedad negativa: {numeric_value}, usando 0")
                return 0.0
            
            if field_name in ['CargoMensual', 'CargosTotal'] and numeric_value < 0:
                logger.warning(f"{field_name} negativo: {numeric_value}, usando 0")
                return 0.0
            
            if field_name in ['PuntuacionNPS'] and (numeric_value < 0 or numeric_value > 100):
                logger.warning(f"NPS fuera de rango: {numeric_value}, usando 50")
                return 50.0
            
            if field_name in ['PuntuacionCSAT'] and (numeric_value < 1 or numeric_value > 5):
                logger.warning(f"CSAT fuera de rango: {numeric_value}, usando 3")
                return 3.0
            
            if field_name in ['TasaAperturaEmail'] and (numeric_value < 0 or numeric_value > 1):
                logger.warning(f"Tasa fuera de rango: {numeric_value}, normalizando")
                return min(max(numeric_value, 0), 1)
            
            return numeric_value
            
        except (ValueError, TypeError):
            logger.warning(f"No se pudo convertir '{value}' a numérico para {field_name}")
            return None
    
    def validate_categorical(self, value: Any, field_name: str) -> str:
        """Valida y normaliza valores categóricos"""
        if pd.isna(value) or value is None:
            return None
        
        value = self.clean_string(value)
        
        # Si el campo tiene valores válidos definidos
        if field_name in self.valid_values:
            valid_vals = self.valid_values[field_name]
            
            # Buscar coincidencia case-insensitive
            value_lower = value.lower()
            for valid_val in valid_vals:
                if valid_val.lower() == value_lower:
                    return valid_val
            
            # Si no coincide, usar default
            logger.warning(f"Valor inválido '{value}' para {field_name}, usando default")
            return None
        
        return value
    
    def derive_features(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Deriva features calculados a partir de datos base"""
        
        # tenure_group
        antiguedad = data.get('Antiguedad', 0)
        if antiguedad <= 12:
            data['tenure_group'] = '0-12 meses'
        elif antiguedad <= 24:
            data['tenure_group'] = '13-24 meses'
        elif antiguedad <= 48:
            data['tenure_group'] = '25-48 meses'
        else:
            data['tenure_group'] = '49+ meses'
        
        # income_bracket
        ingreso = data.get('IngresoMediano', 50000)
        if ingreso < 50000:
            data['income_bracket'] = 'Low'
        elif ingreso < 80000:
            data['income_bracket'] = 'Medium'
        else:
            data['income_bracket'] = 'High'
        
        # nps_categoria
        nps = data.get('PuntuacionNPS', 50)
        if nps < 50:
            data['nps_categoria'] = 'Detractor'
        elif nps < 70:
            data['nps_categoria'] = 'Pasivo'
        else:
            data['nps_categoria'] = 'Promotor'
        
        # csat_categoria
        csat = data.get('PuntuacionCSAT', 3.0)
        if csat < 3.0:
            data['csat_categoria'] = 'Insatisfecho'
        elif csat < 4.0:
            data['csat_categoria'] = 'Neutral'
        else:
            data['csat_categoria'] = 'Satisfecho'
        
        # has_queja
        tipo_queja = data.get('TipoDeQueja', 'Ninguna')
        data['has_queja'] = 0 if tipo_queja == 'Ninguna' else 1
        
        # alto_tickets
        tickets = data.get('TicketsSoporte', 0)
        data['alto_tickets'] = 1 if tickets >= 5 else 0
        
        # high_density_area
        densidad = data.get('DensidadPoblacional', 10000)
        data['high_density_area'] = 1 if densidad > 30000 else 0
        
        # ratio_precio_ingreso
        cargo = data.get('CargoMensual', 0)
        ingreso = data.get('IngresoMediano', 50000)
        data['ratio_precio_ingreso'] = (cargo * 12) / ingreso if ingreso > 0 else 0.01
        
        # servicios_premium_count
        servicios = [
            data.get('SeguridadOnline') == 'Si',
            data.get('RespaldoOnline') == 'Si',
            data.get('ProteccionDispositivo') == 'Si',
            data.get('SoporteTecnico') == 'Si',
            data.get('StreamingTV') == 'Si',
            data.get('StreamingPeliculas') == 'Si',
        ]
        data['servicios_premium_count'] = sum(servicios)
        
        return data
    
    def process(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Procesa datos crudos y retorna datos limpios y validados.
        
        Args:
            raw_data: Diccionario con datos crudos del cliente
            
        Returns:
            Diccionario con datos limpios y validados
        """
        logger.info("🔄 Iniciando pipeline ETL...")
        
        cleaned_data = {}
        
        # 1. Limpiar y validar cada campo
        for field, value in raw_data.items():
            # Determinar tipo de campo
            if field in ['EsMayor', 'has_queja', 'alto_tickets', 'high_density_area']:
                # Binarios
                if pd.isna(value) or value is None:
                    cleaned_data[field] = self.defaults.get(field, 0)
                else:
                    cleaned_data[field] = 1 if value in [1, '1', 'Si', 'Yes', True] else 0
            
            elif field in ['Antiguedad', 'CargoMensual', 'CargosTotal', 'IngresoMediano', 
                          'DensidadPoblacional', 'TicketsSoporte', 'Escaladas', 
                          'TiempoResolucion', 'PuntuacionNPS', 'PuntuacionCSAT', 
                          'TasaAperturaEmail', 'borough_risk', 'servicios_premium_count',
                          'ratio_precio_ingreso']:
                # Numéricos
                cleaned_value = self.clean_numeric(value, field)
                if cleaned_value is None:
                    cleaned_data[field] = self.defaults.get(field, 0.0)
                else:
                    cleaned_data[field] = cleaned_value
            
            else:
                # Categóricos
                cleaned_value = self.validate_categorical(value, field)
                if cleaned_value is None:
                    cleaned_data[field] = self.defaults.get(field, 'Unknown')
                else:
                    cleaned_data[field] = cleaned_value
        
        # 2. Asegurar que todos los campos requeridos existen
        for field, default_value in self.defaults.items():
            if field not in cleaned_data:
                logger.warning(f"Campo faltante: {field}, usando default: {default_value}")
                cleaned_data[field] = default_value
        
        # 3. Derivar features calculados
        cleaned_data = self.derive_features(cleaned_data)
        
        logger.info(f"✅ ETL completado. {len(cleaned_data)} campos procesados")
        
        return cleaned_data
    
    def process_batch(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Procesa un DataFrame completo de clientes.
        
        Args:
            df: DataFrame con datos crudos
            
        Returns:
            DataFrame limpio y validado
        """
        logger.info(f"🔄 Procesando batch de {len(df)} clientes...")
        
        cleaned_records = []
        for idx, row in df.iterrows():
            try:
                cleaned = self.process(row.to_dict())
                cleaned_records.append(cleaned)
            except Exception as e:
                logger.error(f"Error procesando fila {idx}: {e}")
                # Continuar con siguiente registro
                continue
        
        df_cleaned = pd.DataFrame(cleaned_records)
        logger.info(f"✅ Batch procesado: {len(df_cleaned)} clientes válidos")
        
        return df_cleaned


# Función de conveniencia para uso rápido
def clean_customer_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Función de conveniencia para limpiar datos de un cliente.
    
    Usage:
        from src.etl_pipeline import clean_customer_data
        
        raw_data = {
            'Antiguedad': '  12  ',
            'CargoMensual': None,
            'TipoContrato': 'mensual',  # lowercase
            ...
        }
        
        clean_data = clean_customer_data(raw_data)
    """
    etl = RetainAIETL()
    return etl.process(raw_data)
