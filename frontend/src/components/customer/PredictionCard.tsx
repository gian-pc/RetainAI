import React from 'react';
import { RefreshCw, TrendingUp, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { PredictionResponse } from '@/types/customer';

interface PredictionCardProps {
    prediction: PredictionResponse | null;
    loading: boolean;
    error: string | null;
    onPredict: () => void;
}

export const PredictionCard = ({ prediction, loading, error, onPredict }: PredictionCardProps) => {

    const getRiskConfig = (risk: string | undefined | null) => {
        if (!risk) {
            return {
                color: 'text-gray-700',
                bgColor: 'bg-gray-50',
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
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    icon: AlertTriangle,
                    label: 'Alto Riesgo'
                };
            case 'medium':
            case 'medio':
                return {
                    color: 'text-amber-700',
                    bgColor: 'bg-amber-50',
                    borderColor: 'border-amber-200',
                    icon: TrendingUp,
                    label: 'Riesgo Medio'
                };
            case 'low':
            case 'bajo':
                return {
                    color: 'text-emerald-700',
                    bgColor: 'bg-emerald-50',
                    borderColor: 'border-emerald-200',
                    icon: CheckCircle,
                    label: 'Bajo Riesgo'
                };
            default:
                return {
                    color: 'text-gray-700',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    icon: TrendingUp,
                    label: 'Sin clasificar'
                };
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                    🤖 Predicción de Churn
                </h2>
                {prediction && (
                    <button
                        onClick={onPredict}
                        disabled={loading}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Refrescar predicción"
                    >
                        <RefreshCw className={`h-4 w-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                )}
            </div>

            {!prediction ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔮</div>
                    <p className="text-slate-600 mb-6">
                        Analiza el riesgo de churn de este cliente usando IA
                    </p>
                    <button
                        onClick={onPredict}
                        disabled={loading}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 transition-colors flex items-center gap-2 mx-auto"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin h-5 w-5" />
                                Analizando...
                            </>
                        ) : (
                            <>
                                <TrendingUp className="h-5 w-5" />
                                Predecir Churn
                            </>
                        )}
                    </button>
                    {error && (
                        <p className="text-red-600 text-sm mt-4">{error}</p>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Risk Badge */}
                    {(() => {
                        const config = getRiskConfig(prediction.risk);
                        const Icon = config.icon;
                        return (
                            <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl p-6`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <Icon className={`h-8 w-8 ${config.color}`} />
                                    <div>
                                        <p className="text-sm text-slate-600">Nivel de Riesgo</p>
                                        <p className={`text-2xl font-bold ${config.color}`}>
                                            {config.label}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm text-slate-600 mb-1">Probabilidad de Churn</p>
                                    <div className="flex items-end gap-2">
                                        <p className={`text-4xl font-bold ${config.color}`}>
                                            {(prediction.probability * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                                        <div
                                            className={`h-2 rounded-full ${prediction.risk?.toLowerCase() === 'high' || prediction.risk?.toLowerCase() === 'alto' ? 'bg-red-600' :
                                                prediction.risk?.toLowerCase() === 'medium' || prediction.risk?.toLowerCase() === 'medio' ? 'bg-amber-600' :
                                                    'bg-emerald-600'
                                                }`}
                                            style={{ width: `${prediction.probability * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Main Factor */}
                    <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-sm text-slate-600 mb-1">🎯 Factor Principal</p>
                        <p className="text-base font-semibold text-slate-900">
                            {prediction.main_factor}
                        </p>
                    </div>

                    {/* Next Best Action */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                        <p className="text-sm text-indigo-600 mb-1">💡 Acción Recomendada</p>
                        <p className="text-base font-semibold text-indigo-900">
                            {prediction.next_best_action}
                        </p>
                    </div>

                    {/* Timestamp */}
                    <p className="text-xs text-slate-500 text-center">
                        Predicción generada: {new Date().toLocaleString('es-ES')}
                    </p>
                </div>
            )}
        </div>
    );
};
