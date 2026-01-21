'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Lazy loading del mapa (ChurnMap ya existe)
const ChurnMap = dynamic(() => import('@/components/ChurnMap'), {
  loading: () => (
    <div className="h-[500px] w-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Cargando mapa...</p>
      </div>
    </div>
  ),
  ssr: false
});

interface DashboardStats {
  totalCustomers: number;
  abandonedCustomers: number;
  churnRate: number;
  totalRevenue: number;
  churnRevenue: number;
  avgNpsScore: number;
}

export default function CommandCenter() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats (CERO hardcoding)
      const statsResponse = await fetch('http://localhost:8080/api/dashboard/stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando Centro de Comando...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">Error cargando datos del dashboard</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const revenueAtRisk = stats.churnRevenue || 0;
  const churnRate = stats.churnRate || 0;
  const customersAtRisk = stats.abandonedCustomers || 0;
  const avgNps = stats.avgNpsScore || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* 4 KPI Cards - Horizontal, Compact */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* KPI 1: Revenue at Risk */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Revenue at Risk</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(revenueAtRisk)}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          {/* KPI 2: Churn Rate */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Churn Rate</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {formatPercentage(churnRate)}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <span className="text-2xl">📉</span>
              </div>
            </div>
          </div>

          {/* KPI 3: Customers at Risk */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Customers at Risk</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {customersAtRisk.toLocaleString()}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </div>

          {/* KPI 4: Avg NPS Score */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Avg NPS Score</p>
                <p className={`text-2xl font-bold mt-1 ${avgNps >= 50 ? 'text-green-600' : 'text-gray-600'}`}>
                  {avgNps.toFixed(0)}
                </p>
              </div>
              <div className={`${avgNps >= 50 ? 'bg-green-100' : 'bg-gray-100'} p-3 rounded-lg`}>
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Geographic Churn Heatmap - PRIMARY ELEMENT (70% of screen) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Mapa Geográfico de Churn</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Distribución de clientes en riesgo por ubicación (NYC)
                </p>
              </div>
              <Link
                href="/actions"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Ver Acciones Prioritarias →
              </Link>
            </div>

            {/* Mapa Real con Mapbox */}
            <ChurnMap />
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-2">💡 AI Insight</h3>
              <p className="text-purple-800 text-sm">
                <span className="font-medium">{customersAtRisk}</span> clientes en riesgo representando{' '}
                <span className="font-medium">{formatCurrency(revenueAtRisk)}</span> en ingresos potenciales.
                Tasa de churn actual: <span className="font-medium">{formatPercentage(churnRate)}</span>.
                NPS promedio: <span className="font-medium">{avgNps.toFixed(0)}</span>/100.
              </p>
              <div className="mt-4">
                <Link
                  href="/actions"
                  className="inline-flex items-center text-sm font-medium text-purple-700 hover:text-purple-900"
                >
                  Ver recomendaciones de retención →
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
