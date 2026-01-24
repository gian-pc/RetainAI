import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface ChatbotMetadata {
    customerIds?: string[];
    highlightType?: 'critical' | 'warning' | 'info';
    animate?: boolean;
    filterByBorough?: string;
    zoomTo?: string;
}

/**
 * Hook para integrar el chatbot con el mapa
 * Escucha eventos del chatbot y actualiza el mapa automáticamente
 */
export const useChatbotMapIntegration = (
    map: React.RefObject<mapboxgl.Map | null>,
    mapReady: boolean,
    setActiveCity?: (city: string | null) => void
) => {
    useEffect(() => {
        if (!map.current || !mapReady) return;

        const handleChatbotUpdate = (event: CustomEvent<ChatbotMetadata>) => {
            const metadata = event.detail;
            console.log('📍 Mapa recibió evento del chatbot:', metadata);

            if (!metadata) return;

            const mapInstance = map.current;
            if (!mapInstance) return;

            // 1. Filtrar por borough si se especifica
            if (metadata.filterByBorough && setActiveCity) {
                console.log(`🗺️ Filtrando por borough: ${metadata.filterByBorough}`);
                // Aquí podrías implementar filtrado por borough
            }

            // 2. Hacer zoom a la ubicación especificada
            if (metadata.zoomTo) {
                if (metadata.zoomTo === 'auto' && metadata.customerIds && metadata.customerIds.length > 0) {
                    // Zoom automático a los clientes mencionados
                    console.log('🔍 Zoom automático a clientes:', metadata.customerIds);
                    zoomToCustomers(mapInstance, metadata.customerIds);
                } else if (metadata.zoomTo !== 'auto') {
                    // Zoom a un borough específico
                    console.log(`🔍 Zoom a: ${metadata.zoomTo}`);
                    zoomToBorough(mapInstance, metadata.zoomTo);
                }
            }

            // 3. Resaltar clientes mencionados
            if (metadata.customerIds && metadata.customerIds.length > 0) {
                console.log('✨ Resaltando clientes:', metadata.customerIds);
                highlightCustomers(mapInstance, metadata.customerIds, metadata.highlightType || 'critical');

                // 4. Animar si se especifica
                if (metadata.animate) {
                    console.log('🎬 Activando animación');
                    animateCustomers(mapInstance, metadata.customerIds);
                }
            }
        };

        // Escuchar eventos del chatbot
        window.addEventListener('chatbot-map-update', handleChatbotUpdate as EventListener);

        return () => {
            window.removeEventListener('chatbot-map-update', handleChatbotUpdate as EventListener);
        };
    }, [map, mapReady, setActiveCity]);
};

/**
 * Hace zoom a clientes específicos
 */
function zoomToCustomers(map: mapboxgl.Map, customerIds: string[]) {
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
        customerIds.includes(f.properties.customerId)
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
    // Si es 1 cliente: zoom 16 (muy cercano)
    // Si son 2-3 clientes: zoom 13 (medio)
    // Si son 4+ clientes: zoom 11 (amplio)
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
function zoomToBorough(map: mapboxgl.Map, borough: string) {
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
function highlightCustomers(map: mapboxgl.Map, customerIds: string[], highlightType: string) {
    // Crear un filtro para los clientes mencionados
    const filter = ['in', ['get', 'customerId'], ['literal', customerIds]];

    // Actualizar el estilo de la capa de puntos para resaltar
    if (map.getLayer('customers-points')) {
        // Tamaño mucho más grande para clientes resaltados
        map.setPaintProperty('customers-points', 'circle-radius', [
            'case',
            filter,
            20, // MUY grande para clientes resaltados
            6   // Más pequeño para otros
        ]);

        // Borde muy grueso y de color brillante
        map.setPaintProperty('customers-points', 'circle-stroke-width', [
            'case',
            filter,
            6, // Borde muy grueso para clientes resaltados
            1  // Borde delgado para otros
        ]);

        map.setPaintProperty('customers-points', 'circle-stroke-color', [
            'case',
            filter,
            highlightType === 'critical' ? '#dc2626' : highlightType === 'warning' ? '#f59e0b' : '#3b82f6',
            '#ffffff'
        ]);

        // Opacidad: resaltados 100%, otros 30%
        map.setPaintProperty('customers-points', 'circle-opacity', [
            'case',
            filter,
            1.0, // Totalmente opaco para resaltados
            0.3  // Semi-transparente para otros
        ]);

        // Color del círculo: amarillo brillante para resaltados
        map.setPaintProperty('customers-points', 'circle-color', [
            'case',
            filter,
            '#fbbf24', // Amarillo brillante para resaltados
            [
                'interpolate',
                ['linear'],
                ['get', 'mag'],
                0, '#22c55e',
                0.5, '#f59e0b',
                1, '#ef4444'
            ]
        ]);
    }

    // También actualizar la capa de heatmap para reducir su opacidad
    if (map.getLayer('customers-heat')) {
        map.setPaintProperty('customers-heat', 'heatmap-opacity', 0.3);
    }
}

/**
 * Anima clientes con efecto de pulso
 */
function animateCustomers(map: mapboxgl.Map, customerIds: string[]) {
    let pulseCount = 0;
    const maxPulses = 5; // Más pulsos para mayor visibilidad

    const pulse = () => {
        if (pulseCount >= maxPulses) {
            // Al terminar, restaurar el tamaño resaltado normal
            const filter = ['in', ['get', 'customerId'], ['literal', customerIds]];
            if (map.getLayer('customers-points')) {
                map.setPaintProperty('customers-points', 'circle-radius', [
                    'case',
                    filter,
                    20,
                    6
                ]);
            }
            return;
        }

        const filter = ['in', ['get', 'customerId'], ['literal', customerIds]];

        // Aumentar tamaño dramáticamente
        if (map.getLayer('customers-points')) {
            map.setPaintProperty('customers-points', 'circle-radius', [
                'case',
                filter,
                28, // MUY grande durante la animación
                6
            ]);

            // Cambiar a color más brillante durante el pulso
            map.setPaintProperty('customers-points', 'circle-color', [
                'case',
                filter,
                '#fde047', // Amarillo muy brillante
                [
                    'interpolate',
                    ['linear'],
                    ['get', 'mag'],
                    0, '#22c55e',
                    0.5, '#f59e0b',
                    1, '#ef4444'
                ]
            ]);
        }

        setTimeout(() => {
            // Reducir tamaño
            if (map.getLayer('customers-points')) {
                map.setPaintProperty('customers-points', 'circle-radius', [
                    'case',
                    filter,
                    20,
                    6
                ]);

                // Volver al color amarillo normal
                map.setPaintProperty('customers-points', 'circle-color', [
                    'case',
                    filter,
                    '#fbbf24',
                    [
                        'interpolate',
                        ['linear'],
                        ['get', 'mag'],
                        0, '#22c55e',
                        0.5, '#f59e0b',
                        1, '#ef4444'
                    ]
                ]);
            }

            pulseCount++;
            if (pulseCount < maxPulses) {
                setTimeout(pulse, 400); // Pausa entre pulsos
            }
        }, 400); // Duración del pulso
    };

    pulse();
}
