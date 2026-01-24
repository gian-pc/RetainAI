import React from 'react';

type ViewMode = 'risk' | 'borough';

interface MapLegendProps {
    viewMode: ViewMode;
}

export const MapLegend: React.FC<MapLegendProps> = ({ viewMode }) => {
    return (
        <div className="bg-white/95 backdrop-blur border border-slate-200 p-4 rounded-xl shadow-lg w-64 pointer-events-auto">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
                {viewMode === 'risk' ? '🎯 Nivel de Riesgo' : '🗺️ Distritos'}
            </h4>

            {viewMode === 'risk' ? (
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
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-slate-700 font-medium">Manhattan</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-xs text-slate-700 font-medium">Brooklyn</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-xs text-slate-700 font-medium">Queens</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-fuchsia-500"></div>
                        <span className="text-xs text-slate-700 font-medium">Bronx</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-xs text-slate-700 font-medium">Staten Is.</span>
                    </div>
                </div>
            )}

            <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500 leading-relaxed">
                    {viewMode === 'risk'
                        ? <><strong className="text-slate-700">100% =</strong> Ya abandonó (churn histórico)</>
                        : 'Visualización por ubicación administrativa vs coordenada.'}
                </p>
            </div>
        </div>
    );
};
