"""
Script to populate the database with data from data.csv
Populates:
1. customer_context table (10 business fields)
2. customer_metrics new fields (tiempo_sesion_promedio, ultimo_contacto_soporte)
"""

import pandas as pd
import mysql.connector
from datetime import datetime
import sys

# Database configuration
DB_CONFIG = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': 'root',
    'database': 'retainai_db'
}

# CSV file path
CSV_FILE = '/Users/admin/Desktop/projects/hackathon-oracle/RetainAI/ai-ml/data/data.csv'

def connect_to_database():
    """Connect to MySQL database"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        print(f"✅ Connected to database: {DB_CONFIG['database']}")
        return conn
    except mysql.connector.Error as err:
        print(f"❌ Error connecting to database: {err}")
        sys.exit(1)

def load_csv_data():
    """Load data from CSV file"""
    try:
        df = pd.read_csv(CSV_FILE)
        print(f"✅ Loaded CSV with {len(df)} rows and {len(df.columns)} columns")
        return df
    except Exception as e:
        print(f"❌ Error loading CSV: {e}")
        sys.exit(1)

def parse_date(date_str):
    """Parse date string to proper format, handle None/NaN"""
    if pd.isna(date_str) or date_str == '' or date_str is None:
        return None
    try:
        # Try parsing YYYY-MM-DD format
        return datetime.strptime(str(date_str), '%Y-%m-%d').date()
    except ValueError:
        try:
            # Try parsing DD/MM/YYYY format
            return datetime.strptime(str(date_str), '%d/%m/%Y').date()
        except ValueError:
            return None

def populate_customer_metrics(conn, df):
    """
    Update customer_metrics table with new fields:
    - tiempo_sesion_promedio
    - ultimo_contacto_soporte
    """
    cursor = conn.cursor()

    # CSV columns mapping:
    # tiempo_sesion_promedio -> tiempo_sesion_promedio
    # ultimo_contacto_soporte -> ultimo_contacto_soporte

    updated_count = 0
    error_count = 0

    print("\n📊 Updating customer_metrics table...")

    for index, row in df.iterrows():
        customer_id = row['cliente_id']
        tiempo_sesion = row.get('tiempo_sesion_promedio', None)
        ultimo_contacto = parse_date(row.get('ultimo_contacto_soporte', None))

        # Handle NaN values
        if pd.isna(tiempo_sesion):
            tiempo_sesion = None

        try:
            sql = """
            UPDATE customer_metrics cm
            JOIN customers c ON cm.customer_id = c.id
            SET
                cm.tiempo_sesion_promedio = %s,
                cm.ultimo_contacto_soporte = %s
            WHERE c.id = %s
            """
            cursor.execute(sql, (tiempo_sesion, ultimo_contacto, customer_id))

            if cursor.rowcount > 0:
                updated_count += 1

            if (index + 1) % 1000 == 0:
                conn.commit()
                print(f"  ⏳ Processed {index + 1}/{len(df)} rows...")

        except mysql.connector.Error as err:
            error_count += 1
            print(f"  ⚠️ Error updating customer {customer_id}: {err}")
            continue

    conn.commit()
    print(f"✅ Updated {updated_count} customer_metrics records")
    if error_count > 0:
        print(f"⚠️ {error_count} errors occurred")

def populate_customer_context(conn, df):
    """
    Populate customer_context table with 10 business fields:
    - cambio_plan_reciente
    - downgrade_reciente
    - fecha_ultimo_pago
    - intentos_cobro_fallidos
    - dias_mora
    - ofertas_recibidas
    - visitas_app_mensual
    - features_nuevas_usadas
    - competidores_area
    - precio_vs_mercado
    """
    cursor = conn.cursor()

    inserted_count = 0
    error_count = 0

    print("\n📊 Populating customer_context table...")

    for index, row in df.iterrows():
        customer_id = row['cliente_id']

        # Map CSV columns to database fields
        cambio_plan = 1 if row.get('cambio_plan_reciente', 0) == 1 else 0
        downgrade = 1 if row.get('downgrade_reciente', 0) == 1 else 0
        fecha_pago = parse_date(row.get('fecha_ultimo_pago', None))
        intentos_cobro = int(row.get('intentos_cobro_fallidos', 0)) if not pd.isna(row.get('intentos_cobro_fallidos', 0)) else 0
        dias_mora = int(row.get('dias_mora', 0)) if not pd.isna(row.get('dias_mora', 0)) else 0
        ofertas = int(row.get('ofertas_recibidas', 0)) if not pd.isna(row.get('ofertas_recibidas', 0)) else 0
        visitas_app = int(row.get('visitas_app_mensual', 0)) if not pd.isna(row.get('visitas_app_mensual', 0)) else 0
        features_nuevas = int(row.get('features_nuevas_usadas', 0)) if not pd.isna(row.get('features_nuevas_usadas', 0)) else 0
        competidores = int(row.get('competidores_area', 0)) if not pd.isna(row.get('competidores_area', 0)) else 0
        precio_mercado = str(row.get('precio_vs_mercado', 'Competitivo'))

        # fecha_cambio_plan: If cambio_plan_reciente=1, use fecha_ultimo_pago as proxy
        fecha_cambio = fecha_pago if cambio_plan == 1 else None

        try:
            sql = """
            INSERT INTO customer_context (
                customer_id,
                cambio_plan_reciente,
                fecha_cambio_plan,
                downgrade_reciente,
                fecha_ultimo_pago,
                intentos_cobro_fallidos,
                dias_mora,
                ofertas_recibidas,
                visitas_app_mensual,
                features_nuevas_usadas,
                competidores_area,
                precio_vs_mercado
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            """
            cursor.execute(sql, (
                customer_id,
                cambio_plan,
                fecha_cambio,
                downgrade,
                fecha_pago,
                intentos_cobro,
                dias_mora,
                ofertas,
                visitas_app,
                features_nuevas,
                competidores,
                precio_mercado
            ))

            inserted_count += 1

            if (index + 1) % 1000 == 0:
                conn.commit()
                print(f"  ⏳ Processed {index + 1}/{len(df)} rows...")

        except mysql.connector.Error as err:
            error_count += 1
            if "Duplicate entry" not in str(err):
                print(f"  ⚠️ Error inserting customer {customer_id}: {err}")
            continue

    conn.commit()
    print(f"✅ Inserted {inserted_count} customer_context records")
    if error_count > 0:
        print(f"⚠️ {error_count} errors occurred")

def verify_population(conn):
    """Verify data was populated correctly"""
    cursor = conn.cursor()

    print("\n📊 Verifying data population...")

    # Check customer_context count
    cursor.execute("SELECT COUNT(*) FROM customer_context")
    context_count = cursor.fetchone()[0]
    print(f"  ✅ customer_context: {context_count} records")

    # Check customer_metrics updated fields (non-null count)
    cursor.execute("""
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN tiempo_sesion_promedio IS NOT NULL THEN 1 ELSE 0 END) as tiempo_count,
            SUM(CASE WHEN ultimo_contacto_soporte IS NOT NULL THEN 1 ELSE 0 END) as contacto_count
        FROM customer_metrics
    """)
    result = cursor.fetchone()
    print(f"  ✅ customer_metrics: {result[0]} total records")
    print(f"     - tiempo_sesion_promedio populated: {result[1]}")
    print(f"     - ultimo_contacto_soporte populated: {result[2]}")

    # Show sample data
    print("\n📋 Sample customer_context data:")
    cursor.execute("""
        SELECT
            cc.customer_id,
            cc.cambio_plan_reciente,
            cc.downgrade_reciente,
            cc.intentos_cobro_fallidos,
            cc.ofertas_recibidas,
            cc.competidores_area,
            cc.precio_vs_mercado
        FROM customer_context cc
        LIMIT 3
    """)

    for row in cursor.fetchall():
        print(f"     {row}")

    cursor.close()

def main():
    """Main execution"""
    print("=" * 70)
    print("🚀 DATABASE POPULATION SCRIPT")
    print("=" * 70)

    # Connect to database
    conn = connect_to_database()

    # Load CSV data
    df = load_csv_data()

    # Populate tables
    populate_customer_metrics(conn, df)
    populate_customer_context(conn, df)

    # Verify population
    verify_population(conn)

    # Close connection
    conn.close()

    print("\n" + "=" * 70)
    print("✅ DATABASE POPULATION COMPLETED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    main()
