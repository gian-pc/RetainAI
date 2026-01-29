"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertTriangle, RefreshCw, TrendingUp } from 'lucide-react';
import { Customer, PredictionResponse, PredictionHistoryItem } from '@/types/customer';
import { CustomerInfoCard } from '@/components/customer/CustomerInfoCard';
import { PredictionCard } from '@/components/customer/PredictionCard';
import { PredictionHistory } from '@/components/customer/PredictionHistory';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [customerData, setCustomerData] = useState<Customer | null>(null);
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

            // Refetch history to show the new prediction
            fetchPredictionHistory();

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

    if (loading && !customerData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[calc(100vh-64px)]">
                    <div className="text-center">
                        <Loader2 className="animate-spin h-16 w-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-4 transition-colors" />
                        <p className="text-slate-600 dark:text-slate-400 transition-colors">Cargando datos del cliente...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error && !customerData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center transition-colors">
                        <AlertTriangle className="h-16 w-16 text-red-600 dark:text-red-400 mx-auto mb-4 transition-colors" />
                        <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-2 transition-colors">Error</h2>
                        <p className="text-red-700 dark:text-red-300 mb-4 transition-colors">{error}</p>
                        <button
                            onClick={() => router.push('/customers')}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
                        >
                            Volver a Clientes
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/customers')}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver a Clientes
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">
                        Cliente: {customerId}
                    </h1>
                    <p className="text-base text-slate-600 dark:text-slate-400 transition-colors">
                        Detalles y predicción de churn
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Info Card */}
                    {customerData && <CustomerInfoCard customer={customerData} />}

                    {/* Prediction Card */}
                    <PredictionCard
                        prediction={prediction}
                        loading={loading}
                        error={error}
                        onPredict={runPrediction}
                    />
                </div>

                {/* Prediction History Section */}
                <div className="mt-8">
                    <PredictionHistory
                        history={predictionHistory}
                        loading={historyLoading}
                    />
                </div>
            </main>
        </div>
    );
}
