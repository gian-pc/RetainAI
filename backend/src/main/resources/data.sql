-- CLIENTE 1: Riesgo Alto
INSERT IGNORE INTO customers (cliente_id, genero, edad, pais, ciudad, segmento_de_cliente, meses_permanencia, canal_de_registro, tipo_contrato, conecciones_mensuales, dias_activos_semanales, promedio_coneccion, caracteristicas_usadas, tasa_crecimiento_uso, ultima_coneccion, cuota_mensual, ingresos_totales, metodo_de_pago, errores_de_pago, descuento_aplicado, aumento_ultimos_3_meses, tickets_de_soporte, tiempo_promedio_resolucion, tipo_de_queja, puntuacion_csat, escaladas, tasa_apertura_email, tasa_clics_marketing, puntuacion_nps, respuesta_encuesta, recuento_referencias, abandono_historico)
VALUES ('TEST_USER_001', 'Masculino', 35, 'España', 'Madrid', 'SME', 12, 'Web', 'Mensual', 20, 5, 15.5, 3, 0.5, 2, 50.0, 600.0, 'Tarjeta', 0, 'No', 'Si', 1, 24.5, 'Facturacion', 4.5, 0, 0.8, 0.2, 9, 'Satisfecho', 2, 0);

INSERT IGNORE INTO predictions (probabilidad_fuga, resultado_prediccion, factor_principal, fecha_prediccion, cliente_id)
VALUES (0.85, 'Fuga Inminente', 'Precio alto', NOW(), 'TEST_USER_001');

-- CLIENTE 2: Riesgo Bajo (Cliente Feliz)
INSERT IGNORE INTO customers (cliente_id, genero, edad, pais, ciudad, segmento_de_cliente, meses_permanencia, canal_de_registro, tipo_contrato, conecciones_mensuales, dias_activos_semanales, promedio_coneccion, caracteristicas_usadas, tasa_crecimiento_uso, ultima_coneccion, cuota_mensual, ingresos_totales, metodo_de_pago, errores_de_pago, descuento_aplicado, aumento_ultimos_3_meses, tickets_de_soporte, tiempo_promedio_resolucion, tipo_de_queja, puntuacion_csat, escaladas, tasa_apertura_email, tasa_clics_marketing, puntuacion_nps, respuesta_encuesta, recuento_referencias, abandono_historico)
VALUES ('TEST_USER_002', 'Femenino', 28, 'Mexico', 'CDMX', 'Enterprise', 24, 'Referido', 'Anual', 45, 7, 20.0, 8, 1.2, 0, 120.0, 2880.0, 'Transferencia', 0, 'Si', 'No', 0, 0.0, 'Ninguna', 5.0, 0, 0.9, 0.6, 10, 'Muy Satisfecho', 5, 0);

INSERT IGNORE INTO predictions (probabilidad_fuga, resultado_prediccion, factor_principal, fecha_prediccion, cliente_id)
VALUES (0.05, 'Cliente Leal', 'Alta satisfaccion', NOW(), 'TEST_USER_002');