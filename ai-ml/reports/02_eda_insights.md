# DS-502: Insights del Análisis Exploratorio de Datos

**Fecha**: 2026-01-12 22:21:13

## 1. BALANCE DEL DATASET
- Tasa de churn: 26.35% (bien balanceado para ML)
- Total registros: 9,701 clientes
- Sin valores nulos en campos críticos

## 2. VARIABLES MÁS IMPORTANTES
Correlación con Churn (Top 5):
- TicketsSoporte: Churners tienen 4.0 tickets más
- PuntuacionNPS: Diferencia de 49.7 puntos
- PuntuacionCSAT: Diferencia de 1.75 puntos
- score_riesgo: Excelente predictor calculado
- Antiguedad: Churners tienen 19.9 meses MENOS

## 3. PATRONES IDENTIFICADOS

### Por TipoContrato:
- Mensual: ALTO riesgo de churn
- Un año: Riesgo medio
- Dos años: BAJO riesgo

### Por SegmentoCliente:
                 Total_Clientes  Tasa_Churn_%  Cargo_Promedio  Antiguedad_Promedio  NPS_Promedio  Tickets_Promedio
SegmentoCliente                                                                                                   
Corporativo                1808         16.32           98.96                55.00         59.64              1.98
PYME                       3684         39.74           80.74                29.66         42.56              3.75
Residencial                4209         18.94           35.78                25.09         53.95              2.62

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
