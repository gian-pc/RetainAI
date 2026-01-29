import React, { useState } from 'react';
import { Layers, MapPin, Flame, Building2, Banknote, Users, Box } from 'lucide-react';

const LOCATIONS: Record<string, { lat: number; lng: number; zoom: number; country: string }> = {
    "New York": { lat: 40.7128, lng: -74.0060, zoom: 10, country: "USA" },
    "London": { lat: 51.5074, lng: -0.1278, zoom: 11, country: "UK" },
    "Berlin": { lat: 52.5200, lng: 13.4050, zoom: 11, country: "Germany" },
    "Toronto": { lat: 43.6532, lng: -79.3832, zoom: 11, country: "Canada" },
};

const COUNTRIES = Array.from(new Set(Object.values(LOCATIONS).map((l) => l.country))).sort();

export interface MapLayers {
    heatmap: boolean;
    borough: boolean;
    socioeconomic: boolean;
    population: boolean;
}

interface MapControlsProps {
    layers: MapLayers;
    setLayers: (layers: MapLayers) => void;
    selectedCountry: string;
    setSelectedCountry: (country: string) => void;
    activeCity: string | null;
    setActiveCity: (city: string) => void;
    is3D: boolean;
    setIs3D: (is3D: boolean) => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
    layers,
    setLayers,
    selectedCountry,
    setSelectedCountry,
    activeCity,
    setActiveCity,
    is3D,
    setIs3D,
}) => {
    const [activePanel, setActivePanel] = useState<'layers' | 'location' | null>(null);

    const togglePanel = (panel: 'layers' | 'location') => {
        setActivePanel(activePanel === panel ? null : panel);
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const country = e.target.value;
        setSelectedCountry(country);
        const firstCity = Object.keys(LOCATIONS).find(c => LOCATIONS[c].country === country);
        if (firstCity) setActiveCity(firstCity);
    };

    const toggleLayer = (layer: keyof MapLayers) => {
        setLayers({ ...layers, [layer]: !layers[layer] });
    };

    return (
        <div className="flex flex-col gap-2 pointer-events-auto items-start font-sans">
            {/* Toolbar Buttons */}
            <div
                className="flex flex-row gap-2 backdrop-blur rounded-lg shadow-md p-1.5 border transition-colors"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)'
                }}
            >
                <button
                    onClick={() => togglePanel('layers')}
                    className={`p-2 rounded-md transition-all relative group ${activePanel === 'layers'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'transition-colors'
                        }`}
                    style={activePanel !== 'layers' ? {
                        color: 'var(--text-secondary)'
                    } : undefined}
                    title="Capas del Mapa"
                    onMouseEnter={(e) => {
                        if (activePanel !== 'layers') {
                            e.currentTarget.style.backgroundColor = 'var(--surface-bg)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (activePanel !== 'layers') {
                            e.currentTarget.style.backgroundColor = '';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                    }}
                >
                    <Layers className="w-5 h-5" />
                    {/* Tooltip */}
                    <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                        Capas
                    </span>
                </button>

                <button
                    onClick={() => togglePanel('location')}
                    className={`p-2 rounded-md transition-all relative group ${activePanel === 'location'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'transition-colors'
                        }`}
                    style={activePanel !== 'location' ? {
                        color: 'var(--text-secondary)'
                    } : undefined}
                    title="Ubicación"
                    onMouseEnter={(e) => {
                        if (activePanel !== 'location') {
                            e.currentTarget.style.backgroundColor = 'var(--surface-bg)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (activePanel !== 'location') {
                            e.currentTarget.style.backgroundColor = '';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                    }}
                >
                    <MapPin className="w-5 h-5" />
                    <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                        Ubicación
                    </span>
                </button>

                <button
                    onClick={() => setIs3D(!is3D)}
                    className={`p-2 rounded-md transition-all relative group ${is3D
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'transition-colors'
                        }`}
                    style={!is3D ? {
                        color: 'var(--text-secondary)'
                    } : undefined}
                    title="Vista 3D"
                    onMouseEnter={(e) => {
                        if (!is3D) {
                            e.currentTarget.style.backgroundColor = 'var(--surface-bg)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!is3D) {
                            e.currentTarget.style.backgroundColor = '';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                    }}
                >
                    <Box className="w-5 h-5" />
                    <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                        Vista 3D
                    </span>
                </button>
            </div>

            {/* Expanded Panels */}
            {activePanel && (
                <div
                    className={`absolute top-0 left-full ml-3 backdrop-blur border rounded-xl shadow-xl animate-in fade-in slide-in-from-left-2 duration-200 transition-colors ${activePanel === 'layers' ? 'p-2' : 'p-3 w-52'}`}
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--card-border)'
                    }}
                >
                    {/* Header for Location only */}


                    {/* CONTENT: LAYERS (Horizontal Icon Row) */}
                    {activePanel === 'layers' && (
                        <div className="flex flex-row gap-2">
                            {/* Heatmap */}
                            <button
                                onClick={() => toggleLayer('heatmap')}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all relative group ${layers.heatmap
                                    ? 'bg-red-500 text-white shadow-md ring-2 ring-red-200 dark:ring-red-900'
                                    : 'border transition-colors'
                                    }`}
                                style={!layers.heatmap ? {
                                    backgroundColor: 'var(--card-bg)',
                                    borderColor: 'var(--card-border)',
                                    color: 'var(--text-secondary)'
                                } : undefined}
                            >
                                <Flame className="w-5 h-5" />
                                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    Mapa de Calor
                                </span>
                            </button>

                            {/* Boroughs */}
                            <button
                                onClick={() => toggleLayer('borough')}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all relative group ${layers.borough
                                    ? 'bg-blue-500 text-white shadow-md ring-2 ring-blue-200 dark:ring-blue-900'
                                    : 'border transition-colors'
                                    }`}
                                style={!layers.borough ? {
                                    backgroundColor: 'var(--card-bg)',
                                    borderColor: 'var(--card-border)',
                                    color: 'var(--text-secondary)'
                                } : undefined}
                            >
                                <Building2 className="w-5 h-5" />
                                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    Distritos
                                </span>
                            </button>

                            {/* Socioeconomic */}
                            <button
                                onClick={() => toggleLayer('socioeconomic')}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all relative group ${layers.socioeconomic
                                    ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-200 dark:ring-emerald-900'
                                    : 'border transition-colors'
                                    }`}
                                style={!layers.socioeconomic ? {
                                    backgroundColor: 'var(--card-bg)',
                                    borderColor: 'var(--card-border)',
                                    color: 'var(--text-secondary)'
                                } : undefined}
                            >
                                <Banknote className="w-5 h-5" />
                                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    Socioeconómico
                                </span>
                            </button>

                            {/* Population */}
                            <button
                                onClick={() => toggleLayer('population')}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all relative group ${layers.population
                                    ? 'bg-indigo-500 text-white shadow-md ring-2 ring-indigo-200 dark:ring-indigo-900'
                                    : 'border transition-colors'
                                    }`}
                                style={!layers.population ? {
                                    backgroundColor: 'var(--card-bg)',
                                    borderColor: 'var(--card-border)',
                                    color: 'var(--text-secondary)'
                                } : undefined}
                            >
                                <Users className="w-5 h-5" />
                                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    Población
                                </span>
                            </button>
                        </div>
                    )}

                    {/* CONTENT: LOCATION */}
                    {activePanel === 'location' && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold mb-1 transition-colors" style={{ color: 'var(--text-secondary)' }}>País</label>
                                <select
                                    value={selectedCountry}
                                    onChange={handleCountryChange}
                                    className="w-full rounded-lg px-2 py-2 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all"
                                    style={{
                                        backgroundColor: 'var(--surface-bg)',
                                        color: 'var(--text-primary)',
                                        borderWidth: '1px',
                                        borderStyle: 'solid',
                                        borderColor: 'var(--card-border)'
                                    }}
                                >
                                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1 transition-colors" style={{ color: 'var(--text-secondary)' }}>Ciudad</label>
                                <select
                                    value={activeCity || ""}
                                    onChange={(e) => setActiveCity(e.target.value)}
                                    className="w-full rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all"
                                    style={{
                                        backgroundColor: 'var(--surface-bg)',
                                        color: 'var(--text-primary)',
                                        borderWidth: '1px',
                                        borderStyle: 'solid',
                                        borderColor: 'var(--card-border)'
                                    }}
                                >
                                    {Object.keys(LOCATIONS)
                                        .filter(city => !selectedCountry || LOCATIONS[city].country === selectedCountry)
                                        .map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                            </div>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 mt-2">
                                <button
                                    onClick={() => {
                                        sessionStorage.removeItem('churnmap_data');
                                        sessionStorage.removeItem('churnmap_data_time');
                                        window.location.reload();
                                    }}
                                    className="w-full text-xs font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    style={{
                                        backgroundColor: 'var(--surface-bg)',
                                        color: 'var(--text-primary)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '0.8';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Restaurar Vista Inicial
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
