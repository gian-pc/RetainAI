// Executive Dashboard - Vista principal con KPIs y visualizaciones
'use client';

import { useState, useEffect } from 'react';
import KPICard from './KPICard';
import BatchPredictionModal from './BatchPredictionModal';
import { DollarSign, TrendingDown, Users, Star, Zap } from 'lucide-react';

interface DashboardStats {
    revenueAtRisk: number;
    churnRate: number;
    customersAtRisk: number;
    npsScore: number;
    trends: {
        revenue: number;
        churn: number;
        customers: number;
        nps: number;
    };
}

export default function ExecutiveDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showBatchModal, setShowBatchModal] = useState(false);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            // Call Java backend stats endpoint
            const response = await fetch('http://localhost:8080/api/dashboard/stats');
            const data = await response.json();

            // Map backend response to frontend format
            setStats({
                revenueAtRisk: data.churnRevenue || 0,
                churnRate: data.churnRate || 0,
                customersAtRisk: data.abandonedCustomers || 0,
                npsScore: data.avgNpsScore || 0,
                trends: {
                    revenue: -12,  // TODO: Implement trend calculation in backend
                    churn: 2,
                    customers: 8,
                    nps: -5
                }
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // NO mostrar datos falsos - dejar stats en null para mostrar error
            setStats(null);
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">Error cargando datos del dashboard</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard Ejecutivo</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Resumen de métricas clave de retención
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowBatchModal(true)}
                                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-md"
                            >
                                <Zap className="w-4 h-4" />
                                <span>Predecir Todos</span>
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                Filtros
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                Exportar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <KPICard
                        title="💰 Ingresos en Riesgo"
                        value={`$${(stats.revenueAtRisk / 1000000).toFixed(1)}M`}
                        trend={{
                            value: Math.abs(stats.trends.revenue),
                            direction: stats.trends.revenue < 0 ? 'down' : 'up'
                        }}
                        icon={<DollarSign className="w-6 h-6" />}
                        breakdown={[
                            { label: 'Corporativo', value: '$450K' },
                            { label: 'PYME', value: '$600K' },
                            { label: 'Residencial', value: '$347K' }
                        ]}
                        riskLevel="critical"
                        onViewMore={() => console.log('View revenue details')}
                    />

                    <KPICard
                        title="📉 Tasa de Abandono"
                        value={`${stats.churnRate.toFixed(1)}%`}
                        trend={{
                            value: Math.abs(stats.trends.churn),
                            direction: stats.trends.churn > 0 ? 'up' : 'down'
                        }}
                        icon={<TrendingDown className="w-6 h-6" />}
                        breakdown={[
                            { label: 'Mensual', value: '29.2%' },
                            { label: 'Anual', value: '0.0%' }
                        ]}
                        riskLevel="high"
                        onViewMore={() => console.log('View churn details')}
                    />

                    <KPICard
                        title="👥 Clientes en Riesgo"
                        value={stats.customersAtRisk.toLocaleString()}
                        trend={{
                            value: Math.abs(stats.trends.customers),
                            direction: stats.trends.customers > 0 ? 'up' : 'down'
                        }}
                        icon={<Users className="w-6 h-6" />}
                        breakdown={[
                            { label: 'Crítico', value: '1,434' },
                            { label: 'Alto', value: '558' }
                        ]}
                        riskLevel="critical"
                        onViewMore={() => console.log('View customers')}
                    />

                    <KPICard
                        title="📊 NPS Promedio"
                        value={`${stats.npsScore}/100`}
                        trend={{
                            value: Math.abs(stats.trends.nps),
                            direction: stats.trends.nps < 0 ? 'down' : 'up'
                        }}
                        icon={<Star className="w-6 h-6" />}
                        breakdown={[
                            { label: 'Detractores', value: '573' },
                            { label: 'Promotores', value: '8,991' }
                        ]}
                        riskLevel="medium"
                        onViewMore={() => console.log('View NPS details')}
                    />
                </div>

                {/* Alerts Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">⚠️ Alertas Críticas</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                                <div>
                                    <p className="font-medium text-gray-900">1,434 clientes con 6+ tickets</p>
                                    <p className="text-sm text-gray-600">77.7% probabilidad de churn</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200">
                                Ver lista
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                                <div>
                                    <p className="font-medium text-gray-900">1,552 contratos mensuales en riesgo</p>
                                    <p className="text-sm text-gray-600">29.2% churn rate - ROI 1,100%</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200">
                                Crear campaña
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                                <div>
                                    <p className="font-medium text-gray-900">1,165 clientes en período crítico (0-12 meses)</p>
                                    <p className="text-sm text-gray-600">38.5% churn en onboarding</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 rounded-md hover:bg-orange-200">
                                Ver programa
                            </button>
                        </div>
                    </div>

                    <button className="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                        Ver todas las alertas →
                    </button>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Segmentation Placeholder */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Segmentación de Clientes</h2>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Bubble Chart - Próximamente</p>
                        </div>
                    </div>

                    {/* Geographic Heatmap Placeholder */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">🗺️ Distribución Geográfica</h2>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Mapa NYC - Próximamente</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Batch Prediction Modal */}
            <BatchPredictionModal
                isOpen={showBatchModal}
                onClose={() => setShowBatchModal(false)}
                onComplete={() => {
                    // Refrescar datos del dashboard después de completar predicciones
                    fetchDashboardStats();
                }}
            />
        </div>
    );
}
