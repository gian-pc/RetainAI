// BatchPredictionModal - Modal para predicción masiva de todos los clientes
'use client';

import { useState } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

interface BatchPredictionResult {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
}

interface BatchPredictionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: () => void;
}

export default function BatchPredictionModal({ isOpen, onClose, onComplete }: BatchPredictionModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<BatchPredictionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handlePredictAll = async () => {
        setIsProcessing(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('http://localhost:8080/api/customers/predict/batch-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setResult(data);

            // Llamar callback de completado para refrescar datos
            if (onComplete) {
                setTimeout(() => {
                    onComplete();
                }, 1000);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            console.error('Error en batch prediction:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        if (!isProcessing) {
            setResult(null);
            setError(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <Zap className="w-6 h-6 text-blue-600" />
                            <h2 className="text-xl font-bold text-gray-900">
                                Predicción Masiva
                            </h2>
                        </div>
                        {!isProcessing && (
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        {!result && !error && !isProcessing && (
                            <>
                                <p className="text-gray-600 text-sm">
                                    Esta acción ejecutará predicciones de churn para <strong>todos los clientes</strong> en la base de datos.
                                </p>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                    <p className="text-yellow-800 text-xs">
                                        <strong>Nota:</strong> Este proceso puede tardar varios minutos dependiendo de la cantidad de clientes.
                                    </p>
                                </div>
                            </>
                        )}

                        {isProcessing && (
                            <div className="text-center py-8">
                                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                                <p className="text-gray-700 font-medium">Procesando predicciones...</p>
                                <p className="text-gray-500 text-sm mt-2">
                                    Esto puede tardar unos minutos. Por favor no cierres esta ventana.
                                </p>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-center py-4">
                                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                                </div>

                                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                    <h3 className="font-semibold text-green-900 mb-2">
                                        Predicción Completada
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Total procesados:</span>
                                            <span className="font-semibold text-gray-900">
                                                {result.totalProcessed}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-green-700">Exitosos:</span>
                                            <span className="font-semibold text-green-900">
                                                {result.successCount}
                                            </span>
                                        </div>
                                        {result.errorCount > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-red-700">Errores:</span>
                                                <span className="font-semibold text-red-900">
                                                    {result.errorCount}
                                                </span>
                                            </div>
                                        )}
                                        <div className="pt-2 border-t border-green-300">
                                            <div className="flex justify-between">
                                                <span className="text-gray-700">Tasa de éxito:</span>
                                                <span className="font-semibold text-gray-900">
                                                    {((result.successCount / result.totalProcessed) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 text-center">
                                    Los datos del dashboard se actualizarán automáticamente
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-center py-4">
                                    <AlertCircle className="w-16 h-16 text-red-500" />
                                </div>

                                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                    <h3 className="font-semibold text-red-900 mb-2">
                                        Error en la Predicción
                                    </h3>
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end space-x-3">
                        {!result && !error && !isProcessing && (
                            <>
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handlePredictAll}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                >
                                    <Zap className="w-4 h-4" />
                                    <span>Iniciar Predicción</span>
                                </button>
                            </>
                        )}

                        {(result || error) && (
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Cerrar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
