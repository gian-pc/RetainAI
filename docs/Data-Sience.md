# Proyecto 
* El objetivo del proyecto busca que el equipo de Data Science construya un modelo predictivo de churn  
* (probabilidad de abandono o cancelación), disponer el modelo al equipo de Back-end y exponga esa predicción
* mediante una API, esto permitirá que otras áreas del negocio como marketing, soporte, ventas etc. actúen 
* de forma anticipada para retener clientes antes de que decidan irse.

* El cliente (la empresa) necesita una forma de anticipar quién está a punto de cancelar, para intervenir 
* a tiempo con ofertas, beneficios o acciones de soporte que aumenten la probabilidad de retención.
* En términos simples: Saber quién está en riesgo antes de que se vaya, para poder evitarlo.

## Problema del cliente (explicación no técnica)

* Las empresas que trabajan con suscripciones o contratos recurrentes enfrentan un desafío constante: 
* la cancelación de clientes. Perder clientes es costoso, y adquirir nuevos lo es aún más.

## Conjunto de Datos

* El conjunto de datos utilizado es sintético, pero realista para el negocio, y está diseñado para casos de uso 
* de aprendizaje automático, ciencia de datos y análisis predictivo, los datos simulan el comportamiento 
* real de los clientes al incorporar datos demográficos, patrones de uso de productos, historial de 
* facturación y pagos, interacciones de atención al cliente y métricas de interacción.

* La variable objetivo, ****abandonar**** indica la probabilidad de que un cliente interrumpa el servicio.

* Las etiquetas de pérdida de clientes se generan mediante reglas basadas en el negocio combinadas con 
* ruido probabilístico, lo que garantiza correlaciones realistas de características en lugar de un 
* etiquetado aleatorio.
 
## Este conjunto de datos es ideal para:

* ✅ Análisis exploratorio de datos (EDA)

* ✅ Ingeniería de características

* ✅ Modelado de predicción de abandono de clientes

* ✅ IA explicable (SHAP, importancia de las características)

* ✅ Generar cuadros de mando empresariales y sistemas de apoyo a la toma de decisiones

## Características del conjunto de datos

***Número de registros:*** * 10.000 clientes

***Variable objetivo:*** * abandonar (0 = No, 1 = Sí)

***Tipos de datos:*** * numéricos y categóricos

***Dominio:*** * Suscripción / SaaS / Telecomunicaciones / Negocio de servicios

## Fuente de datos: sintética (basada en la lógica empresarial)

* ![customer_dataset](https://www.kaggle.com)

## Categorías de funciones

***Perfil del cliente:*** *edad, género, ubicación, antigüedad, tipo de contrato

***Uso del producto:*** *inicios de sesión, duración de la sesión, uso de funciones, tendencias de actividad

***Facturación y pago:*** *tarifas de suscripción, ingresos, fallos de pago, descuentos

***Atención al cliente:*** *tickets, tiempo de resolución, CSAT, quejas

***Participación y retroalimentación:*** *actividad de correo electrónico, puntuación NPS, respuestas de encuestas

## Objetivos que cumple el conjunto de Datos

* **Predecir clientes con alto riesgo de abandono

* **Identificar los principales factores de abandono

* **Estimar los ingresos en riesgo

* **Desarrollar estrategias de retención

* **Entrenar y evaluar modelos ML/DL

* **Crear paneles de control empresariales de nivel ejecutivo

## Descripción de los campos

***Campo                              Descripcion

***cliente_id:                   *** *Identificador único del cliente
***genero:                       *** *Género declarado del cliente
***edad:                         *** *Edad del cliente en años
***pais:                         *** *País de residencia
***ciudad:                       *** *Ciudad de residencia
***segmento_de_cliente:          *** *Tipo de cliente según tamaño/rol, engloba pequeñas y medianas empresas SME(Small and Medium Enterprises)
***meses_permanencia:            *** *Tiempo de permanencia como cliente (en meses)
***canal_de_registro:            *** *Medio por el cual se registró
***tipo_contrato:                *** *Modalidad de contrato
***conecciones_mensuales:        *** *Número de conexiones al servicio por mes
***dias_activos_semanales:       *** *Días promedio de uso por semana
***promedio_coneccion:           *** *Duración promedio de cada conexión (minutos)
***caracteristicas_usadas:       *** *Número de funcionalidades utilizadas
***tasa_crecimiento_uso:         *** *Variación porcentual del uso en el tiempo
***ultima_coneccion:             *** *Fecha de la última conexión
***cuota_mensual:                *** *Monto de la cuota mensual
***ingresos_totales:             *** *Total acumulado de ingresos por cliente
***metodo_de_pago:               *** *Forma de pago utilizada
***errores_de_pago:              *** *Número de fallos en transacciones
***descuento_aplicado:           *** *Porcentaje de descuento otorgado
***aumento_ultimos_3_meses:      *** *Incremento en cuota o consumo en últimos 3 meses
***tickets_de_soporte:           *** *Número de tickets abiertos
***tiempo_promedio_de_resolucion:*** *Tiempo promedio para resolver tickets (horas)
***tipo_de_queja:                *** *Clasificación de la queja
***puntuacion_csates:            *** *Puntuación de satisfacción del cliente (CSAT, 1–5)
***escaladas:                    *** *Número de casos escalados a niveles superiores
***tasa_apertura_email:          *** *Porcentaje de apertura de correos
***tasa_clics_marketing:         *** *Porcentaje de clics en campañas
***puntuacion_nps:               *** *Net Promoter Score (0–10)
***respuesta_de_la_encuesta:     *** *Comentarios abiertos del cliente
***recuento_de_referencias:      *** *Número de veces que el cliente fue referido
***abandonar:                    *** *Indicador de churn (abandono)



## Exploración y limpieza del Conjunto de datos(EDA);

   * Exploración de las columnas del dataset y verificación de sus tipos de datos
   * Conversión de los datos a un DataFrame de Pandas para facilitar su manipulación
   * Exploración de las columnas del dataset y verificación de sus tipos de datos.
   * Se verifica la existencia de registros nulos
   
## Preprocesamiento de datos

   * Encoding de variables categóricas
   * Normalización de datos
   * Correlación entre variables
   * Análisis de multicolinealidad
   * Análisis dirigido
   
## Modelado de datos

   * Train Test split
   * Escalado de variables numéricas
   * Balance del dataset
   * Baseline Model - Decision Tree Classifier
   * Random Forest Classifier
   * Conclusiones Random Forest Classifier
   * Logistic Regression
   * Conclusiones Logistic Regresion
   * K-Nearest Neighbors
   * Conclusiones K-Nearest Neighbors (KNN)
   * XGBoost Classifier
   * Conclusiones XGBoost Classifier
   * Support Vector Machine
   
## Evaluación Best Models

   * Métricas Generales
   * Subajuste (Underfitting) y Sobreajuste (Overfitting)
   * Matrices de confusión
   * Importancias y Coeficientes
   
## Champion Model

## Pipeline de prueba en entorno productivo

   * Generación de datos artificiales
   * Pipeline de prueba
   
   
