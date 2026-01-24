import React from 'react';

const LOCATIONS: Record<string, { lat: number; lng: number; zoom: number; country: string }> = {
    "New York": { lat: 40.7128, lng: -74.0060, zoom: 10, country: "USA" },
    "London": { lat: 51.5074, lng: -0.1278, zoom: 11, country: "UK" },
    "Berlin": { lat: 52.5200, lng: 13.4050, zoom: 11, country: "Germany" },
    "Toronto": { lat: 43.6532, lng: -79.3832, zoom: 11, country: "Canada" },
};

const COUNTRIES = Array.from(new Set(Object.values(LOCATIONS).map((l) => l.country))).sort();

type ViewMode = 'risk' | 'borough';

interface MapControlsProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    selectedCountry: string;
    setSelectedCountry: (country: string) => void;
    activeCity: string | null;
    setActiveCity: (city: string) => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
    viewMode,
    setViewMode,
    selectedCountry,
    setSelectedCountry,
    activeCity,
    setActiveCity,
}) => {
    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const country = e.target.value;
        setSelectedCountry(country);
        const firstCity = Object.keys(LOCATIONS).find(c => LOCATIONS[c].country === country);
        if (firstCity) setActiveCity(firstCity);
    };

    return (
        <div className="bg-white/95 backdrop-blur border border-slate-200 p-4 rounded-xl shadow-lg flex flex-col gap-3 w-56 pointer-events-auto">
            {/* Toggle de Vista */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                    onClick={() => setViewMode('risk')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === 'risk'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Riesgo
                </button>
                <button
                    onClick={() => setViewMode('borough')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === 'borough'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Distrito
                </button>
            </div>

            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-2">
                📍 Ubicación
            </h4>
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
    );
};
