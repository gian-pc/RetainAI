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

    const customerFeatures = data.features.filter((f: any) =>
        customerIds.includes(f.properties.customerId)
    );

    if (customerFeatures.length === 0) return;

    // Calcular bounds
    const bounds = new mapboxgl.LngLatBounds();
    customerFeatures.forEach((feature: any) => {
        bounds.extend(feature.geometry.coordinates);
    });

    const maxZoom = customerFeatures.length === 1 ? 16 :
        customerFeatures.length <= 3 ? 13 : 11;

    map.fitBounds(bounds, {
        padding: { top: 150, bottom: 150, left: 150, right: 150 },
        maxZoom: maxZoom,
        duration: 1500
    });

    // Agregar efecto de ondas si es un solo cliente
    if (customerFeatures.length === 1) {
        const coords = customerFeatures[0].geometry.coordinates;
        addRippleEffect(map, coords);
    }
}

/**
 * Agrega efecto de ondas/ripple en una ubicación específica
 */
function addRippleEffect(map: mapboxgl.Map, coordinates: [number, number]) {
    // Crear elemento HTML para el efecto de ondas
    const rippleEl = document.createElement('div');
    rippleEl.className = 'ripple-marker';
    rippleEl.innerHTML = `
        <div class="ripple-circle"></div>
        <div class="ripple-circle ripple-delay-1"></div>
        <div class="ripple-circle ripple-delay-2"></div>
    `;

    // Agregar estilos inline para la animación
    const style = document.createElement('style');
    style.textContent = `
        .ripple-marker {
            width: 20px;
            height: 20px;
            position: relative;
        }
        .ripple-circle {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            border: 3px solid #ef4444;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: ripple-pulse 2s ease-out infinite;
            opacity: 0;
        }
        .ripple-delay-1 {
            animation-delay: 0.6s;
        }
        .ripple-delay-2 {
            animation-delay: 1.2s;
        }
        @keyframes ripple-pulse {
            0% {
                transform: translate(-50%, -50%) scale(0.5);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Crear marcador temporal
    const marker = new mapboxgl.Marker({
        element: rippleEl,
        anchor: 'center'
    })
        .setLngLat(coordinates)
        .addTo(map);

    // Eliminar el marcador después de 3 segundos
    setTimeout(() => {
        marker.remove();
        style.remove();
    }, 3000);
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
    const filter = ['in', ['get', 'customerId'], ['literal', customerIds]];

    if (map.getLayer('customers-points')) {
        map.setPaintProperty('customers-points', 'circle-radius', [
            'case', filter, 20, 6
        ]);

        map.setPaintProperty('customers-points', 'circle-stroke-width', [
            'case', filter, 6, 1
        ]);

        map.setPaintProperty('customers-points', 'circle-stroke-color', [
            'case', filter,
            highlightType === 'critical' ? '#dc2626' : highlightType === 'warning' ? '#f59e0b' : '#3b82f6',
            '#ffffff'
        ]);

        map.setPaintProperty('customers-points', 'circle-opacity', [
            'case', filter, 1.0, 0.3
        ]);

        map.setPaintProperty('customers-points', 'circle-color', [
            'case',
            filter,
            '#fbbf24',
            [
                'interpolate', ['linear'], ['get', 'mag'],
                0, '#22c55e', 0.5, '#f59e0b', 1, '#ef4444'
            ]
        ]);
    }

    if (map.getLayer('customers-heat')) {
        map.setPaintProperty('customers-heat', 'heatmap-opacity', 0.3);
    }
}

/**
 * Anima clientes con efecto de pulso
 */
function animateCustomers(map: mapboxgl.Map, customerIds: string[]) {
    // 1. Efecto de pulso en el mapa (existente)
    let pulseCount = 0;
    const maxPulses = 5;

    const pulse = () => {
        if (pulseCount >= maxPulses) {
            // Restaurar tamaño normal
            const filter = ['in', ['get', 'customerId'], ['literal', customerIds]];
            if (map.getLayer('customers-points')) {
                map.setPaintProperty('customers-points', 'circle-radius', [
                    'case', filter, 20, 6
                ]);
            }
            return;
        }

        const filter = ['in', ['get', 'customerId'], ['literal', customerIds]];

        if (map.getLayer('customers-points')) {
            // Aumentar tamaño
            map.setPaintProperty('customers-points', 'circle-radius', [
                'case', filter, 28, 6
            ]);

            // Color más brillante
            map.setPaintProperty('customers-points', 'circle-color', [
                'case', filter, '#fde047',
                ['interpolate', ['linear'], ['get', 'mag'], 0, '#22c55e', 0.5, '#f59e0b', 1, '#ef4444']
            ]);
        }

        setTimeout(() => {
            // Reducir tamaño
            if (map.getLayer('customers-points')) {
                map.setPaintProperty('customers-points', 'circle-radius', [
                    'case', filter, 20, 6
                ]);

                // Color normal
                map.setPaintProperty('customers-points', 'circle-color', [
                    'case', filter, '#fbbf24',
                    ['interpolate', ['linear'], ['get', 'mag'], 0, '#22c55e', 0.5, '#f59e0b', 1, '#ef4444']
                ]);
            }

            pulseCount++;
            if (pulseCount < maxPulses) {
                setTimeout(pulse, 400);
            }
        }, 400);
    };

    pulse();
}
