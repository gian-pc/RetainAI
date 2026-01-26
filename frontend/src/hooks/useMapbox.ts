import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

const NYC_BOUNDS: [number, number, number, number] = [
    -74.25909, 40.477399, // Southwest coordinates (Staten Island tip)
    -73.700272, 40.917577  // Northeast coordinates (Bronx top)
];

export const useMapbox = (mapContainer: React.RefObject<HTMLDivElement | null>) => {
    const map = useRef<mapboxgl.Map | null>(null);
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

        if (!token) {
            console.error("Error: MAPBOX_TOKEN no encontrado en variables de entorno");
            return;
        }

        mapboxgl.accessToken = token;

        try {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: "mapbox://styles/mapbox/light-v11",
                center: [-73.96, 40.70],
                zoom: 9.5,
                pitch: 0,
                projection: { name: 'mercator' }
            });

            map.current.on("error", (e) => {
                console.error("Error de Mapbox:", e);
            });

            map.current.on("load", () => {
                // Add sources
                map.current?.addSource("customers", {
                    type: "geojson",
                    data: { type: "FeatureCollection", features: [] },
                });

                map.current?.addSource("customers-points", {
                    type: "geojson",
                    data: { type: "FeatureCollection", features: [] },
                    cluster: true, // Clustering activado
                    clusterMaxZoom: 14,
                    clusterRadius: 50
                });

                map.current?.addSource('boroughs', {
                    type: 'geojson',
                    data: '/nyc-boroughs.geojson',
                    promoteId: 'cartodb_id'
                });

                setMapReady(true);
            });
        } catch (error) {
            console.error("Error inicializando Mapbox:", error);
        }
    }, [mapContainer]);

    return { map, mapReady };
};
