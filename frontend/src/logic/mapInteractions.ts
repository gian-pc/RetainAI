import mapboxgl from 'mapbox-gl';

export const setupInteractions = (map: mapboxgl.Map) => {
    // Click on clusters to zoom in
    map.on('click', 'clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });

        if (!features || !features.length) return;

        const clusterId = features[0].properties?.cluster_id;
        const source = map.getSource('customers-clustered') as mapboxgl.GeoJSONSource; // 🔧 Source correcto

        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || zoom === null || zoom === undefined) return;

            map.easeTo({
                center: (features[0].geometry as any).coordinates,
                zoom: zoom + 1
            });
        });
    });

    // Cursor changes for clusters
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
      <div class="min-w-[260px] font-sans bg-white text-left rounded-xl overflow-hidden shadow-sm">
        <div class="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-start gap-4 pr-10">
            <div class="overflow-hidden">
                <h3 class="font-bold text-gray-900 text-sm leading-snug truncate" title="${props.nombre}">${props.nombre}</h3>
                <div class="text-[10px] text-gray-400 font-mono mt-0.5">ID: ${props.customerId}</div>
            </div>
            
            <span class="text-[10px] font-bold ${riskColor} bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm whitespace-nowrap flex-shrink-0">
                ${riskLabel}
            </span>
        </div>
        
        <div class="p-4 space-y-4">
           <div>
               <div class="flex justify-between items-end mb-1.5">
                   <span class="text-[11px] text-gray-500 font-medium">Probabilidad de Fuga</span>
                   <span class="text-xs font-bold ${riskColor}">${prob}%</span>
               </div>
               <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div class="h-full rounded-full ${props.risk === 'High' ? 'bg-red-500' : props.risk === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}" style="width: ${prob}%"></div>
               </div>
           </div>

            <div class="grid grid-cols-2 gap-4 pt-3 border-t border-gray-50">
                <div>
                    <span class="block text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Distrito</span>
                    <span class="text-xs font-medium text-gray-700 block mt-1 truncate" title="${props.borough}">${props.borough || 'N/A'}</span>
                </div>
                <div>
                     <span class="block text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Cargo Mensual</span>
                     <span class="text-xs font-bold text-gray-900 block mt-1">${charge}</span>
                </div>
            </div>
        </div>
      </div>
    `;

        new mapboxgl.Popup({ offset: 15, className: 'custom-popup', closeButton: true })
            .setLngLat(coordinates as [number, number])
            .setHTML(htmlContent)
            .addTo(map);
    });

    // Cursor changes for points
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
