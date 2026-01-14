"""
Script para poblar la BD MySQL con clientes reales del dataset NYC
"""
import pandas as pd
import mysql.connector
from mysql.connector import Error
import uuid
import numpy as np

def safe_value(value, default=None):
    """Convertir NaN/None a valor por defecto"""
    if pd.isna(value) or value is None or (isinstance(value, float) and np.isnan(value)):
        return default
    return value

# Configuración de BD (ajustar según tu setup)
DB_CONFIG = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': 'root',
    'database': 'retainai_db'
}

def get_connection():
    """Crear conexión a MySQL"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        if conn.is_connected():
            print("✅ Conectado a MySQL")
            return conn
    except Error as e:
        print(f"❌ Error de conexión: {e}")
        return None

def clean_tables(cursor):
    """Limpiar tablas antes de insertar (opcional)"""
    print("\n🗑️  Limpiando tablas...")
    try:
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        cursor.execute("TRUNCATE TABLE subscriptions")
        cursor.execute("TRUNCATE TABLE customers")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        print("✅ Tablas limpiadas\n")
    except Error as e:
        print(f"⚠️  Error limpiando tablas: {e}\n")

def run_migration(cursor):
    """Ejecutar migración para agregar columnas NYC"""
    print("\n📦 Ejecutando migración SQL...")

    # 1. Agregar campos a CUSTOMERS
    customer_fields = [
        "ADD COLUMN IF NOT EXISTS es_mayor INT DEFAULT 0",
        "ADD COLUMN IF NOT EXISTS tiene_pareja VARCHAR(10) DEFAULT 'No'",
        "ADD COLUMN IF NOT EXISTS tiene_dependientes VARCHAR(10) DEFAULT 'No'",
        "ADD COLUMN IF NOT EXISTS ingreso_mediano DECIMAL(10,2)",
        "ADD COLUMN IF NOT EXISTS densidad_poblacional DECIMAL(10,2)",
        "ADD COLUMN IF NOT EXISTS borough_risk DECIMAL(5,2)",
        "ADD COLUMN IF NOT EXISTS high_density_area INT DEFAULT 0",
        "ADD COLUMN IF NOT EXISTS income_bracket VARCHAR(20) DEFAULT 'Medium'"
    ]

    for field in customer_fields:
        try:
            cursor.execute(f"ALTER TABLE customers {field}")
            print(f"  ✅ {field.split('IF NOT EXISTS')[1].split('INT')[0].split('VARCHAR')[0].split('DECIMAL')[0].strip()}")
        except Error as e:
            if "Duplicate column" not in str(e):
                print(f"  ⚠️  {e}")

    # 2. Agregar campos a SUBSCRIPTIONS
    subscription_fields = [
        "ADD COLUMN IF NOT EXISTS servicio_telefono VARCHAR(10) DEFAULT 'No'",
        "ADD COLUMN IF NOT EXISTS lineas_multiples VARCHAR(20) DEFAULT 'No'",
        "ADD COLUMN IF NOT EXISTS tipo_internet VARCHAR(20) DEFAULT 'No'",
        "ADD COLUMN IF NOT EXISTS seguridad_online VARCHAR(30) DEFAULT 'No'",
        "ADD COLUMN IF NOT EXISTS respaldo_online VARCHAR(30) DEFAULT 'No'",
        "ADD COLUMN IF NOT EXISTS proteccion_dispositivo VARCHAR(30) DEFAULT 'No'",
        "ADD COLUMN IF NOT EXISTS soporte_tecnico VARCHAR(30) DEFAULT 'No'",
        "ADD COLUMN IF NOT EXISTS streaming_tv VARCHAR(30) DEFAULT 'No'",
        "ADD COLUMN IF NOT EXISTS streaming_peliculas VARCHAR(30) DEFAULT 'No'",
        "ADD COLUMN IF NOT EXISTS servicios_premium_count INT DEFAULT 0",
        "ADD COLUMN IF NOT EXISTS facturacion_sin_papel VARCHAR(10) DEFAULT 'No'",
        "ADD COLUMN IF NOT EXISTS tenure_group VARCHAR(20) DEFAULT '0-12 meses'",
        "ADD COLUMN IF NOT EXISTS nivel_riesgo VARCHAR(10) DEFAULT 'Medio'",
        "ADD COLUMN IF NOT EXISTS score_riesgo DECIMAL(5,2) DEFAULT 5.0",
        "ADD COLUMN IF NOT EXISTS risk_flag INT DEFAULT 0"
    ]

    for field in subscription_fields:
        try:
            cursor.execute(f"ALTER TABLE subscriptions {field}")
            print(f"  ✅ {field.split('IF NOT EXISTS')[1].split('VARCHAR')[0].split('INT')[0].split('DECIMAL')[0].strip()}")
        except Error as e:
            if "Duplicate column" not in str(e):
                print(f"  ⚠️  {e}")

    print("✅ Migración completada\n")

def insert_customers(cursor, conn, df, limit=None):
    """Insertar clientes del dataset en MySQL"""
    total = limit if limit else len(df)
    print(f"📥 Insertando {total} clientes del dataset NYC...\n")

    inserted = 0
    errors = 0

    df_to_insert = df.head(limit) if limit else df

    for idx, row in df_to_insert.iterrows():
        try:
            customer_id = f"NYC-{uuid.uuid4().hex[:8].upper()}"

            # 1. INSERT CUSTOMER
            customer_sql = """
                INSERT INTO customers (
                    id, genero, edad, pais, ciudad, segmento,
                    latitud, longitud,
                    es_mayor, tiene_pareja, tiene_dependientes,
                    ingreso_mediano, densidad_poblacional, borough_risk,
                    high_density_area, income_bracket
                ) VALUES (
                    %s, %s, %s, %s, %s, %s,
                    %s, %s,
                    %s, %s, %s,
                    %s, %s, %s,
                    %s, %s
                )
            """

            customer_values = (
                customer_id,
                safe_value(row['Genero'], 'Masculino'),
                65 if safe_value(row['EsMayor'], 0) == 1 else 30,
                'USA',
                safe_value(row['Ciudad'], 'New York'),
                safe_value(row['SegmentoCliente'], 'Residencial'),
                safe_value(row['Latitud']),
                safe_value(row['Longitud']),
                int(safe_value(row['EsMayor'], 0)),
                safe_value(row['TienePareja'], 'No'),
                safe_value(row['TieneDependientes'], 'No'),
                safe_value(row['IngresoMediano'], 50000.0),
                safe_value(row['DensidadPoblacional'], 15000.0),
                safe_value(row['borough_risk'], 20.0),
                int(safe_value(row['high_density_area'], 0)),
                safe_value(row['income_bracket'], 'Medium')
            )

            cursor.execute(customer_sql, customer_values)

            # 2. INSERT SUBSCRIPTION
            subscription_sql = """
                INSERT INTO subscriptions (
                    customer_id, meses_permanencia, tipo_contrato,
                    cuota_mensual, ingresos_totales, metodo_pago,
                    servicio_telefono, lineas_multiples, tipo_internet,
                    seguridad_online, respaldo_online, proteccion_dispositivo,
                    soporte_tecnico, streaming_tv, streaming_peliculas,
                    servicios_premium_count, facturacion_sin_papel,
                    tenure_group, nivel_riesgo, score_riesgo, risk_flag
                ) VALUES (
                    %s, %s, %s,
                    %s, %s, %s,
                    %s, %s, %s,
                    %s, %s, %s,
                    %s, %s, %s,
                    %s, %s,
                    %s, %s, %s, %s
                )
            """

            subscription_values = (
                customer_id,
                int(safe_value(row['Antiguedad'], 1)),
                safe_value(row['TipoContrato'], 'Mensual'),
                safe_value(row['CargoMensual'], 50.0),
                safe_value(row['CargosTotal'], 100.0),
                safe_value(row['MetodoPago'], 'Cheque electrónico'),
                safe_value(row['ServicioTelefono'], 'No'),
                safe_value(row['LineasMultiples'], 'No'),
                safe_value(row['TipoInternet'], 'No'),
                safe_value(row['SeguridadOnline'], 'No'),
                safe_value(row['RespaldoOnline'], 'No'),
                safe_value(row['ProteccionDispositivo'], 'No'),
                safe_value(row['SoporteTecnico'], 'No'),
                safe_value(row['StreamingTV'], 'No'),
                safe_value(row['StreamingPeliculas'], 'No'),
                int(safe_value(row['servicios_premium_count'], 0)),
                safe_value(row['FacturacionSinPapel'], 'No'),
                safe_value(row['tenure_group'], '0-12 meses'),
                safe_value(row['nivel_riesgo'], 'Medio'),
                safe_value(row['score_riesgo'], 5.0),
                int(safe_value(row['risk_flag'], 0))
            )

            cursor.execute(subscription_sql, subscription_values)

            inserted += 1

            # Commit cada 1000 clientes para no perder progreso
            if inserted % 1000 == 0:
                conn.commit()
                print(f"  💾 Checkpoint: {inserted}/{total} clientes guardados")
            # Mostrar progreso cada 100 clientes
            elif inserted % 100 == 0:
                print(f"  📊 Progreso: {inserted}/{total} clientes insertados...")
            elif inserted <= 20 or inserted == total:
                print(f"  ✅ Cliente {inserted}/{total}: {customer_id} - {row['SegmentoCliente']}, {row['TipoContrato']}, ${row['CargoMensual']:.2f}")

        except Error as e:
            errors += 1
            print(f"  ❌ Error insertando cliente {idx}: {e}")
            continue

    return inserted, errors

def main():
    print("=" * 80)
    print("POBLACIÓN DE BD CON DATOS NYC REALES")
    print("=" * 80)

    # 1. Cargar dataset
    print("\n📂 Cargando dataset...")
    df = pd.read_csv('data/processed/dataset_features.csv')
    print(f"✅ Dataset cargado: {len(df)} clientes\n")

    # 2. Conectar a MySQL
    conn = get_connection()
    if not conn:
        return

    cursor = conn.cursor()

    try:
        # 3. Limpiar tablas (eliminar los 20 clientes de prueba)
        clean_tables(cursor)

        # 4. Ejecutar migración
        run_migration(cursor)

        # 5. Insertar TODOS los clientes del dataset (~10k)
        inserted, errors = insert_customers(cursor, conn, df)

        # 5. Commit
        conn.commit()

        print("\n" + "=" * 80)
        print("✅ PROCESO COMPLETADO")
        print("=" * 80)
        print(f"✅ Clientes insertados: {inserted}")
        print(f"❌ Errores: {errors}")
        print(f"\n🧪 Ahora puedes probar el endpoint:")
        print(f"   POST http://localhost:8080/api/customers/NYC-XXXXXX/predict")

    except Error as e:
        print(f"\n❌ Error: {e}")
        conn.rollback()

    finally:
        cursor.close()
        conn.close()
        print("\n🔌 Conexión cerrada")

if __name__ == "__main__":
    main()
