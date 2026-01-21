"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle, Loader2, RefreshCw, Clock, Calendar } from 'lucide-react';

interface PredictionResponse {
    risk: string;
    probability: number;
    main_factor: string;
    next_best_action: string;
}

interface PredictionHistoryItem {
    id: number;
    probabilidadFuga: number;
    motivoPrincipal: string;
    fechaAnalisis: string;
    nivelRiesgo: string;
}

interface CustomerData {
    id: string;
    ciudad: string;
    segmento: string;
    genero?: string;
    edad?: number;
    subscription?: {
        cuotaMensual: number;
        mesesPermanencia: number;
        tipoContrato: string;
    };
    metrics?: {
        scoreNps: number;
        scoreCsat: number;
        ticketsSoporte: number;
    };
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [customerData, setCustomerData] = useState<CustomerData | null>(null);
    const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
    const [predictionHistory, setPredictionHistory] = useState<PredictionHistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Unwrap the params Promise
    const { id: customerId } = use(params);

    useEffect(() => {
        fetchCustomerData();
        fetchPredictionHistory();
    }, [customerId]);

    const fetchCustomerData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch customer basic info
            const customerRes = await fetch(`http://localhost:8080/api/customers/${customerId}`);
            if (!customerRes.ok) throw new Error('Cliente no encontrado');
            const customerData = await customerRes.json();
            setCustomerData(customerData);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const runPrediction = async () => {
        try {
            setLoading(true);
            setError(null);

            // Call prediction endpoint
            const predRes = await fetch(`http://localhost:8080/api/customers/${customerId}/predict`, {
                method: 'POST',
            });

            if (!predRes.ok) throw new Error('Error al predecir churn');
            const predData = await predRes.json();
            setPrediction(predData);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al predecir');
        } finally {
            setLoading(false);
        }
    };

    const fetchPredictionHistory = async () => {
        try {
            setHistoryLoading(true);
            const historyRes = await fetch(`http://localhost:8080/api/customers/${customerId}/predictions/history`);

            if (historyRes.ok) {
                const historyData = await historyRes.json();
                setPredictionHistory(historyData);
            }
        } catch (err) {
            console.error('Error fetching prediction history:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const getRiskConfig = (risk: string) => {
        switch (risk.toLowerCase()) {
            case 'high':
                return {
                    color: 'text-red-700',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    icon: AlertTriangle,
                    label: 'Alto Riesgo'
                };
            case 'medium':
                return {
                    color: 'text-amber-700',
                    bgColor: 'bg-amber-50',
                    borderColor: 'border-amber-200',
                    icon: TrendingUp,
                    label: 'Riesgo Medio'
                };
            case 'low':
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

    if (loading && !customerData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[calc(100vh-64px)]">
                    <div className="text-center">
                        <Loader2 className="animate-spin h-16 w-16 text-indigo-600 mx-auto mb-4" />
                        <p className="text-slate-600">Cargando datos del cliente...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error && !customerData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                        <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-red-900 mb-2">Error</h2>
                        <p className="text-red-700 mb-4">{error}</p>
                        <button
                            onClick={() => router.push('/customers')}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Volver a Clientes
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/customers')}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver a Clientes
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Cliente: {customerId}
                    </h1>
                    <p className="text-base text-slate-600">
                        Detalles y predicción de churn
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Info Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">
                            📋 Información del Cliente
                        </h2>

                        {customerData && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <span className="text-sm text-slate-600">ID</span>
                                    <span className="text-sm font-mono font-semibold text-slate-900">{customerData.id}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <span className="text-sm text-slate-600">Ciudad</span>
                                    <span className="text-sm font-semibold text-slate-900">{customerData.ciudad}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <span className="text-sm text-slate-600">Segmento</span>
                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                        {customerData.segmento}
                                    </span>
                                </div>
                                {customerData.genero && (
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-sm text-slate-600">Género</span>
                                        <span className="text-sm font-semibold text-slate-900">{customerData.genero}</span>
                                    </div>
                                )}
                                {customerData.edad && (
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-sm text-slate-600">Edad</span>
                                        <span className="text-sm font-semibold text-slate-900">{customerData.edad} años</span>
                                    </div>
                                )}
                                {customerData.subscription && (
                                    <>
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                            <span className="text-sm text-slate-600">Cuota Mensual</span>
                                            <span className="text-sm font-semibold text-slate-900">
                                                ${customerData.subscription.cuotaMensual.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                            <span className="text-sm text-slate-600">Antigüedad</span>
                                            <span className="text-sm font-semibold text-slate-900">
                                                {customerData.subscription.mesesPermanencia} meses
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                            <span className="text-sm text-slate-600">Tipo Contrato</span>
                                            <span className="text-sm font-semibold text-slate-900">
                                                {customerData.subscription.tipoContrato}
                                            </span>
                                        </div>
                                    </>
                                )}
                                {customerData.metrics && (
                                    <>
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                            <span className="text-sm text-slate-600">NPS Score</span>
                                            <span className="text-sm font-semibold text-slate-900">
                                                {customerData.metrics.scoreNps}/100
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                            <span className="text-sm text-slate-600">CSAT Score</span>
                                            <span className="text-sm font-semibold text-slate-900">
                                                {customerData.metrics.scoreCsat}/5
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2">
                                            <span className="text-sm text-slate-600">Tickets Soporte</span>
                                            <span className="text-sm font-semibold text-slate-900">
                                                {customerData.metrics.ticketsSoporte}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Prediction Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900">
                                🤖 Predicción de Churn
                            </h2>
                            {prediction && (
                                <button
                                    onClick={runPrediction}
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
                                    onClick={runPrediction}
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
                                                        className={`h-2 rounded-full ${
                                                            prediction.risk.toLowerCase() === 'high' ? 'bg-red-600' :
                                                            prediction.risk.toLowerCase() === 'medium' ? 'bg-amber-600' :
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
                </div>

                {/* Prediction History Section */}
                <div className="mt-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Clock className="h-6 w-6 text-indigo-600" />
                                <h2 className="text-xl font-bold text-slate-900">
                                    Historial de Predicciones
                                </h2>
                            </div>
                            {historyLoading && (
                                <Loader2 className="animate-spin h-5 w-5 text-indigo-600" />
                            )}
                        </div>

                        {predictionHistory.length === 0 ? (
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
                                {predictionHistory.map((item, index) => {
                                    const config = getRiskConfig(item.nivelRiesgo);
                                    const Icon = config.icon;
                                    const isLatest = index === 0;

                                    return (
                                        <div
                                            key={item.id}
                                            className={`border-l-4 ${config.borderColor} bg-slate-50 rounded-r-xl p-4 hover:bg-slate-100 transition-colors ${
                                                isLatest ? 'ring-2 ring-indigo-200' : ''
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
                </div>
            </main>
        </div>
    );
}
