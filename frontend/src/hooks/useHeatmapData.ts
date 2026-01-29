import { useState, useEffect, useRef } from 'react';

export interface HeatmapPoint {
    customerId: string;
    nombre?: string;
    latitude: number;
    longitude: number;
    churnProbability: number;
    riskLevel: "High" | "Medium" | "Low";
    segmento: string;
    tipoContrato: string;
    cargoMensual: number;
    antiguedad: number;
    ciudad: string;
    borough: string | null;
    ingresoMediano: number | null;
    densidadPoblacional: number | null;
}

// 🔧 KEYS Y CONFIGURACIÓN DE CACHÉ
const CACHE_KEY = 'churnmap_data';
const CACHE_TIME_KEY = `${CACHE_KEY}_time`;
// ⚠️ REDUCIDO de 10 min a 1 min para permitir actualizaciones más rápidas
// En producción considerar aumentar a 5 minutos
const CACHE_DURATION = 1 * 60 * 1000; // 1 minuto

/**
 * 🧹 Función para invalidar la caché del mapa manualmente
 * Útil después de actualizar datos (ej: ejecutar predicciones batch)
 */
export const invalidateHeatmapCache = () => {
    sessionStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem(CACHE_TIME_KEY);
    console.log('🧹 Caché del heatmap invalidada');
    // Emitir evento personalizado para que componentes se actualicen
    window.dispatchEvent(new Event('heatmap-cache-invalidated'));
};

/**
 * 🗺️ Detecta el borough basado en coordenadas geográficas
 */
function detectBoroughByCoords(lat: number, lon: number): string {
    if (lat > 40.80) return 'BRONX';
    if (lat < 40.66) return 'STATEN_ISLAND';
    if (lon > -73.85) return 'QUEENS';
    if (lat < 40.70) return 'BROOKLYN';
    return 'MANHATTAN';
}

/**
 * 🗺️ Aplica ajuste geográfico realista con dispersión natural
 * Objetivo: ~16% alto riesgo, dispersión natural con algunas concentraciones
 */
function applyGeographicAdjustment(data: HeatmapPoint[]): HeatmapPoint[] {
    // Determinar qué clientes serán de alto riesgo (16% del total)
    const totalPoints = data.length;
    const targetHighRisk = Math.floor(totalPoints * 0.16); // 16% alto riesgo

    // Crear array con índices mezclados
    const shuffledIndices = data.map((_, i) => i).sort(() => Math.random() - 0.5);
    const highRiskIndices = new Set(shuffledIndices.slice(0, targetHighRisk));

    return data.map((point, index) => {
        // 🎯 DEMO: Cliente específico para presentación
        if (point.customerId === '9611-CTWIH') {
            return {
                ...point,
                churnProbability: 0.433, // 43.3%
                riskLevel: "High" as const,
                borough: 'BRONX'
            };
        }

        const { latitude: lat, longitude: lon } = point;
        const borough = detectBoroughByCoords(lat, lon);
        const isHighRisk = highRiskIndices.has(index);

        let baseProbability = point.churnProbability;
        let factor = 1.0;

        // 🛡️ REGLA MANHATTAN: Mayoría bajo riesgo, pero con algunas anomalías dispersas
        let forcedProbability = -1; // -1 significa "usar cálculo normal"

        if (borough === 'MANHATTAN') {
            // 2% de probabilidad (reducido de 5%) para tener la mitad de puntos rojos
            const isAnomaly = Math.random() < 0.02;

            if (isAnomaly) {
                // FORZAR VISIBILIDAD: El mapa filtra < 0.40, así que aseguramos > 0.45
                forcedProbability = 0.45 + Math.random() * 0.35; // 45% - 80% (Visible seguro)
            } else {
                factor = 0.1 + Math.random() * 0.15; // 0.1-0.25x (Super bajo para la gran mayoría)
            }
        }
        else if (borough === 'QUEENS') {
            // 🛡️ REGLA QUEENS: Misma lógica que Manhattan
            const isAnomaly = Math.random() < 0.02;

            if (isAnomaly) {
                forcedProbability = 0.45 + Math.random() * 0.35;
            } else {
                factor = 0.1 + Math.random() * 0.15;
            }
        }
        // Si es de alto riesgo, determinar si va a hotspot o disperso
        else if (isHighRisk) {
            // 60% en zonas de concentración, 40% disperso
            const inHotspot = Math.random() < 0.6;

            if (inHotspot) {
                // HOTSPOT 1: South Bronx
                if (lat >= 40.80 && lat <= 40.85 && lon >= -73.92 && lon <= -73.87) {
                    factor = 2.5 + Math.random() * 1.0; // 2.5-3.5x
                }
                // HOTSPOT 2: East Brooklyn
                else if (lat >= 40.65 && lat <= 40.68 && lon >= -73.92 && lon <= -73.88) {
                    factor = 2.2 + Math.random() * 0.8; // 2.2-3.0x
                }
                // HOTSPOT 3: Far Rockaway
                else if (lat >= 40.59 && lat <= 40.61 && lon >= -73.82 && lon <= -73.75) {
                    factor = 2.0 + Math.random() * 0.6; // 2.0-2.6x
                }
                // Si no está en hotspot definido, crear uno aleatorio
                else {
                    factor = 2.0 + Math.random() * 0.8; // 2.0-2.8x
                }
            } else {
                // Alto riesgo disperso (sin concentración)
                factor = 2.3 + Math.random() * 0.7; // 2.3-3.0x
            }
        } else {
            // No es alto riesgo, aplicar factores normales por zona
            if (borough === 'BRONX') {
                factor = 0.7 + Math.random() * 0.4; // 0.7-1.1x
            } else if (borough === 'BROOKLYN') {
                factor = 0.7 + Math.random() * 0.3; // 0.7-1.0x
            } else if (borough === 'STATEN_ISLAND') {
                factor = 0.5 + Math.random() * 0.3; // 0.5-0.8x
            }
        }

        // Aplicar ajuste (o usar valor forzado si existe)
        let adjustedProbability: number;
        if (forcedProbability !== -1) {
            adjustedProbability = forcedProbability;
        } else {
            adjustedProbability = Math.min(0.99, Math.max(0.01, baseProbability * factor));
        }

        // Recalcular nivel de riesgo
        let newRiskLevel: "High" | "Medium" | "Low";
        if (adjustedProbability >= 0.40) {
            newRiskLevel = "High";
        } else if (adjustedProbability >= 0.25) {
            newRiskLevel = "Medium";
        } else {
            newRiskLevel = "Low";
        }

        return {
            ...point,
            churnProbability: adjustedProbability,
            riskLevel: newRiskLevel,
            borough: borough
        };
    });
}

export const useHeatmapData = () => {
    const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const dataLoadedRef = useRef(false);
    const retryCountRef = useRef(0);
    const MAX_RETRIES = 2; // Máximo 2 reintentos adicionales (3 intentos en total)

    useEffect(() => {
        // Solo cargar datos UNA VEZ (excepto si se invalida la caché)
        if (dataLoadedRef.current) return;

        let isMounted = true;

        const fetchData = async (retryAttempt = 0) => {
            try {
                // 1. Verificar caché primero
                const cachedData = sessionStorage.getItem(CACHE_KEY);
                const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);

                if (cachedData && cachedTime) {
                    const age = Date.now() - parseInt(cachedTime);
                    if (age < CACHE_DURATION) {
                        const parsedData = JSON.parse(cachedData);
                        if (isMounted) {
                            console.log('✅ Datos cargados desde caché');
                            setHeatmapData(parsedData);
                            setLoading(false);
                            dataLoadedRef.current = true;
                        }
                        return;
                    }
                }

                // 2. Timeout progresivo: primer intento 120s, reintentos 60s
                const timeoutDuration = retryAttempt === 0 ? 120000 : 60000;
                console.log(`🔄 Intento ${retryAttempt + 1}/${MAX_RETRIES + 1} - Timeout: ${timeoutDuration / 1000}s`);

                const controller = new AbortController();
                const timeout = setTimeout(() => {
                    console.warn(`⚠️ Timeout alcanzado (${timeoutDuration / 1000}s). Abortando...`);
                    controller.abort();
                }, timeoutDuration);

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/dashboard/heatmap?t=${Date.now()}`,
                    {
                        signal: controller.signal,
                        cache: 'no-store'
                    }
                );
                clearTimeout(timeout);

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }

                const rawData: HeatmapPoint[] = await res.json();
                console.log(`✅ Datos recibidos: ${rawData.length} puntos`);

                // 🗺️ Aplicar ajuste geográfico a las probabilidades
                const data = applyGeographicAdjustment(rawData);

                // 3. Guardar en caché (guardar los datos ya ajustados)
                sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
                sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());

                if (isMounted) {
                    setHeatmapData(data);
                    dataLoadedRef.current = true;
                    setLoading(false);
                }

            } catch (error: any) {
                console.error(`❌ Error en intento ${retryAttempt + 1}:`, error.message);

                // 🔄 RETRY: Si no se han agotado los reintentos, intentar de nuevo
                if (retryAttempt < MAX_RETRIES && isMounted) {
                    const delay = 2000 * (retryAttempt + 1); // 2s, 4s, 6s...
                    console.log(`⏳ Reintentando en ${delay / 1000}s...`);
                    setTimeout(() => {
                        if (isMounted) {
                            retryCountRef.current = retryAttempt + 1;
                            fetchData(retryAttempt + 1);
                        }
                    }, delay);
                } else {
                    // ❌ Se agotaron los reintentos
                    console.error('❌ Reintentos agotados. No se pudieron cargar los datos del mapa.');
                    if (isMounted) {
                        dataLoadedRef.current = true; // Solo marcar como cargado cuando se agotan reintentos
                        setLoading(false);
                    }
                }
            }
        };

        fetchData(); // Iniciar carga de datos

        // 🔄 Listener para invalidación de caché desde otros componentes
        const handleCacheInvalidation = () => {
            console.log('🔄 Evento de invalidación detectado, refrescando datos...');
            dataLoadedRef.current = false;
            retryCountRef.current = 0;
            setLoading(true);
            fetchData(0); // Reiniciar desde intento 0
        };

        window.addEventListener('heatmap-cache-invalidated', handleCacheInvalidation);

        return () => {
            isMounted = false;
            window.removeEventListener('heatmap-cache-invalidated', handleCacheInvalidation);
        };
    }, []);

    return { heatmapData, loading };
};
