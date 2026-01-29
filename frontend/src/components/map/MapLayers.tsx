import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { HeatmapPoint } from '@/hooks/useHeatmapData';
import {
    SOCIOECONOMIC_FILL_PAINT,
    POPULATION_FILL_PAINT,
    HEATMAP_PAINT,
    CLUSTER_CIRCLE_PAINT,
    CLUSTER_COUNT_LAYOUT,
    CLUSTER_COUNT_PAINT,
    POINT_CIRCLE_PAINT,
    BOROUGH_FILL_PAINT,
    BOROUGH_LINE_PAINT
} from '@/constants/mapStyles';
import { calculateBoroughStats, enrichBoroughFeatures } from '@/utils/mapDataUtils';
import { setupInteractions } from '@/logic/mapInteractions';

export interface MapLayersProps {
    map: React.RefObject<mapboxgl.Map | null>;
    mapReady: boolean;
    layers: {
        heatmap: boolean;
        borough: boolean;
        socioeconomic: boolean;
        population: boolean;
    };
    heatmapData: HeatmapPoint[];
}

export const MapLayers = ({ map, mapReady, layers, heatmapData }: MapLayersProps) => {
    // Setup layers once map is ready
    useEffect(() => {
        if (!map.current || !mapReady) return;

        const initializeLayers = async () => {
            try {
                // 1️⃣ CREAR SOURCE VACÍO PRIMERO
                if (!map.current?.getSource('socioeconomic')) {
                    map.current?.addSource('socioeconomic', {
                        type: 'geojson',
                        data: { type: 'FeatureCollection', features: [] }
                    });
                }

                // 2️⃣ CREAR CAPAS
                // CAPA SOCIOECONÓMICA
                if (!map.current?.getLayer('socioeconomic-fill')) {
                    map.current?.addLayer({
                        id: 'socioeconomic-fill',
                        type: 'fill',
                        source: 'socioeconomic',
                        layout: { 'visibility': 'none' },
                        paint: SOCIOECONOMIC_FILL_PAINT
                    });
                }

                // CAPA DE POBLACIÓN
                if (!map.current?.getLayer('population-fill')) {
                    map.current?.addLayer({
                        id: 'population-fill',
                        type: 'fill',
                        source: 'socioeconomic',
                        layout: { 'visibility': 'none' },
                        paint: POPULATION_FILL_PAINT
                    });
                }

                // 3️⃣ CARGAR Y AGREGAR DATOS
                if (heatmapData.length > 0) {
                    const response = await fetch('/nyc-boroughs.geojson');
                    const boroughsGeoJSON = await response.json();

                    // Calcular estadísticas usando la utilidad extraída
                    const boroughStats = calculateBoroughStats(heatmapData);

                    // Enriquecer GeoJSON
                    enrichBoroughFeatures(boroughsGeoJSON.features, boroughStats);

                    // Actualizar source con datos reales
                    const source = map.current?.getSource('socioeconomic') as mapboxgl.GeoJSONSource;
                    if (source) {
                        source.setData(boroughsGeoJSON);
                        console.log('✅ Datos de boroughs actualizados');
                    }
                }
            } catch (error) {
                console.error('❌ Error inicializando capas:', error);
            }
        };

        initializeLayers();

        // 3️⃣ BORDES DE DISTRITOS
        map.current.addLayer({
            id: 'borough-fill',
            type: 'fill',
            source: 'boroughs',
            layout: { 'visibility': 'none' },
            paint: BOROUGH_FILL_PAINT
        });

        map.current.addLayer({
            id: 'borough-boundaries',
            type: 'line',
            source: 'boroughs',
            layout: {
                'line-join': 'round',
                'line-cap': 'round',
                'visibility': 'none'
            },
            paint: BOROUGH_LINE_PAINT
        });

        // 4️⃣ Bordes internos (opcionales)
        if (!map.current.getLayer('socioeconomic-outline')) {
            map.current.addLayer({
                id: 'socioeconomic-outline',
                type: 'line',
                source: 'socioeconomic',
                layout: { 'visibility': 'none' },
                paint: {
                    'line-color': '#ffffff',
                    'line-width': 1,
                    'line-opacity': 0.3
                }
            });
        }

        // Heatmap layer
        map.current.addLayer({
            id: "churn-heat",
            type: "heatmap",
            source: "customers-points",
            filter: ['>=', ['get', 'probability'], 0.40],
            maxzoom: 14,
            layout: { 'visibility': 'visible' },
            paint: HEATMAP_PAINT,
        });

        // Cluster layers
        map.current.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'customers-clustered',
            filter: ['has', 'point_count'],
            layout: { 'visibility': 'none' },
            paint: CLUSTER_CIRCLE_PAINT
        });

        map.current.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'customers-clustered',
            filter: ['has', 'point_count'],
            layout: CLUSTER_COUNT_LAYOUT,
            paint: CLUSTER_COUNT_PAINT
        });

        // Individual points layer
        map.current.addLayer({
            id: "churn-point",
            type: "circle",
            source: "customers-points",
            filter: ['!', ['has', 'point_count']],
            minzoom: 14,
            paint: POINT_CIRCLE_PAINT,
        });

        // Setup interactions
        setupInteractions(map.current);
    }, [map, mapReady]);

    // Update layer visibility
    useEffect(() => {
        if (!map.current || !mapReady) return;

        // Puntos individuales: Color dinámico (Mantenemos esto aquí porque es dinámico y simple)
        map.current.setPaintProperty('churn-point', 'circle-color', [
            "match",
            ["get", "risk"],
            "High", "#dc2626",
            "Medium", "#f59e0b",
            "Low", "#10b981",
            "#94a3b8"
        ]);
        map.current.setPaintProperty('churn-point', 'circle-opacity', 0.9);

        // Visibilidad dinámica
        const toggleLayer = (layerId: string, visible: boolean) => {
            if (map.current?.getLayer(layerId)) {
                map.current.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
            }
        };

        toggleLayer('churn-heat', layers.heatmap);

        // Clusters siempre visibles si existen las capas
        toggleLayer('clusters', true);
        toggleLayer('cluster-count', true);

        // Capa Distritos
        toggleLayer('borough-boundaries', layers.borough || layers.socioeconomic || layers.population);
        // Note: borough-labels was commented out in original code, ignoring here too.

        // Capas Temáticas
        toggleLayer('socioeconomic-fill', layers.socioeconomic);
        toggleLayer('population-fill', layers.population);

        // Bordes internos compartidos
        toggleLayer('socioeconomic-outline', layers.socioeconomic || layers.population);

    }, [layers, mapReady, map, heatmapData]);

    return null;
};
