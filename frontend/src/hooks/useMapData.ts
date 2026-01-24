import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { FeatureCollection } from 'geojson';
import { HeatmapPoint } from './useHeatmapData';

const LOCATIONS: Record<string, { lat: number; lng: number; zoom: number; country: string }> = {
    "New York": { lat: 40.7128, lng: -74.0060, zoom: 10, country: "USA" },
    "London": { lat: 51.5074, lng: -0.1278, zoom: 11, country: "UK" },
    "Berlin": { lat: 52.5200, lng: 13.4050, zoom: 11, country: "Germany" },
    "Toronto": { lat: 43.6532, lng: -79.3832, zoom: 11, country: "Canada" },
};

export const useMapData = (
    map: React.RefObject<mapboxgl.Map | null>,
    heatmapData: HeatmapPoint[],
    mapReady: boolean,
    activeCity: string | null
) => {
    useEffect(() => {
        if (!map.current || !mapReady || heatmapData.length === 0) {
            return;
        }

        let filtered = heatmapData;
        if (activeCity) {
            const config = LOCATIONS[activeCity];
            filtered = heatmapData.filter(point =>
                Math.abs(point.latitude - config.lat) < 0.5 &&
                Math.abs(point.longitude - config.lng) < 0.5
            );
        }

        const geoJson: FeatureCollection = {
            type: "FeatureCollection",
            features: filtered.map((point) => ({
                type: "Feature",
                geometry: { type: "Point", coordinates: [point.longitude, point.latitude] },
                properties: {
                    customerId: point.customerId,
                    nombre: point.nombre || 'Desconocido',
                    risk: point.riskLevel,
                    mag: point.riskLevel === 'High' ? 1 : point.riskLevel === 'Medium' ? 0.5 : 0,
                    probability: point.churnProbability,
                    segment: point.segmento,
                    monthlyCharge: point.cargoMensual,
                    borough: point.borough || 'Unknown'
                },
            })),
        };

        const sourceHeatmap = map.current.getSource("customers") as mapboxgl.GeoJSONSource;
        if (sourceHeatmap) {
            sourceHeatmap.setData(geoJson);
        }

        const sourcePoints = map.current.getSource("customers-points") as mapboxgl.GeoJSONSource;
        if (sourcePoints) {
            sourcePoints.setData(geoJson);
        }
    }, [map, heatmapData, mapReady, activeCity]);
};
