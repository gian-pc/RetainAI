import mapboxgl from 'mapbox-gl';

/**
 * Hace zoom a clientes específicos
 */
export function zoomToCustomers(map: mapboxgl.Map, customerIds: string[]) {
    console.log('🔍 zoomToCustomers llamado con IDs:', customerIds);

    const source = map.getSource('customers-points') as mapboxgl.GeoJSONSource;
    if (!source) {
        console.warn('⚠️ Source customers-points no encontrado');
        return;
    }

    // Obtener las coordenadas de los clientes
    const data = (source as any)._data;
    if (!data || !data.features) {
        console.warn('⚠️ No hay features en el source');
        return;
    }

    console.log('📊 Total features en mapa:', data.features.length);

    const customerFeatures = data.features.filter((f: any) =>
        customerIds.some(id =>
            String(id).trim().toLowerCase() === String(f.properties.customerId).trim().toLowerCase()
        )
    );

    console.log('✅ Features encontrados:', customerFeatures.length, customerFeatures.map((f: any) => f.properties.customerId));

    if (customerFeatures.length === 0) {
        console.warn('⚠️ No se encontraron features para los customerIds proporcionados');
        return;
    }

    // Calcular bounds
    const bounds = new mapboxgl.LngLatBounds();
    customerFeatures.forEach((feature: any) => {
        bounds.extend(feature.geometry.coordinates);
    });

    // Ajustar maxZoom según número de clientes
    const maxZoom = customerFeatures.length === 1 ? 16 :
        customerFeatures.length <= 3 ? 13 : 11;

    console.log(`🎯 Haciendo zoom a ${customerFeatures.length} cliente(s) con maxZoom: ${maxZoom}`);

    // Hacer zoom con padding y zoom alto para desclusterizar
    map.fitBounds(bounds, {
        padding: { top: 150, bottom: 150, left: 150, right: 150 },
        maxZoom: maxZoom,
        duration: 1500
    });
}

/**
 * Hace zoom a un borough específico
 */
export function zoomToBorough(map: mapboxgl.Map, borough: string) {
    const boroughCoordinates: Record<string, { center: [number, number]; zoom: number }> = {
        'Manhattan': { center: [-73.9712, 40.7831], zoom: 12 },
        'Brooklyn': { center: [-73.9442, 40.6782], zoom: 12 },
        'Queens': { center: [-73.7949, 40.7282], zoom: 11 },
        'Bronx': { center: [-73.8648, 40.8448], zoom: 12 },
        'Staten Island': { center: [-74.1502, 40.5795], zoom: 11 }
    };

    const config = boroughCoordinates[borough];
    if (config) {
        map.flyTo({
            center: config.center,
            zoom: config.zoom,
            duration: 2000
        });
    }
}

/**
 * Resalta clientes en el mapa
 */
export function highlightCustomers(map: mapboxgl.Map, customerIds: string[], highlightType: string) {
    // Crear un filtro para los clientes mencionados
    const filter = ['in', ['get', 'customerId'], ['literal', customerIds]];

    // Actualizar el estilo de la capa de puntos para resaltar
    if (map.getLayer('churn-point')) {
        map.setPaintProperty('churn-point', 'circle-radius', [
            'case', filter, 20, 6
        ]);

        map.setPaintProperty('churn-point', 'circle-stroke-width', [
            'case', filter, 6, 1
        ]);

        map.setPaintProperty('churn-point', 'circle-stroke-color', [
            'case', filter,
            highlightType === 'critical' ? '#dc2626' : highlightType === 'warning' ? '#f59e0b' : '#3b82f6',
            '#ffffff'
        ]);

        map.setPaintProperty('churn-point', 'circle-opacity', [
            'case', filter, 1.0, 0.3
        ]);

        map.setPaintProperty('churn-point', 'circle-color', [
            'case', filter,
            '#fbbf24',
            [
                'interpolate', ['linear'], ['get', 'mag'],
                0, '#22c55e', 0.5, '#f59e0b', 1, '#ef4444'
            ]
        ]);
    }

    // Reducir opacidad del heatmap para enfocar atención en puntos
    if (map.getLayer('customers-heat')) {
        map.setPaintProperty('customers-heat', 'heatmap-opacity', 0.3);
    }
}

/**
 * Anima clientes con efecto moderno de ondas concéntricas y glow
 */
export function animateCustomers(map: mapboxgl.Map, customerIds: string[]) {
    if (!map.getLayer('churn-point')) return;

    // 1. Crear capas de animación modernas si no existen
    if (!map.getSource('pulse-glow-source')) {
        map.addSource('pulse-glow-source', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] }
        });

        map.addLayer({
            id: 'pulse-glow-layer',
            type: 'circle',
            source: 'pulse-glow-source',
            paint: {
                'circle-radius': 35,
                'circle-color': '#8b5cf6',
                'circle-opacity': ['get', 'opacity'],
                'circle-blur': 1.5
            }
        }, 'churn-point');

        map.addSource('pulse-wave-source', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] }
        });

        map.addLayer({
            id: 'pulse-wave-layer',
            type: 'circle',
            source: 'pulse-wave-source',
            paint: {
                'circle-radius': ['get', 'radius'],
                'circle-color': '#6366f1',
                'circle-opacity': 0,
                'circle-stroke-width': 3,
                'circle-stroke-color': '#8b5cf6',
                'circle-stroke-opacity': ['get', 'opacity']
            }
        }, 'pulse-glow-layer');
    }

    // 2. Obtener coordenadas de los clientes a animar
    const source = map.getSource('customers-points') as any;
    const data = source._data;
    if (!data || !data.features) return;

    const customerFeatures = data.features.filter((f: any) =>
        customerIds.includes(f.properties.customerId)
    );

    if (customerFeatures.length === 0) return;

    // 3. Iniciar animaciones
    const glowInterval = startGlowAnimation(map, customerFeatures);
    startWaveAnimation(map, customerFeatures);
    startPulseAnimation(map, customerIds);

    // Limpiar glow despues de un tiempo (para evitar intervalo infinito si no se maneja externamente)
    // Nota: La implementación original limpiaba el glow después de 3 ciclos.
}

function startGlowAnimation(map: mapboxgl.Map, customerFeatures: any[]) {
    let glowPhase = 0;
    const glowInterval = setInterval(() => {
        const glowSource = map.getSource('pulse-glow-source') as mapboxgl.GeoJSONSource;
        if (!glowSource) {
            clearInterval(glowInterval);
            return;
        }

        const opacity = 0.3 + 0.2 * Math.sin(glowPhase);
        const glowFeatures = customerFeatures.map((f: any) => ({
            type: 'Feature' as const,
            geometry: f.geometry,
            properties: { opacity }
        }));

        glowSource.setData({
            type: 'FeatureCollection',
            features: glowFeatures
        });

        glowPhase += 0.15;

        if (glowPhase > Math.PI * 6) { // 3 ciclos completos
            clearInterval(glowInterval);
            glowSource.setData({ type: 'FeatureCollection', features: [] });
        }
    }, 50);
    return glowInterval;
}

function startWaveAnimation(map: mapboxgl.Map, customerFeatures: any[]) {
    let start: number | null = null;
    const duration = 1500; // 1.5 segundos por onda

    const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = (timestamp - start) % duration;
        const ratio = progress / duration;

        // Easing suave (ease-out)
        const eased = 1 - Math.pow(1 - ratio, 3);
        const radius = 15 + eased * 60;  // De 15 a 75
        const opacity = Math.max(0, 0.8 * (1 - eased));

        const waveFeatures = customerFeatures.map((f: any) => ({
            type: 'Feature' as const,
            geometry: f.geometry,
            properties: { radius, opacity }
        }));

        const waveSource = map.getSource('pulse-wave-source') as mapboxgl.GeoJSONSource;
        if (waveSource) {
            waveSource.setData({
                type: 'FeatureCollection',
                features: waveFeatures
            });
        }

        if (timestamp - start < duration * 4) { // 4 ondas
            requestAnimationFrame(animate);
        } else {
            if (waveSource) {
                waveSource.setData({ type: 'FeatureCollection', features: [] });
            }
        }
    };

    requestAnimationFrame(animate);
}

function startPulseAnimation(map: mapboxgl.Map, customerIds: string[]) {
    const filter = ['in', ['get', 'customerId'], ['literal', customerIds]];
    let pulseStep = 0;
    const maxSteps = 12;

    const smoothPulse = () => {
        if (!map.getLayer('churn-point')) return;

        const phase = (pulseStep / maxSteps) * Math.PI * 2;
        const scale = 1.3 + 0.4 * Math.sin(phase);
        const baseRadius = 10;

        map.setPaintProperty('churn-point', 'circle-radius', [
            'case', filter, baseRadius * scale, 6
        ]);

        // Color destacado durante la animación
        map.setPaintProperty('churn-point', 'circle-color', [
            'case', filter, '#8b5cf6', [
                'interpolate', ['linear'], ['get', 'mag'],
                0, '#22c55e', 0.5, '#f59e0b', 1, '#ef4444'
            ]
        ]);

        pulseStep++;
        if (pulseStep < maxSteps) {
            setTimeout(smoothPulse, 300);
        }
    };

    smoothPulse();
}
