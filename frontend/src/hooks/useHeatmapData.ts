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
}

export const useHeatmapData = () => {
    const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const dataLoadedRef = useRef(false);

    useEffect(() => {
        // Solo cargar datos UNA VEZ
        if (dataLoadedRef.current) return;

        let isMounted = true;
        const CACHE_KEY = 'churnmap_data';
        const CACHE_VERSION = 'v3'; // Incrementar para forzar recarga
        const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

        const fetchData = async () => {
            try {
                const cachedData = sessionStorage.getItem(CACHE_KEY);
                const cachedTime = sessionStorage.getItem(`${CACHE_KEY}_time`);
                const cachedVersion = sessionStorage.getItem(`${CACHE_KEY}_version`);

                // Si la versión no coincide, limpiar caché inmediatamente
                if (cachedVersion && cachedVersion !== CACHE_VERSION) {
                    console.log('🔄 Limpiando caché antiguo (versión:', cachedVersion, '→', CACHE_VERSION, ')');
                    sessionStorage.removeItem(CACHE_KEY);
                    sessionStorage.removeItem(`${CACHE_KEY}_time`);
                    sessionStorage.removeItem(`${CACHE_KEY}_version`);
                }

                if (cachedData && cachedTime && cachedVersion === CACHE_VERSION) {
                    const age = Date.now() - parseInt(cachedTime);
                    if (age < CACHE_DURATION) {
                        const parsedData = JSON.parse(cachedData);

                        // Calcular distribución de riesgo del caché
                        const riskCounts = parsedData.reduce((acc: Record<string, number>, p: HeatmapPoint) => {
                            acc[p.riskLevel] = (acc[p.riskLevel] || 0) + 1;
                            return acc;
                        }, {} as Record<string, number>);

                        console.log('✅ Usando datos del caché (versión', CACHE_VERSION, ')', {
                            total: parsedData.length,
                            distribución: riskCounts,
                            edad: Math.round(age / 1000) + 's'
                        });

                        if (isMounted) {
                            setHeatmapData(parsedData);
                            setLoading(false);
                            dataLoadedRef.current = true;
                        }
                        return;
                    }
                }

                // Timeout extendido a 3 minutos para datos grandes
                const controller = new AbortController();
                const timeout = setTimeout(() => {
                    console.log('⚠️ Fetch timeout alcanzado after 180s');
                    controller.abort();
                }, 180000); // 3 minutos

                console.log('🔄 Iniciando fetch de heatmap...');
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/dashboard/heatmap?t=${Date.now()}`,
                    { signal: controller.signal }
                );
                clearTimeout(timeout);

                if (!res.ok) throw new Error("Error fetching heatmap data");
                const data: HeatmapPoint[] = await res.json();

                // Calcular distribución de riesgo para logging
                const riskCounts = data.reduce((acc, p) => {
                    acc[p.riskLevel] = (acc[p.riskLevel] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                console.log('📥 Datos frescos cargados del backend:', {
                    total: data.length,
                    distribución: riskCounts,
                    versión: CACHE_VERSION
                });

                // Guardar TODOS los datos (sin filtrar)
                sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
                sessionStorage.setItem(`${CACHE_KEY}_time`, Date.now().toString());
                sessionStorage.setItem(`${CACHE_KEY}_version`, CACHE_VERSION);

                if (isMounted) {
                    setHeatmapData(data);
                    dataLoadedRef.current = true;
                }
            } catch (error: any) {
                console.error("Error cargando datos del mapa:", error);
                if (isMounted) {
                    dataLoadedRef.current = true;
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    return { heatmapData, loading };
};
