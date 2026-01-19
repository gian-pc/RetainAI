#!/usr/bin/env python3
"""
Script para limpiar retain-data.csv eliminando SOLO las columnas calculadas.

Este script toma el archivo retain-data.csv (77 columnas) y elimina las columnas
de feature engineering calculadas, manteniendo SOLO las columnas originales
(incluyendo coordenadas, datos demográficos, etc.)

Input:  data/processed/retain-data.csv (77 columnas)
Output: data/clean/retain_data_clean.csv (solo columnas originales)
"""

import pandas as pd
from pathlib import Path

# Configuración de rutas
BASE_DIR = Path(__file__).parent.parent
INPUT_FILE = BASE_DIR / "data" / "processed" / "retain-data.csv"
OUTPUT_FILE = BASE_DIR / "data" / "clean" / "retain_data_clean.csv"

# Columnas CALCULADAS a ELIMINAR (según el análisis del documento)
CALCULATED_COLUMNS = [
    # Features derivados (13)
    'tenure_group',
    'income_bracket',
    'nps_categoria',
    'csat_categoria',
    'has_queja',
    'alto_tickets',
    'high_density_area',
    'ratio_precio_ingreso',
    'servicios_premium_count',
    'risk_flag',
    'borough_risk',
    'CustomerValueRatio',
    'PriceIncomePercent',
    
    # Features binarios (10)
    'ServicioTelefono_Binary',
    'LineasMultiples_Binary',
    'SeguridadOnline_Binary',
    'RespaldoOnline_Binary',
    'ProteccionDispositivo_Binary',
    'SoporteTecnico_Binary',
    'StreamingTV_Binary',
    'StreamingPeliculas_Binary',
    'ServicesCount',
    'Churn_Binary',
    
    # Transformaciones matemáticas (10)
    'Log_ChargesMonthly',
    'Log_EstimatedLTV',
    'Log_Tenure',
    'Sqrt_Tenure',
    'Sqrt_ServicesCount',
    'EngagementScore',
    'EstimatedLTV',
    'AvgMonthlyValue',
    'TenureGroup',
    'PriceSegment',
    
    # Features de interacción (10)
    'HighRisk_ContractTenure',
    'MediumRisk_ContractTenure',
    'IncomePriceMismatch',
    'HighRiskSegment',
]


def main():
    print("=" * 70)
    print("🧹 LIMPIEZA DE RETAIN-DATA.CSV")
    print("=" * 70)
    print()
    
    # 1. Cargar archivo original
    print(f"📂 Cargando: {INPUT_FILE}")
    df = pd.read_csv(INPUT_FILE)
    print(f"   ✅ Cargado: {len(df):,} registros, {len(df.columns)} columnas")
    
    # 2. Identificar columnas a eliminar
    print(f"\n🔍 Identificando columnas calculadas...")
    columns_to_remove = [col for col in CALCULATED_COLUMNS if col in df.columns]
    columns_to_keep = [col for col in df.columns if col not in CALCULATED_COLUMNS]
    
    print(f"   ✅ Columnas originales a mantener: {len(columns_to_keep)}")
    print(f"   ❌ Columnas calculadas a eliminar: {len(columns_to_remove)}")
    
    # 3. Mostrar columnas que se eliminarán
    if columns_to_remove:
        print(f"\n   🗑️  Columnas que se eliminarán:")
        for i, col in enumerate(sorted(columns_to_remove), 1):
            print(f"      {i:2d}. {col}")
    
    # 4. Crear dataset limpio
    print(f"\n✂️  Eliminando columnas calculadas...")
    df_clean = df[columns_to_keep]
    
    # 5. Mostrar columnas finales
    print(f"\n📋 Columnas finales ({len(df_clean.columns)}):")
    for i, col in enumerate(df_clean.columns, 1):
        print(f"   {i:2d}. {col}")
    
    # 6. Guardar archivo limpio
    print(f"\n💾 Guardando dataset limpio en: {OUTPUT_FILE}")
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    df_clean.to_csv(OUTPUT_FILE, index=False, encoding='utf-8')
    
    print(f"   ✅ Archivo guardado exitosamente")
    print(f"   📊 Tamaño: {OUTPUT_FILE.stat().st_size / 1024 / 1024:.2f} MB")
    
    # 7. Resumen final
    print("\n" + "=" * 70)
    print("✅ LIMPIEZA COMPLETADA")
    print("=" * 70)
    print(f"\n📁 Archivo limpio: {OUTPUT_FILE}")
    print(f"📊 Registros: {len(df_clean):,}")
    print(f"📊 Columnas: {len(df_clean.columns)} (de {len(df.columns)} originales)")
    print(f"📊 Columnas eliminadas: {len(columns_to_remove)}")
    print(f"\n✅ Listo para compartir con tu equipo!")


if __name__ == "__main__":
    main()
