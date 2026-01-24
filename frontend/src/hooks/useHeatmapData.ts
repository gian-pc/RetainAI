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
        const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

        const fetchData = async () => {
            try {
                const cachedData = sessionStorage.getItem(CACHE_KEY);
                const cachedTime = sessionStorage.getItem(`${CACHE_KEY}_time`);

                if (cachedData && cachedTime) {
                    const age = Date.now() - parseInt(cachedTime);
                    if (age < CACHE_DURATION) {
                        const parsedData = JSON.parse(cachedData);
                        if (isMounted) {
                            setHeatmapData(parsedData);
                            setLoading(false);
                            dataLoadedRef.current = true;
                        }
                        return;
                    }
                }

                // Timeout de 60 segundos para evitar esperas infinitas
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 60000);

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/dashboard/heatmap?t=${Date.now()}`,
                    { signal: controller.signal }
                );
                clearTimeout(timeout);

                if (!res.ok) throw new Error("Error fetching heatmap data");
                const data: HeatmapPoint[] = await res.json();

                // Guardar TODOS los datos (sin filtrar)
                sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
                sessionStorage.setItem(`${CACHE_KEY}_time`, Date.now().toString());

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
