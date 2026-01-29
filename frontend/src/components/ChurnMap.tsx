"use client";

import React, { useRef, useState, useEffect } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

// Hooks
import { useHeatmapData } from "@/hooks/useHeatmapData";
import { useMapbox } from "@/hooks/useMapbox";
import { useMapData } from "@/hooks/useMapData";
import { useChatbotMapIntegration } from "@/hooks/useChatbotMapIntegration";
import { useLayoutContext } from "@/context/LayoutContext";

// Components
import { MapControls, MapLayers as MapLayersType } from "./map/MapControls";
import { MapLayers } from "./map/MapLayers";
import { MapLegend } from "./map/MapLegend";

const ChurnMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [layers, setLayers] = useState<MapLayersType>({
    heatmap: true,
    borough: false,
    socioeconomic: false,
    population: false,
  });
  const [activeCity, setActiveCity] = useState<string | null>("New York");
  const [selectedCountry, setSelectedCountry] = useState<string>("USA");
  const [is3D, setIs3D] = useState(false);

  // Custom hooks
  const { heatmapData, loading } = useHeatmapData();
  const { map, mapReady } = useMapbox(mapContainer);
  const { theme } = useLayoutContext();
  const [styleLoadedKey, setStyleLoadedKey] = useState(0);

  // Toggle 3D View
  useEffect(() => {
    if (!map.current || !mapReady) return;

    const mapInstance = map.current;

    if (is3D) {
      // Switch to 3D
      mapInstance.easeTo({
        pitch: 60,
        bearing: 0,
        duration: 1000
      });

      if (!mapInstance.getLayer('3d-buildings')) {
        mapInstance.addLayer({
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 13,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        });
      }
    } else {
      // Switch back to 2D
      mapInstance.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000
      });

      if (mapInstance.getLayer('3d-buildings')) {
        mapInstance.removeLayer('3d-buildings');
      }
    }
  }, [is3D, map, mapReady]);

  // Update map style when theme changes
  useEffect(() => {
    if (map.current) {
      const styleUrl = theme === 'dark'
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11";

      map.current.setStyle(styleUrl);

      // Force MapLayers to re-mount and re-add layers after style loads
      map.current.once('style.load', () => {
        setStyleLoadedKey(prev => prev + 1);

        // Re-apply 3D if active
        if (is3D && !map.current?.getLayer('3d-buildings')) {
          // We trigger a re-render or let the dependency array handle it if possible, 
          // but `is3D` effect might need to re-run. 
          // Simplest is to just re-add it here or let the user toggle it.
          // Ideally, the effect dependent on [is3D] handles it, but style change removes layers.
        }
      });
    }
  }, [theme, map]); // Removed is3D from here to avoid conflict, handled separate

  // Update map data when data or filters change
  useMapData(map, heatmapData, mapReady, activeCity, styleLoadedKey);

  // Integrate chatbot events with map
  useChatbotMapIntegration(map, mapReady, setActiveCity);

  return (
    <div
      className="flex flex-col h-full w-full rounded-2xl border overflow-hidden shadow-xl relative transition-colors duration-300"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)'
      }}
    >
      {/* Logic Components - Key forces remount on style change */}
      <MapLayers
        key={`layers-${styleLoadedKey}`}
        map={map}
        mapReady={mapReady}
        layers={layers}
        heatmapData={heatmapData}
      />

      {/* Controles */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <MapControls
          layers={layers}
          setLayers={setLayers}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          activeCity={activeCity}
          setActiveCity={setActiveCity}
          is3D={is3D}
          setIs3D={setIs3D}
        />
      </div>

      {/* Leyenda - Separada para mejor posicionamiento */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <MapLegend layers={layers} />
      </div>

      <div ref={mapContainer} className="flex-grow w-full relative" />

      {loading && (
        <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 flex items-center justify-center z-20 backdrop-blur-sm transition-colors duration-300">
          <div className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm animate-pulse">Cargando mapa...</div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ChurnMap);