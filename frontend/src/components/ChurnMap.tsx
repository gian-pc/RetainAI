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

// 📦 Estructura del endpoint /api/dashboard/heatmap
interface HeatmapPoint {
  customerId: string;
  latitude: number;
  longitude: number;
  churnProbability: number;
  riskLevel: "High" | "Medium" | "Low";
  segmento: string;
  tipoContrato: string;
  cargoMensual: number;
  antiguedad: number;
  ciudad: string;
  borough: string | null;
}

const ChurnMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [activeCity, setActiveCity] = useState<string | null>("New York");
  const [selectedCountry, setSelectedCountry] = useState<string>("USA");
  const dataLoadedRef = useRef(false); // ✅ Previene loops

  useEffect(() => {
    // ✅ Solo cargar datos UNA VEZ
    if (dataLoadedRef.current) return;

    let isMounted = true;
    const CACHE_KEY = 'churnmap_data';
    const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

    const fetchData = async () => {
      try {
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        const cachedTime = sessionStorage.getItem(`${CACHE_KEY}_time`);

        if (cachedData && cachedTime) {
          const age = Date.now() - parseInt(cachedTime);
          if (age < CACHE_DURATION) {
            const parsedData = JSON.parse(cachedData);
            if (isMounted) {
              setHeatmapData(parsedData);
              setLoading(false);
              dataLoadedRef.current = true;
            }
            return;
          }
        }

        // ⚡ Timeout de 10 segundos para evitar esperas infinitas
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/dashboard/heatmap`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);

        if (!res.ok) throw new Error("Error fetching heatmap data");
        const data: HeatmapPoint[] = await res.json();

        // ✅ Guardar TODOS los datos (sin filtrar)
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
        sessionStorage.setItem(`${CACHE_KEY}_time`, Date.now().toString());

        if (isMounted) {
          setHeatmapData(data);
          dataLoadedRef.current = true;
        }
      } catch (error: any) {
        console.error("Error cargando datos del mapa:", error);
        // ✅ No bloquear la UI, dejar que el componente se renderice vacío
        if (isMounted) {
          dataLoadedRef.current = true; // Marcar como cargado para evitar reintentos
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []); // ✅ Solo ejecutar una vez

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!token) {
      console.error("Error: MAPBOX_TOKEN no encontrado en variables de entorno");
      setLoading(false);
      return;
    }

    mapboxgl.accessToken = token;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-73.935242, 40.730610],
        zoom: 11,
        pitch: 40,
        projection: { name: 'mercator' }
      });

      map.current.on("error", (e) => {
        console.error("Error de Mapbox:", e);
      });
    } catch (error) {
      console.error("Error al crear el mapa:", error);
      setLoading(false);
      return;
    }

    map.current.on("load", () => {

      map.current?.addSource("customers", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // --- CAPA 1: HEATMAP (Zonas de riesgo alto) ---
      // Visualiza concentración de clientes de alto riesgo
      map.current?.addLayer({
        id: "churn-heat",
        type: "heatmap",
        source: "customers",
        maxzoom: 15,
        paint: {
          // Solo los High Risk (mag=1) generan calor
          "heatmap-weight": [
            "interpolate", ["linear"], ["get", "mag"],
            0, 0,    // Bajo riesgo no genera calor
            0.5, 0.3,  // Riesgo medio genera poco
            1, 1     // Alto riesgo genera mucho calor
          ],
          "heatmap-intensity": 1.0,
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0, "rgba(0,0,0,0)",
            0.2, "rgba(252, 165, 165, 0.4)", // Rosa suave
            0.5, "rgba(239, 68, 68, 0.5)",   // Rojo medio
            1, "rgba(220, 38, 38, 0.7)"      // Rojo intenso
          ],
          "heatmap-radius": [
            "interpolate", ["linear"], ["zoom"],
            0, 2,
            13, 25
          ],
          "heatmap-opacity": 0.5
        },
      });

      // --- CAPA 2: PUNTOS (Siempre visibles) ---
      map.current?.addLayer({
        id: "churn-point",
        type: "circle",
        source: "customers",
        minzoom: 5,
        paint: {
          // Tamaño dinámico: Pequeños de lejos, grandes de cerca
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            10, 3,  // Puntos visibles al ver toda la ciudad
            13, 6,
            16, 12
          ],
          // Colores profesionales que coinciden con la UI
          "circle-color": [
            "match",
            ["get", "risk"],
            "High", "#dc2626",      // red-600
            "Medium", "#f59e0b",    // amber-500
            "Low", "#10b981",       // emerald-500
            "#94a3b8"               // slate-400
          ],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
          "circle-opacity": 0.85
        },
      });

      // 🚀 Marcar el mapa como listo
      setMapReady(true);
      // ✅ updateMapData se llamará automáticamente vía useEffect cuando mapReady cambie
    });
  }, []);

  const updateMapData = () => {
    if (!map.current || heatmapData.length === 0) {
      return;
    }

    let filtered = heatmapData;
    if (activeCity) {
      const config = LOCATIONS[activeCity];
      filtered = heatmapData.filter(point =>
        Math.abs(point.latitude - config.lat) < 0.5 &&
        Math.abs(point.longitude - config.lng) < 0.5
      );
    }

    const geoJson: FeatureCollection = {
      type: "FeatureCollection",
      features: filtered.map((point) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [point.longitude, point.latitude] },
        properties: {
          risk: point.riskLevel,
          mag: point.riskLevel === 'High' ? 1 : point.riskLevel === 'Medium' ? 0.5 : 0,
          probability: point.churnProbability,
          segment: point.segmento,
          monthlyCharge: point.cargoMensual
        },
      })),
    };

    const source = map.current.getSource("customers") as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(geoJson);
    }
  };

  useEffect(() => {
    if (!mapReady || !map.current) {
      return;
    }

    updateMapData();
  }, [heatmapData, mapReady]);

  // useEffect separado solo para cambios de ciudad
  useEffect(() => {
    if (!mapReady || !map.current || !activeCity) return;

    const config = LOCATIONS[activeCity];
    map.current.flyTo({
      center: [config.lng, config.lat],
      zoom: config.zoom,
      speed: 1.5
    });
  }, [activeCity, mapReady]);

  // 🎯 Escuchar eventos del chatbot para filtrar por ubicaciones (boroughs/ciudades)
  useEffect(() => {
    console.log('🗺️ [MAP DEBUG] ChurnMap: Registrando listener para eventos filterMapByLocations');

    const handleLocationFilter = (event: CustomEvent<{ locations: string[] }>) => {
      const locations = event.detail.locations;
      console.log('🗺️ [MAP DEBUG] ChurnMap: Evento recibido:', locations);

      // Filtrar solo clientes de esos boroughs/ciudades
      if (locations.length > 0) {
        const filtered = heatmapData.filter(point => {
          // Verificar si el cliente está en alguna de las ubicaciones mencionadas
          const matchesBorough = point.borough && locations.some(loc =>
            point.borough?.toLowerCase().includes(loc.toLowerCase())
          );
          const matchesCity = locations.some(loc =>
            point.ciudad?.toLowerCase().includes(loc.toLowerCase())
          );
          return matchesBorough || matchesCity;
        });

        console.log(`✅ Encontrados ${filtered.length} clientes en las ubicaciones especificadas`);

        if (filtered.length > 0) {
          // Calcular el centro y hacer zoom automático a esa zona
          const avgLat = filtered.reduce((sum, p) => sum + p.latitude, 0) / filtered.length;
          const avgLng = filtered.reduce((sum, p) => sum + p.longitude, 0) / filtered.length;

          if (map.current) {
            map.current.flyTo({
              center: [avgLng, avgLat],
              zoom: 13,
              speed: 1.5
            });
          }

          // Actualizar el mapa para mostrar solo esos clientes
          setHeatmapData(filtered);
        }
      }
    };

    window.addEventListener('filterMapByLocations' as any, handleLocationFilter as any);

    return () => {
      window.removeEventListener('filterMapByLocations' as any, handleLocationFilter as any);
    };
  }, [heatmapData]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setSelectedCountry(country);
    const firstCity = Object.keys(LOCATIONS).find(c => LOCATIONS[c].country === country);
    if (firstCity) setActiveCity(firstCity);
  };

  return (
    <div className="flex flex-col h-[600px] w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl relative">

      {/* Controles */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3 pointer-events-none">
        <div className="bg-white/95 backdrop-blur border border-slate-200 p-4 rounded-xl shadow-lg flex flex-col gap-3 w-56 pointer-events-auto">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-2">📍 Ubicación</h4>
          <div className="flex gap-2">
            <select
              value={selectedCountry}
              onChange={handleCountryChange}
              className="w-1/2 bg-slate-50 text-slate-700 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            >
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={activeCity || ""}
              onChange={(e) => setActiveCity(e.target.value)}
              className="w-1/2 bg-slate-50 text-slate-700 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            >
              {Object.keys(LOCATIONS)
                .filter(city => !selectedCountry || LOCATIONS[city].country === selectedCountry)
                .map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>

          {/* Botón Restaurar Vista */}
          <button
            onClick={() => {
              // Recargar TODOS los datos sin filtrar
              sessionStorage.removeItem('churnmap_data');
              sessionStorage.removeItem('churnmap_data_time');
              window.location.reload();
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Restaurar Vista
          </button>
        </div>

        {/* Leyenda con Thresholds */}
        <div className="bg-white/95 backdrop-blur border border-slate-200 p-4 rounded-xl shadow-lg w-64 pointer-events-auto">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">🎯 Nivel de Riesgo</h4>
          <div className="grid grid-cols-1 gap-2.5">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-red-600 shadow-sm mt-0.5"></div>
              <div className="flex-1">
                <span className="text-sm text-slate-900 font-bold block">Alto (70-99%)</span>
                <span className="text-xs text-slate-600">CRÍTICO - Va a irse</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm mt-0.5"></div>
              <div className="flex-1">
                <span className="text-sm text-slate-900 font-bold block">Medio (30-70%)</span>
                <span className="text-xs text-slate-600">Requiere atención</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm mt-0.5"></div>
              <div className="flex-1">
                <span className="text-sm text-slate-900 font-bold block">Bajo (0-30%)</span>
                <span className="text-xs text-slate-600">Cliente estable</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-700">100% =</strong> Ya abandonó (churn histórico)
            </p>
          </div>
        </div>
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

// 🚀 React.memo previene re-renders innecesarios cuando cambian otros estados del dashboard
export default React.memo(ChurnMap);