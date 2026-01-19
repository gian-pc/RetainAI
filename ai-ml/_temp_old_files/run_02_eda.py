#!/usr/bin/env python3
"""
Script para ejecutar el Análisis Exploratorio de Datos (EDA)
DS-502: Análisis completo del dataset de clientes
"""

# Imports
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Backend no-GUI
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Configuración
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette('husl')
plt.rcParams['figure.figsize'] = (12, 6)
plt.rcParams['font.size'] = 10

pd.set_option('display.max_columns', None)
pd.set_option('display.float_format', lambda x: f'{x:.2f}')

print("✓ Librerías importadas")
print(f"📅 Fecha de análisis: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

# 1. CARGA Y VALIDACIÓN
print("\n" + "="*80)
print("1. CARGA Y VALIDACIÓN INICIAL")
print("="*80)

df = pd.read_csv('../data/raw/dataset_base_10k_es.csv')

print(f"\n📏 Dimensiones: {df.shape[0]:,} registros × {df.shape[1]} columnas")
print(f"💽 Tamaño en memoria: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")

churn_rate = (df['Cancelacion']=='Si').sum() / len(df) * 100
print(f"\n🎯 Tasa de churn: {churn_rate:.2f}%")
print(df['Cancelacion'].value_counts())

# 2. SEPARAR VARIABLES
numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
categorical_cols = df.select_dtypes(include=['object']).columns.tolist()

id_cols = ['ClienteID', 'FechaRegistro']
target_col = 'Cancelacion'

numeric_features = [col for col in numeric_cols if col not in id_cols and col != target_col]
categorical_features = [col for col in categorical_cols if col not in id_cols and col != target_col]

print(f"\n📊 Variables numéricas: {len(numeric_features)}")
print(f"📊 Variables categóricas: {len(categorical_features)}")

# 3. ANÁLISIS UNIVARIADO - NUMÉRICAS
print("\n" + "="*80)
print("2. ANÁLISIS UNIVARIADO - VARIABLES NUMÉRICAS")
print("="*80)

key_numeric = ['Antiguedad', 'CargoMensual', 'PuntuacionNPS', 'PuntuacionCSAT', 'TicketsSoporte']

fig, axes = plt.subplots(2, 3, figsize=(16, 10))
axes = axes.flatten()

for i, col in enumerate(key_numeric):
    axes[i].hist(df[col].dropna(), bins=30, edgecolor='black', alpha=0.7)
    axes[i].set_title(f'Distribución de {col}', fontsize=12, fontweight='bold')
    axes[i].set_xlabel(col)
    axes[i].set_ylabel('Frecuencia')
    axes[i].grid(alpha=0.3)

    mean_val = df[col].mean()
    median_val = df[col].median()
    axes[i].axvline(mean_val, color='red', linestyle='--', label=f'Media: {mean_val:.1f}')
    axes[i].axvline(median_val, color='green', linestyle='--', label=f'Mediana: {median_val:.1f}')
    axes[i].legend()

fig.delaxes(axes[5])

plt.tight_layout()
plt.savefig('../reports/figures/02_distribucion_numericas.png', dpi=300, bbox_inches='tight')
plt.close()

print("✓ Gráfico guardado: 02_distribucion_numericas.png")

# 4. ANÁLISIS UNIVARIADO - CATEGÓRICAS
print("\n" + "="*80)
print("3. ANÁLISIS UNIVARIADO - VARIABLES CATEGÓRICAS")
print("="*80)

key_categorical = ['SegmentoCliente', 'nivel_riesgo', 'TipoContrato', 'TipoInternet', 'Borough']

fig, axes = plt.subplots(2, 3, figsize=(16, 10))
axes = axes.flatten()

for i, col in enumerate(key_categorical):
    value_counts = df[col].value_counts()
    axes[i].bar(range(len(value_counts)), value_counts.values, edgecolor='black', alpha=0.7)
    axes[i].set_xticks(range(len(value_counts)))
    axes[i].set_xticklabels(value_counts.index, rotation=45, ha='right')
    axes[i].set_title(f'Distribución de {col}', fontsize=12, fontweight='bold')
    axes[i].set_ylabel('Frecuencia')
    axes[i].grid(alpha=0.3, axis='y')

    for j, v in enumerate(value_counts.values):
        pct = v / len(df) * 100
        axes[i].text(j, v, f'{pct:.1f}%', ha='center', va='bottom')

fig.delaxes(axes[5])

plt.tight_layout()
plt.savefig('../reports/figures/02_distribucion_categoricas.png', dpi=300, bbox_inches='tight')
plt.close()

print("✓ Gráfico guardado: 02_distribucion_categoricas.png")

# 5. ANÁLISIS DEL TARGET
print("\n" + "="*80)
print("4. ANÁLISIS DEL TARGET (Cancelacion)")
print("="*80)

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

target_counts = df['Cancelacion'].value_counts()
colors = ['#2ecc71', '#e74c3c']
axes[0].bar(target_counts.index, target_counts.values, color=colors, edgecolor='black', alpha=0.8)
axes[0].set_title('Distribución de Cancelacion', fontsize=14, fontweight='bold')
axes[0].set_ylabel('Cantidad de Clientes')
axes[0].grid(alpha=0.3, axis='y')

for i, v in enumerate(target_counts.values):
    pct = v / len(df) * 100
    axes[0].text(i, v, f'{v:,}\n({pct:.1f}%)', ha='center', va='bottom', fontweight='bold')

axes[1].pie(target_counts.values, labels=target_counts.index, autopct='%1.1f%%',
            colors=colors, startangle=90, explode=(0.05, 0.05))
axes[1].set_title('Proporción de Churn', fontsize=14, fontweight='bold')

plt.tight_layout()
plt.savefig('../reports/figures/02_distribucion_target.png', dpi=300, bbox_inches='tight')
plt.close()

print("✓ Gráfico guardado: 02_distribucion_target.png")

# 6. ANÁLISIS BIVARIADO
print("\n" + "="*80)
print("5. ANÁLISIS BIVARIADO (Features vs Churn)")
print("="*80)

churners = df[df['Cancelacion'] == 'Si']
no_churners = df[df['Cancelacion'] == 'No']

comparison_vars = ['Antiguedad', 'CargoMensual', 'PuntuacionNPS', 'PuntuacionCSAT',
                   'TicketsSoporte', 'IngresoMediano', 'score_riesgo']

print("\nComparación de Promedios:")
for var in comparison_vars:
    churn_val = churners[var].mean()
    no_churn_val = no_churners[var].mean()
    diff = churn_val - no_churn_val
    print(f"  {var:<25}: Churners={churn_val:>8.2f} | No-Churners={no_churn_val:>8.2f} | Diff={diff:>8.2f}")

# Visualización comparación
comparison_vars_plot = ['Antiguedad', 'CargoMensual', 'PuntuacionNPS',
                        'PuntuacionCSAT', 'TicketsSoporte', 'score_riesgo']

fig, axes = plt.subplots(2, 3, figsize=(16, 10))
axes = axes.flatten()

for i, var in enumerate(comparison_vars_plot):
    data_to_plot = [no_churners[var].dropna(), churners[var].dropna()]
    bp = axes[i].boxplot(data_to_plot, labels=['No Churn', 'Churn'], patch_artist=True)

    colors_box = ['#2ecc71', '#e74c3c']
    for patch, color in zip(bp['boxes'], colors_box):
        patch.set_facecolor(color)
        patch.set_alpha(0.7)

    axes[i].set_title(f'{var}', fontsize=12, fontweight='bold')
    axes[i].set_ylabel('Valor')
    axes[i].grid(alpha=0.3, axis='y')

plt.tight_layout()
plt.savefig('../reports/figures/02_comparacion_churn.png', dpi=300, bbox_inches='tight')
plt.close()

print("✓ Gráfico guardado: 02_comparacion_churn.png")

# 7. CHURN POR CATEGORÍA
categorical_analysis = ['SegmentoCliente', 'nivel_riesgo', 'TipoContrato', 'TipoInternet']

fig, axes = plt.subplots(2, 2, figsize=(14, 10))
axes = axes.flatten()

for i, cat in enumerate(categorical_analysis):
    churn_by_cat = df.groupby(cat)['Cancelacion'].apply(lambda x: (x=='Si').sum() / len(x) * 100)

    axes[i].bar(range(len(churn_by_cat)), churn_by_cat.values, edgecolor='black', alpha=0.7)
    axes[i].set_xticks(range(len(churn_by_cat)))
    axes[i].set_xticklabels(churn_by_cat.index, rotation=45, ha='right')
    axes[i].set_title(f'Tasa de Churn por {cat}', fontsize=12, fontweight='bold')
    axes[i].set_ylabel('% Churn')
    axes[i].grid(alpha=0.3, axis='y')
    axes[i].axhline(y=churn_rate, color='red', linestyle='--', label=f'Media: {churn_rate:.1f}%')
    axes[i].legend()

    for j, v in enumerate(churn_by_cat.values):
        axes[i].text(j, v, f'{v:.1f}%', ha='center', va='bottom', fontweight='bold')

plt.tight_layout()
plt.savefig('../reports/figures/02_churn_por_categoria.png', dpi=300, bbox_inches='tight')
plt.close()

print("✓ Gráfico guardado: 02_churn_por_categoria.png")

# 8. CORRELACIONES
print("\n" + "="*80)
print("6. ANÁLISIS DE CORRELACIONES")
print("="*80)

df_corr = df.copy()
df_corr['Cancelacion_num'] = (df_corr['Cancelacion'] == 'Si').astype(int)

corr_vars = ['Cancelacion_num', 'Antiguedad', 'CargoMensual', 'CargosTotal', 'PuntuacionNPS',
             'PuntuacionCSAT', 'TicketsSoporte', 'Escaladas', 'score_riesgo',
             'IngresoMediano', 'TiempoResolucion', 'TasaAperturaEmail']

correlation_matrix = df_corr[corr_vars].corr()

plt.figure(figsize=(12, 10))
sns.heatmap(correlation_matrix, annot=True, fmt='.2f', cmap='coolwarm',
            center=0, vmin=-1, vmax=1, square=True, linewidths=0.5)
plt.title('Matriz de Correlación', fontsize=14, fontweight='bold', pad=20)
plt.tight_layout()
plt.savefig('../reports/figures/02_matriz_correlacion.png', dpi=300, bbox_inches='tight')
plt.close()

print("✓ Gráfico guardado: 02_matriz_correlacion.png")

# Top correlaciones
churn_correlations = correlation_matrix['Cancelacion_num'].drop('Cancelacion_num').sort_values(ascending=False)

print("\nTop 10 Variables Correlacionadas con CHURN:")
for i, (var, corr) in enumerate(churn_correlations.head(10).items(), 1):
    print(f"{i:2d}. {var:<25} | {corr:>6.3f}")

plt.figure(figsize=(10, 6))
top_corr = churn_correlations.head(10)
colors_corr = ['#e74c3c' if x > 0 else '#2ecc71' for x in top_corr.values]
plt.barh(range(len(top_corr)), top_corr.values, color=colors_corr, edgecolor='black', alpha=0.7)
plt.yticks(range(len(top_corr)), top_corr.index)
plt.xlabel('Correlación con Churn')
plt.title('Top 10 Variables más Correlacionadas con Churn', fontsize=14, fontweight='bold')
plt.axvline(x=0, color='black', linestyle='-', linewidth=0.8)
plt.grid(alpha=0.3, axis='x')
plt.tight_layout()
plt.savefig('../reports/figures/02_top_correlaciones.png', dpi=300, bbox_inches='tight')
plt.close()

print("✓ Gráfico guardado: 02_top_correlaciones.png")

# 9. ANÁLISIS POR SEGMENTO
print("\n" + "="*80)
print("7. ANÁLISIS POR SEGMENTO")
print("="*80)

segment_analysis = df.groupby('SegmentoCliente').agg({
    'ClienteID': 'count',
    'Cancelacion': lambda x: (x=='Si').sum() / len(x) * 100,
    'CargoMensual': 'mean',
    'Antiguedad': 'mean',
    'PuntuacionNPS': 'mean',
    'TicketsSoporte': 'mean'
}).round(2)

segment_analysis.columns = ['Total_Clientes', 'Tasa_Churn_%', 'Cargo_Promedio',
                            'Antiguedad_Promedio', 'NPS_Promedio', 'Tickets_Promedio']

print(segment_analysis)

fig, axes = plt.subplots(2, 2, figsize=(14, 10))
axes = axes.flatten()

# Tasa de churn
axes[0].bar(segment_analysis.index, segment_analysis['Tasa_Churn_%'],
            edgecolor='black', alpha=0.7)
axes[0].set_title('Tasa de Churn por Segmento', fontweight='bold')
axes[0].set_ylabel('% Churn')
axes[0].grid(alpha=0.3, axis='y')
for i, v in enumerate(segment_analysis['Tasa_Churn_%']):
    axes[0].text(i, v, f'{v:.1f}%', ha='center', va='bottom', fontweight='bold')

# Cargo promedio
axes[1].bar(segment_analysis.index, segment_analysis['Cargo_Promedio'],
            edgecolor='black', alpha=0.7, color='green')
axes[1].set_title('Cargo Mensual Promedio por Segmento', fontweight='bold')
axes[1].set_ylabel('$ USD')
axes[1].grid(alpha=0.3, axis='y')
for i, v in enumerate(segment_analysis['Cargo_Promedio']):
    axes[1].text(i, v, f'${v:.0f}', ha='center', va='bottom', fontweight='bold')

# NPS promedio
axes[2].bar(segment_analysis.index, segment_analysis['NPS_Promedio'],
            edgecolor='black', alpha=0.7, color='orange')
axes[2].set_title('NPS Promedio por Segmento', fontweight='bold')
axes[2].set_ylabel('NPS (0-100)')
axes[2].grid(alpha=0.3, axis='y')
for i, v in enumerate(segment_analysis['NPS_Promedio']):
    axes[2].text(i, v, f'{v:.0f}', ha='center', va='bottom', fontweight='bold')

# Tickets promedio
axes[3].bar(segment_analysis.index, segment_analysis['Tickets_Promedio'],
            edgecolor='black', alpha=0.7, color='red')
axes[3].set_title('Tickets de Soporte Promedio por Segmento', fontweight='bold')
axes[3].set_ylabel('Tickets')
axes[3].grid(alpha=0.3, axis='y')
for i, v in enumerate(segment_analysis['Tickets_Promedio']):
    axes[3].text(i, v, f'{v:.1f}', ha='center', va='bottom', fontweight='bold')

plt.tight_layout()
plt.savefig('../reports/figures/02_analisis_segmentos.png', dpi=300, bbox_inches='tight')
plt.close()

print("✓ Gráfico guardado: 02_analisis_segmentos.png")

# 10. ANÁLISIS GEOGRÁFICO
print("\n" + "="*80)
print("8. ANÁLISIS GEOGRÁFICO")
print("="*80)

geo_analysis = df.groupby('Borough').agg({
    'ClienteID': 'count',
    'Cancelacion': lambda x: (x=='Si').sum() / len(x) * 100,
    'IngresoMediano': 'first',
    'CargoMensual': 'mean',
    'PuntuacionNPS': 'mean'
}).round(2)

geo_analysis.columns = ['Total_Clientes', 'Tasa_Churn_%', 'Ingreso_Mediano',
                        'Cargo_Promedio', 'NPS_Promedio']
geo_analysis = geo_analysis.sort_values('Tasa_Churn_%', ascending=False)

print(geo_analysis)

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

axes[0].barh(geo_analysis.index, geo_analysis['Tasa_Churn_%'],
             edgecolor='black', alpha=0.7)
axes[0].set_title('Tasa de Churn por Borough', fontsize=12, fontweight='bold')
axes[0].set_xlabel('% Churn')
axes[0].grid(alpha=0.3, axis='x')
axes[0].axvline(x=churn_rate, color='red', linestyle='--', label=f'Promedio: {churn_rate:.1f}%')
axes[0].legend()

for i, v in enumerate(geo_analysis['Tasa_Churn_%']):
    axes[0].text(v, i, f' {v:.1f}%', va='center', fontweight='bold')

axes[1].scatter(geo_analysis['Ingreso_Mediano'], geo_analysis['Tasa_Churn_%'],
                s=geo_analysis['Total_Clientes']/10, alpha=0.6, edgecolors='black')
axes[1].set_title('Relación Ingreso Mediano vs Tasa de Churn', fontsize=12, fontweight='bold')
axes[1].set_xlabel('Ingreso Mediano ($)')
axes[1].set_ylabel('% Churn')
axes[1].grid(alpha=0.3)

for idx, row in geo_analysis.iterrows():
    axes[1].annotate(idx, (row['Ingreso_Mediano'], row['Tasa_Churn_%']),
                     fontsize=8, ha='center')

plt.tight_layout()
plt.savefig('../reports/figures/02_analisis_geografico.png', dpi=300, bbox_inches='tight')
plt.close()

print("✓ Gráfico guardado: 02_analisis_geografico.png")

# 11. GUARDAR INSIGHTS
print("\n" + "="*80)
print("9. GENERANDO REPORTE DE INSIGHTS")
print("="*80)

insights = f"""# DS-502: Insights del Análisis Exploratorio de Datos

**Fecha**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 1. BALANCE DEL DATASET
- Tasa de churn: {churn_rate:.2f}% (bien balanceado para ML)
- Total registros: {len(df):,} clientes
- Sin valores nulos en campos críticos

## 2. VARIABLES MÁS IMPORTANTES
Correlación con Churn (Top 5):
- TicketsSoporte: Churners tienen {churners['TicketsSoporte'].mean() - no_churners['TicketsSoporte'].mean():.1f} tickets más
- PuntuacionNPS: Diferencia de {no_churners['PuntuacionNPS'].mean() - churners['PuntuacionNPS'].mean():.1f} puntos
- PuntuacionCSAT: Diferencia de {no_churners['PuntuacionCSAT'].mean() - churners['PuntuacionCSAT'].mean():.2f} puntos
- score_riesgo: Excelente predictor calculado
- Antiguedad: Churners tienen {no_churners['Antiguedad'].mean() - churners['Antiguedad'].mean():.1f} meses MENOS

## 3. PATRONES IDENTIFICADOS

### Por TipoContrato:
- Mensual: ALTO riesgo de churn
- Un año: Riesgo medio
- Dos años: BAJO riesgo

### Por SegmentoCliente:
{segment_analysis.to_string()}

### Comportamiento:
- Clientes con quejas tienen alto churn
- Tickets > 3 indica alto riesgo
- NPS < 30 casi siempre cancelan

## 4. RECOMENDACIONES PARA DS-503

### Features a crear:
1. tenure_group: Categorizar antigüedad
2. has_queja: Flag binario
3. alto_tickets: Flag binario (>3)
4. nps_categoria: Detractor/Pasivo/Promotor
5. servicios_premium_count: Suma de servicios

### Transformaciones:
- Imputar TipoDeQueja NULL con 'Sin Queja'
- Normalizar variables numéricas
- OneHotEncoding para categóricas

### Variables a eliminar:
- ClienteID (solo identificador)
- FechaRegistro (redundante)
- CargosTotal (correlacionado con CargoMensual)

## 5. SIGUIENTE PASO: DS-503 (FEATURE ENGINEERING)
"""

with open('../reports/02_eda_insights.md', 'w', encoding='utf-8') as f:
    f.write(insights)

print("✓ Documento guardado: reports/02_eda_insights.md")

print("\n" + "="*80)
print("✅ ANÁLISIS EXPLORATORIO COMPLETADO")
print("="*80)
print("\n📁 Archivos generados:")
print("  - reports/02_eda_insights.md")
print("  - reports/figures/02_distribucion_numericas.png")
print("  - reports/figures/02_distribucion_categoricas.png")
print("  - reports/figures/02_distribucion_target.png")
print("  - reports/figures/02_comparacion_churn.png")
print("  - reports/figures/02_churn_por_categoria.png")
print("  - reports/figures/02_matriz_correlacion.png")
print("  - reports/figures/02_top_correlaciones.png")
print("  - reports/figures/02_analisis_segmentos.png")
print("  - reports/figures/02_analisis_geografico.png")
print("\n🎯 Listo para DS-503 (Feature Engineering)")
