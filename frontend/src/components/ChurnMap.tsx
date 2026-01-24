"use client";

import React, { useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

// Hooks
import { useHeatmapData } from "@/hooks/useHeatmapData";
import { useMapbox } from "@/hooks/useMapbox";
import { useMapLayers } from "@/hooks/useMapLayers";
import { useMapData } from "@/hooks/useMapData";
import { useChatbotMapIntegration } from "@/hooks/useChatbotMapIntegration";

// Components
import { MapControls } from "./map/MapControls";
import { MapLegend } from "./map/MapLegend";

const ChurnMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'risk' | 'borough'>('risk');
  const [activeCity, setActiveCity] = useState<string | null>("New York");
  const [selectedCountry, setSelectedCountry] = useState<string>("USA");

  // Custom hooks
  const { heatmapData, loading } = useHeatmapData();
  const { map, mapReady } = useMapbox(mapContainer);

  // Setup layers and interactions
  useMapLayers(map, mapReady, viewMode);

  // Update map data when data or filters change
  useMapData(map, heatmapData, mapReady, activeCity);

  // Integrate chatbot events with map
  useChatbotMapIntegration(map, mapReady, setActiveCity);

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl relative">
      {/* Controles */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3 pointer-events-none">
        <MapControls
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          activeCity={activeCity}
          setActiveCity={setActiveCity}
        />

        <MapLegend viewMode={viewMode} />
      </div>

      <div ref={mapContainer} className="flex-grow w-full relative" />

      {loading && (
        <div className="absolute inset-0 bg-white/95 flex items-center justify-center z-20 backdrop-blur-sm">
          <div className="text-indigo-600 font-semibold text-sm animate-pulse">Cargando mapa...</div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ChurnMap);