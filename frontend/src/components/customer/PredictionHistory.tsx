import React from 'react';
import { Clock, Loader2, Calendar, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { PredictionHistoryItem } from '@/types/customer';

interface PredictionHistoryProps {
    history: PredictionHistoryItem[];
    loading: boolean;
}

export const PredictionHistory = ({ history, loading }: PredictionHistoryProps) => {

    const getRiskConfig = (risk: string | undefined | null) => {
        if (!risk) {
            return {
                color: 'text-gray-700',
                borderColor: 'border-gray-200',
                icon: TrendingUp,
                label: 'Sin clasificar'
            };
        }

        switch (risk.toLowerCase()) {
            case 'high':
            case 'alto':
                return {
                    color: 'text-red-700',
                    borderColor: 'border-red-200',
                    icon: AlertTriangle,
                    label: 'Alto Riesgo'
                };
            case 'medium':
            case 'medio':
                return {
                    color: 'text-amber-700',
                    borderColor: 'border-amber-200',
                    icon: TrendingUp,
                    label: 'Riesgo Medio'
                };
            case 'low':
            case 'bajo':
                return {
                    color: 'text-emerald-700',
                    borderColor: 'border-emerald-200',
                    icon: CheckCircle,
                    label: 'Bajo Riesgo'
                };
            default:
                return {
                    color: 'text-gray-700',
                    borderColor: 'border-gray-200',
                    icon: TrendingUp,
                    label: 'Sin clasificar'
                };
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-xl font-bold text-slate-900">
                        Historial de Predicciones
                    </h2>
                </div>
                {loading && (
                    <Loader2 className="animate-spin h-5 w-5 text-indigo-600" />
                )}
            </div>

            {history.length === 0 ? (
                <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">
                        No hay predicciones previas para este cliente
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                        Las nuevas predicciones aparecerán aquí
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((item, index) => {
                        const config = getRiskConfig(item.nivelRiesgo);
                        const Icon = config.icon;
                        const isLatest = index === 0;

                        return (
                            <div
                                key={item.id}
                                className={`border-l-4 ${config.borderColor} bg-slate-50 rounded-r-xl p-4 hover:bg-slate-100 transition-colors ${isLatest ? 'ring-2 ring-indigo-200' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <Icon className={`h-5 w-5 ${config.color} mt-1`} />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-sm font-bold ${config.color}`}>
                                                    {config.label}
                                                </span>
                                                {isLatest && (
                                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                                                        Más Reciente
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 mb-2">
                                                <span className="font-semibold">
                                                    {(item.probabilidadFuga * 100).toFixed(1)}%
                                                </span>{' '}
                                                de probabilidad de fuga
                                            </p>
                                            <p className="text-sm text-slate-700">
                                                <span className="font-medium">Factor:</span> {item.motivoPrincipal}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500">
                                            {new Date(item.fechaAnalisis).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(item.fechaAnalisis).toLocaleTimeString('es-ES', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
