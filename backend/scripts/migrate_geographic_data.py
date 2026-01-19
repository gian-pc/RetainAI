#!/usr/bin/env python3
"""
Script: Migrar Datos Geográficos desde Dataset a BD
Fecha: 2026-01-18
Descripción: Migra Borough, CodigoPostal, Estado, FechaRegistro desde retain_data_clean.csv a la BD
"""

import pandas as pd
import mysql.connector
from datetime import datetime
import sys

def main():
    print("=" * 80)
    print("📊 MIGRACIÓN DE DATOS GEOGRÁFICOS")
    print("=" * 80)
    print()
    
    # 1. Cargar dataset limpio
    print("1️⃣  Cargando dataset limpio...")
    csv_path = '/Users/admin/Desktop/projects/hackathon-oracle/RetainAI/ai-ml/data/clean/retain_data_clean.csv'
    
    try:
        df = pd.read_csv(csv_path)
        print(f"   ✅ Dataset cargado: {len(df):,} registros")
    except FileNotFoundError:
        print(f"   ❌ Error: No se encontró el archivo {csv_path}")
        sys.exit(1)
    
    # Verificar columnas necesarias
    required_cols = ['ClienteID', 'Borough', 'CodigoPostal', 'Estado', 'FechaRegistro']
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        print(f"   ❌ Error: Faltan columnas: {missing_cols}")
        sys.exit(1)
    
    print(f"   ✅ Columnas encontradas: {required_cols}")
    print()
    
    # 2. Conectar a BD
    print("2️⃣  Conectando a base de datos...")
    try:
        conn = mysql.connector.connect(
            host='127.0.0.1',
            port=3306,
            database='retainai_db',
            user='root',
            password='root'
        )
        cursor = conn.cursor()
        print("   ✅ Conexión exitosa")
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
        sys.exit(1)
    
    print()
    
    # 3. Migrar datos
    print("3️⃣  Migrando datos...")
    updated = 0
    errors = 0
    
    for idx, row in df.iterrows():
        try:
            # Preparar fecha
            fecha_registro = None
            if pd.notna(row.get('FechaRegistro')):
                try:
                    fecha_registro = pd.to_datetime(row['FechaRegistro']).date()
                except:
                    fecha_registro = None
            
            # Actualizar BD
            cursor.execute("""
                UPDATE customers 
                SET borough = %s,
                    codigo_postal = %s,
                    estado = %s,
                    fecha_registro = %s
                WHERE id = %s
            """, (
                row.get('Borough') if pd.notna(row.get('Borough')) else None,
                row.get('CodigoPostal') if pd.notna(row.get('CodigoPostal')) else None,
                row.get('Estado') if pd.notna(row.get('Estado')) else None,
                fecha_registro,
                row['ClienteID']
            ))
            
            updated += 1
            
            # Mostrar progreso cada 1000 registros
            if (idx + 1) % 1000 == 0:
                print(f"   Procesados: {idx + 1:,} / {len(df):,}")
                
        except Exception as e:
            errors += 1
            if errors <= 5:  # Mostrar solo primeros 5 errores
                print(f"   ⚠️  Error actualizando {row['ClienteID']}: {e}")
    
    # Commit cambios
    conn.commit()
    print()
    print(f"   ✅ Migración completada")
    print(f"   📊 Registros actualizados: {updated:,}")
    print(f"   ⚠️  Errores: {errors}")
    print()
    
    # 4. Verificar datos migrados
    print("4️⃣  Verificando datos migrados...")
    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            COUNT(borough) as con_borough,
            COUNT(codigo_postal) as con_codigo_postal,
            COUNT(estado) as con_estado,
            COUNT(fecha_registro) as con_fecha_registro
        FROM customers
    """)
    
    result = cursor.fetchone()
    print(f"   Total clientes: {result[0]:,}")
    print(f"   Con Borough: {result[1]:,}")
    print(f"   Con Código Postal: {result[2]:,}")
    print(f"   Con Estado: {result[3]:,}")
    print(f"   Con Fecha Registro: {result[4]:,}")
    print()
    
    # 5. Mostrar ejemplos
    print("5️⃣  Ejemplos de datos migrados:")
    cursor.execute("""
        SELECT id, borough, codigo_postal, estado, fecha_registro
        FROM customers
        WHERE borough IS NOT NULL
        LIMIT 5
    """)
    
    print("   " + "-" * 76)
    print(f"   {'ID':<15} {'Borough':<15} {'CP':<10} {'Estado':<10} {'Fecha Registro'}")
    print("   " + "-" * 76)
    for row in cursor.fetchall():
        print(f"   {row[0]:<15} {row[1] or 'NULL':<15} {row[2] or 'NULL':<10} {row[3] or 'NULL':<10} {row[4] or 'NULL'}")
    print("   " + "-" * 76)
    print()
    
    # Cerrar conexión
    cursor.close()
    conn.close()
    
    print("=" * 80)
    print("✅ MIGRACIÓN COMPLETADA EXITOSAMENTE")
    print("=" * 80)

if __name__ == "__main__":
    main()
