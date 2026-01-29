import React from 'react';
import { MapLayers } from './MapControls';

interface MapLegendProps {
    layers: MapLayers;
}

export const MapLegend: React.FC<MapLegendProps> = ({ layers }) => {
    // Si no hay ninguna capa activa relevante (que no sea el heatmap base), podríamos ocultarlo o mostrar solo el heatmap
    // Pero el usuario pidió "donde se vea todo".

    return (
        <div
            className="border rounded-xl shadow-lg w-64 pointer-events-auto max-h-[70vh] overflow-y-auto transition-colors p-4"
            style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)'
            }}
        >
            <h3 className="text-sm font-bold mb-3 border-b pb-2 transition-colors" style={{ color: 'var(--text-primary)', borderColor: 'var(--card-border)' }}>
                Leyenda del Mapa
            </h3>

            <div className="space-y-4">
                {/* 1. RIESGO DE PROBABILIDAD (Heatmap) - Siempre visible o si heatmap activo */}
                {layers.heatmap && (
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wide mb-2 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                            🔥 Probabilidad de Churn
                        </h4>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <div className="w-12 h-3 rounded bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600"></div>
                                <span className="text-xs transition-colors" style={{ color: 'var(--text-secondary)' }}>Bajo → Alto</span>
                            </div>
                            <div className="grid grid-cols-1 gap-1.5 mt-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-sm"></div>
                                    <span className="text-xs transition-colors" style={{ color: 'var(--text-primary)' }}>Riesgo Alto (&gt;40%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></div>
                                    <span className="text-xs transition-colors" style={{ color: 'var(--text-primary)' }}>Riesgo Medio (25-40%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div>
                                    <span className="text-xs transition-colors" style={{ color: 'var(--text-primary)' }}>Riesgo Bajo (&lt;25%)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. DISTRITOS (Siempre útil como referencia) */}
                {(layers.borough || (!layers.socioeconomic && !layers.population)) && (
                    <div className={layers.heatmap ? "pt-3 border-t border-slate-100 dark:border-slate-700" : ""}>
                        <h4 className="text-xs font-bold uppercase tracking-wide mb-2 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                            🏙️ Distritos
                        </h4>
                        <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                <span className="text-xs transition-colors" style={{ color: 'var(--text-primary)' }}>Manhattan</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                <span className="text-xs transition-colors" style={{ color: 'var(--text-primary)' }}>Brooklyn</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                <span className="text-xs transition-colors" style={{ color: 'var(--text-primary)' }}>Queens</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-fuchsia-500"></div>
                                <span className="text-xs transition-colors" style={{ color: 'var(--text-primary)' }}>Bronx</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-xs transition-colors" style={{ color: 'var(--text-primary)' }}>Staten Is.</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. SOCIOECONÓMICO */}
                {layers.socioeconomic && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                        <h4 className="text-xs font-bold uppercase tracking-wide mb-2 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                            💰 Ingreso Medio
                        </h4>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-xs transition-colors" style={{ color: 'var(--text-secondary)' }}>&lt; $55k</span>
                                <div className="w-8 h-2.5 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-xs transition-colors" style={{ color: 'var(--text-secondary)' }}>$55k - $65k</span>
                                <div className="w-8 h-2.5 rounded" style={{ backgroundColor: '#8b5cf6' }}></div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-xs transition-colors" style={{ color: 'var(--text-secondary)' }}>$65k - $75k</span>
                                <div className="w-8 h-2.5 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-xs transition-colors" style={{ color: 'var(--text-secondary)' }}>$75k - $80k</span>
                                <div className="w-8 h-2.5 rounded" style={{ backgroundColor: '#10b981' }}></div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-xs transition-colors" style={{ color: 'var(--text-secondary)' }}>&gt; $80k</span>
                                <div className="w-8 h-2.5 rounded" style={{ backgroundColor: '#064e3b' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. POBLACIÓN */}
                {layers.population && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                        <h4 className="text-xs font-bold uppercase tracking-wide mb-2 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                            👥 Densidad
                        </h4>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-xs transition-colors" style={{ color: 'var(--text-secondary)' }}>Baja (&lt; 15k)</span>
                                <div className="w-8 h-2.5 rounded" style={{ backgroundColor: '#dbeafe' }}></div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-xs transition-colors" style={{ color: 'var(--text-secondary)' }}>Media (15k-35k)</span>
                                <div className="w-8 h-2.5 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-xs transition-colors" style={{ color: 'var(--text-secondary)' }}>Alta (&gt; 35k)</span>
                                <div className="w-8 h-2.5 rounded" style={{ backgroundColor: '#1e3a8a' }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
