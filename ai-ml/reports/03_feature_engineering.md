# DS-503: Feature Engineering - Reporte

**Fecha**: 2026-01-13 19:38:31
**Dataset**: dataset_features.csv
**Dimensiones**: 9,701 registros × 52 columnas

## Features Creados (10)

### 1. Variables de Segmentación

**tenure_group**: Categorización de antigüedad del cliente
- Categorías: 0-12 meses, 13-24 meses, 25-48 meses, 49+ meses
- Justificación: Captura relación no lineal entre antigüedad y churn
- Insight: Clientes nuevos (0-12 meses) tienen mayor churn

**income_bracket**: Nivel de ingresos del área
- Categorías: Low (<50K), Medium (50-80K), High (>80K)
- Justificación: Ingreso correlaciona con churn (análisis geográfico)

### 2. Variables de Comportamiento

**has_queja**: Indicador de si el cliente tiene quejas registradas
- Valores: 0 (sin queja), 1 (con queja)
- Insight: Clientes con quejas tienen 60.1pp más churn

**alto_tickets**: Flag de alto volumen de tickets de soporte
- Valores: 0 (≤3 tickets), 1 (>3 tickets)
- Justificación: TicketsSoporte es el predictor más fuerte (corr: +0.847)
- Insight: >3 tickets indica problemas graves con el servicio

**servicios_premium_count**: Cantidad de servicios premium contratados
- Rango: 0-4 servicios
- Servicios: SeguridadOnline, RespaldoOnline, ProteccionDispositivo, SoporteTecnico
- Insight: Más servicios = mayor engagement = menor churn

### 3. Variables de Satisfacción

**nps_categoria**: Categorización de NPS según metodología estándar
- Categorías: Detractor (0-6), Pasivo (7-8), Promotor (9-10)
- Insight: Detractores tienen 100.0% churn vs Promotores 20.5%

**csat_categoria**: Nivel de satisfacción con el servicio
- Categorías: Insatisfecho (<3), Neutral (=3), Satisfecho (>3)

**risk_flag**: Indicador de alto riesgo de churn
- Valores: 0 (score_riesgo ≤70), 1 (score_riesgo >70)
- Insight: Alto riesgo correlaciona con nan% churn

### 4. Variables Geográficas

**borough_risk**: Tasa promedio de churn por borough de NYC
- Rango: 24.61% - 29.02%
- Justificación: Diferencias geográficas en churn (DS-502)

**high_density_area**: Flag de zona de alta densidad poblacional
- Valores: 0 (≤mediana), 1 (>mediana)
- Mediana: 13,000 hab/km²

## Correlaciones con Churn

Features numéricos nuevos:
- alto_tickets: 0.7913
- has_queja: 0.6673
- servicios_premium_count: -0.1763
- borough_risk: 0.0345
- high_density_area: 0.0254
- risk_flag: nan


## Archivos Generados

### Dataset:
- data/processed/dataset_features.csv (9,701 × 52)

### Visualizaciones:
- reports/figures/03_churn_by_tenure_group.png
- reports/figures/03_churn_by_has_queja.png
- reports/figures/03_churn_by_premium_services.png
- reports/figures/03_churn_by_nps_categoria.png
- reports/figures/03_risk_by_borough.png
- reports/figures/03_new_features_correlation.png

## Próximo Paso

**DS-504: Model Training**
- Dataset listo con 52 features
- Target: Cancelacion (Si/No)
- Split: 80% train, 20% test
- Modelos a probar: Logistic Regression, Random Forest, XGBoost
