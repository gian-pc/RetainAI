import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

type ViewMode = 'risk' | 'borough';

export const useMapLayers = (
    map: React.RefObject<mapboxgl.Map | null>,
    mapReady: boolean,
    viewMode: ViewMode
) => {
    // Setup layers once map is ready
    useEffect(() => {
        if (!map.current || !mapReady) return;

        // Borough layers
        map.current.addLayer({
            id: 'borough-fill',
            type: 'fill',
            source: 'boroughs',
            layout: { 'visibility': 'none' },
            paint: {
                'fill-color': '#94a3b8',
                'fill-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    0.4,
                    0.2
                ]
            }
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
            paint: {
                'line-color': '#64748b',
                'line-width': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    2,
                    1
                ],
                'line-opacity': 0.6
            }
        });

        map.current.addLayer({
            id: 'borough-labels',
            type: 'symbol',
            source: 'boroughs',
            layout: {
                'text-field': ['get', 'name'],
                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                'text-size': 12,
                'text-transform': 'uppercase',
                'text-letter-spacing': 0.1,
                'visibility': 'none'
            },
            paint: {
                'text-color': '#334155',
                'text-halo-color': '#ffffff',
                'text-halo-width': 2
            }
        });

        // Heatmap layer
        map.current.addLayer({
            id: "churn-heat",
            type: "heatmap",
            source: "customers",
            maxzoom: 15,
            paint: {
                "heatmap-weight": [
                    "interpolate", ["linear"], ["get", "mag"],
                    0, 0,
                    0.5, 0.5,
                    1, 1
                ],
                "heatmap-intensity": 1.2,
                "heatmap-color": [
                    "interpolate", ["linear"], ["heatmap-density"],
                    0, "rgba(0,0,0,0)",
                    0.1, "rgba(16, 185, 129, 0.1)",  // Verde muy suave (Low risk)
                    0.3, "rgba(245, 158, 11, 0.3)",  // Amarillo/naranja (Medium risk)
                    0.6, "rgba(239, 68, 68, 0.5)",   // Rojo (High risk)
                    1, "rgba(220, 38, 38, 0.7)"      // Rojo intenso (Very high risk)
                ],
                "heatmap-radius": [
                    "interpolate", ["linear"], ["zoom"],
                    0, 2,
                    13, 25
                ],
                "heatmap-opacity": 0.6
            },
        });

        // Cluster layers
        map.current.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'customers-points',
            filter: ['has', 'point_count'],
            paint: {
                'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    '#60a5fa',
                    50,
                    '#6366f1',
                    100,
                    '#8b5cf6'
                ],
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    15,
                    50,
                    20,
                    100,
                    25
                ],
                'circle-opacity': 0.9,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
            }
        });

        map.current.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'customers-points',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
            },
            paint: {
                'text-color': '#ffffff'
            }
        });

        // Individual points layer
        map.current.addLayer({
            id: "churn-point",
            type: "circle",
            source: "customers-points",
            filter: ['!', ['has', 'point_count']],
            minzoom: 5,
            paint: {
                "circle-radius": [
                    "interpolate", ["linear"], ["zoom"],
                    10, 2,
                    13, 4.5,
                    16, 9
                ],
                "circle-color": "#94a3b8",
                "circle-stroke-color": "#ffffff",
                "circle-stroke-width": 1,
                "circle-opacity": 0.9
            },
        });

        // Setup interactions
        setupInteractions(map.current);
    }, [map, mapReady]);

    // Update layer styles when view mode changes
    useEffect(() => {
        if (!map.current || !mapReady) return;

        if (viewMode === 'risk') {
            map.current.setPaintProperty('churn-point', 'circle-color', [
                "match",
                ["get", "risk"],
                "High", "#dc2626",
                "Medium", "#f59e0b",
                "Low", "#10b981",
                "#94a3b8"
            ]);
            map.current.setLayoutProperty('churn-heat', 'visibility', 'visible');

            ['borough-fill', 'borough-boundaries', 'borough-labels'].forEach(layer => {
                if (map.current?.getLayer(layer)) {
                    map.current.setLayoutProperty(layer, 'visibility', 'none');
                }
            });
        } else {
            map.current.setPaintProperty('churn-point', 'circle-color', [
                "match",
                ["upcase", ["get", "borough"]],
                "MANHATTAN", "#3b82f6",
                "BROOKLYN", "#f97316",
                "QUEENS", "#8b5cf6",
                "BRONX", "#d946ef",
                "STATEN ISLAND", "#10b981",
                "#64748b"
            ]);
            map.current.setLayoutProperty('churn-heat', 'visibility', 'none');

            ['borough-fill', 'borough-boundaries', 'borough-labels'].forEach(layer => {
                if (map.current?.getLayer(layer)) {
                    map.current.setLayoutProperty(layer, 'visibility', 'visible');
                }
            });
        }
    }, [viewMode, mapReady, map]);
};

const setupInteractions = (map: mapboxgl.Map) => {
    // Click on clusters to zoom in
    map.on('click', 'clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });

        if (!features || !features.length) return;

        const clusterId = features[0].properties?.cluster_id;
        const source = map.getSource('customers-points') as mapboxgl.GeoJSONSource;

        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || zoom === null || zoom === undefined) return;

            map.easeTo({
                center: (features[0].geometry as any).coordinates,
                zoom: zoom + 1
            });
        });
    });

    // Cursor changes
    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });

    // Click on individual points for popup
    map.on('click', 'churn-point', (e) => {
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        const coordinates = (feature.geometry as any).coordinates.slice();
        const props = feature.properties;

        if (!props) return;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        const riskColor = props.risk === 'High' ? 'text-red-600' : props.risk === 'Medium' ? 'text-amber-500' : 'text-emerald-500';
        const riskLabel = props.risk === 'High' ? 'Alto' : props.risk === 'Medium' ? 'Medio' : 'Bajo';
        const prob = (props.probability * 100).toFixed(1);
        const charge = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(props.monthlyCharge);

        const htmlContent = `
      <div class="p-1 min-w-[200px]">
        <div class="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
          <span class="text-xs font-bold text-gray-500 uppercase tracking-wide">ID Cliente</span>
          <span class="font-mono text-xs text-gray-400">#${props.customerId}</span>
        </div>
        
         <div class="mb-3">
           <h3 class="font-bold text-gray-900 text-sm leading-tight">${props.nombre}</h3>
         </div>
        
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-500">Riesgo</span>
            <span class="text-xs font-bold ${riskColor} bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
              ${riskLabel} (${prob}%)
            </span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-500">Distrito</span>
            <span class="text-xs font-medium text-gray-700">${props.borough || 'N/A'}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-500">Segmento</span>
            <span class="text-xs text-gray-700">${props.segment || 'N/A'}</span>
          </div>

           <div class="flex justify-between items-center pt-1 border-t border-gray-50">
            <span class="text-xs text-gray-500">Cargo Mensual</span>
            <span class="text-xs font-bold text-gray-900">${charge}</span>
          </div>
        </div>
      </div>
    `;

        new mapboxgl.Popup({ offset: 15, className: 'custom-popup', closeButton: true })
            .setLngLat(coordinates)
            .setHTML(htmlContent)
            .addTo(map);
    });

    map.on('mouseenter', 'churn-point', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'churn-point', () => {
        map.getCanvas().style.cursor = '';
    });

    // Borough hover interactions
    let hoveredStateId: string | number | null = null;

    map.on('mousemove', 'borough-fill', (e) => {
        if (e.features && e.features.length > 0) {
            if (hoveredStateId !== null) {
                map.setFeatureState(
                    { source: 'boroughs', id: hoveredStateId },
                    { hover: false }
                );
            }
            hoveredStateId = e.features[0].id ?? null;
            if (hoveredStateId !== null) {
                map.setFeatureState(
                    { source: 'boroughs', id: hoveredStateId },
                    { hover: true }
                );
            }
        }
    });

    map.on('mouseleave', 'borough-fill', () => {
        if (hoveredStateId !== null) {
            map.setFeatureState(
                { source: 'boroughs', id: hoveredStateId },
                { hover: false }
            );
        }
        hoveredStateId = null;
    });
};
