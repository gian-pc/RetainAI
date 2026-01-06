"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FeatureCollection } from "geojson";

// 🌍 CONFIGURACIÓN DE CIUDADES
const LOCATIONS: Record<string, { lat: number; lng: number; zoom: number; country: string }> = {
  "New York": { lat: 40.730610, lng: -73.935242, zoom: 11, country: "USA" },
  "London": { lat: 51.5074, lng: -0.1278, zoom: 11, country: "UK" },
  "Berlin": { lat: 52.5200, lng: 13.4050, zoom: 11, country: "Germany" },
  "Toronto": { lat: 43.6532, lng: -79.3832, zoom: 11, country: "Canada" },
};

const COUNTRIES = Array.from(new Set(Object.values(LOCATIONS).map((l) => l.country))).sort();

interface GeoCustomer {
  id: string;
  lat: number;
  lng: number;
  churnRisk: "High" | "Medium" | "Low";
  monthlyFee: number;
}

const ChurnMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [customers, setCustomers] = useState<GeoCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCity, setActiveCity] = useState<string | null>("New York");
  const [selectedCountry, setSelectedCountry] = useState<string>("USA");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/geo/customers`);
        if (!res.ok) throw new Error("Error fetching geo data");
        const data = await res.json();
        setCustomers(data);
      } catch (error) {
        console.error("Error mapa:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-73.935242, 40.730610],
      zoom: 11,
      pitch: 40,
      projection: { name: 'mercator' }
    });

    map.current.on("load", () => {
      map.current?.addSource("customers", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // --- CAPA 1: HEATMAP (Solo brilla debajo de los ROJOS) ---
      // Esto crea el efecto "zona infectada" sin ocultar los puntos
      map.current?.addLayer({
        id: "churn-heat",
        type: "heatmap",
        source: "customers",
        maxzoom: 15,
        paint: {
          // Solo los High Risk (mag=1) generan brillo
          "heatmap-weight": [
            "interpolate", ["linear"], ["get", "mag"],
            0, 0,    // Verde no brilla
            0.5, 0,  // Amarillo no brilla
            1, 1     // Rojo SÍ brilla mucho
          ],
          "heatmap-intensity": 1.2,
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0, "rgba(0,0,0,0)",
            0.2, "rgba(251, 113, 133, 0.3)", // Resplandor rosado suave
            1, "rgba(220, 38, 38, 0.8)"      // Núcleo rojo intenso
          ],
          "heatmap-radius": [
            "interpolate", ["linear"], ["zoom"],
            0, 2,
            13, 30 // Manchas grandes y difusas
          ],
          "heatmap-opacity": 0.6 // Transparente para ver los puntos encima
        },
      });

      // --- CAPA 2: PUNTOS (Siempre visibles) ---
      map.current?.addLayer({
        id: "churn-point",
        type: "circle",
        source: "customers",
        minzoom: 5, // ✅ AHORA VISIBLE DESDE LEJOS
        paint: {
          // Tamaño dinámico: Pequeños de lejos, grandes de cerca
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            10, 2,  // Puntos finos al ver toda la ciudad
            13, 5,
            16, 10
          ],
          // Colores NEÓN Sólidos
          "circle-color": [
            "match",
            ["get", "risk"],
            "High", "#ff2a2a",    // Rojo Láser
            "Medium", "#fbbf24",  // Oro
            "Low", "#00ff9d",     // Verde Matrix (Muy visible sobre oscuro)
            "#ccc"
          ],
          "circle-stroke-color": "#0f172a", // Borde negro para separar puntos
          "circle-stroke-width": 1,
          "circle-opacity": 0.9 // Casi sólidos
        },
      });
      
      updateMapData();
    });
  }, []);

  const updateMapData = () => {
      if (!map.current || customers.length === 0) return;

      let filtered = customers;
      if (activeCity) {
        const config = LOCATIONS[activeCity];
        filtered = customers.filter(c => 
          Math.abs(c.lat - config.lat) < 0.5 && 
          Math.abs(c.lng - config.lng) < 0.5
        );
      }

      const geoJson: FeatureCollection = {
        type: "FeatureCollection",
        features: filtered.map((c) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [c.lng, c.lat] },
          properties: { 
            risk: c.churnRisk,
            mag: c.churnRisk === 'High' ? 1 : 0 // Solo High genera calor
          },
        })),
      };

      (map.current.getSource("customers") as mapboxgl.GeoJSONSource)?.setData(geoJson);
  };

  useEffect(() => {
    if (!map.current) return;
    updateMapData();
    if (activeCity) {
        const config = LOCATIONS[activeCity];
        map.current.flyTo({
            center: [config.lng, config.lat],
            zoom: config.zoom,
            speed: 1.5
        });
    }
  }, [activeCity, customers]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setSelectedCountry(country);
    const firstCity = Object.keys(LOCATIONS).find(c => LOCATIONS[c].country === country);
    if (firstCity) setActiveCity(firstCity);
  };

  return (
    <div className="flex flex-col h-[600px] w-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl relative group">
      
      {/* Controles */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur border border-slate-600 p-3 rounded-lg shadow-lg flex flex-col gap-3 w-48 pointer-events-auto">
             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700 pb-2">📍 Filtros</h4>
             <div className="flex gap-2">
                <select 
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    className="w-1/2 bg-slate-800 text-white border border-slate-600 rounded px-2 py-1.5 text-xs outline-none focus:border-green-500"
                >
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                    value={activeCity || ""}
                    onChange={(e) => setActiveCity(e.target.value)}
                    className="w-1/2 bg-slate-800 text-white border border-slate-600 rounded px-2 py-1.5 text-xs outline-none focus:border-green-500"
                >
                    {Object.keys(LOCATIONS)
                    .filter(city => !selectedCountry || LOCATIONS[city].country === selectedCountry)
                    .map(city => <option key={city} value={city}>{city}</option>)}
                </select>
             </div>
        </div>

        {/* Leyenda Simple */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-600 p-3 rounded-lg shadow-lg w-48 pointer-events-auto">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Estado de Clientes</h4>
            <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#ff2a2a] shadow-[0_0_8px_#ff2a2a]"></div>
                    <span className="text-[10px] text-slate-300">Riesgo Crítico (Bronx)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#fbbf24]"></div>
                    <span className="text-[10px] text-slate-300">Riesgo Medio (Competencia)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00ff9d]"></div>
                    <span className="text-[10px] text-slate-300">Seguro (VIP)</span>
                </div>
            </div>
        </div>
      </div>

      <div ref={mapContainer} className="flex-grow w-full relative" />
      
      {loading && (
        <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center z-20">
            <div className="text-green-400 font-mono text-xs animate-pulse">CARGANDO MAPA...</div>
        </div>
      )}
    </div>
  );
};

export default ChurnMap;