import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import {
    zoomToCustomers,
    zoomToBorough,
    highlightCustomers,
    animateCustomers
} from '@/logic/chatbotMapActions';

export interface ChatbotMetadata {
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
                // Aquí podrías implementar filtrado por borough si hubiera una función específica
                // Por ahora solo logueamos
            }

            // 2. Hacer zoom a la ubicación especificada
            if (metadata.zoomTo) {
                if (metadata.zoomTo === 'auto' && metadata.customerIds && metadata.customerIds.length > 0) {
                    zoomToCustomers(mapInstance, metadata.customerIds);
                } else if (metadata.zoomTo !== 'auto') {
                    zoomToBorough(mapInstance, metadata.zoomTo);
                }
            }

            // 3. Resaltar y animar clientes
            if (metadata.customerIds && metadata.customerIds.length > 0) {
                highlightCustomers(mapInstance, metadata.customerIds, metadata.highlightType || 'critical');

                if (metadata.animate) {
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
