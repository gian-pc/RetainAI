'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import BatchPredictionModal from '@/components/BatchPredictionModal';
import UploadDatasetModal from '@/components/UploadDatasetModal';

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
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

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

  // ESTADO 0: Base de Datos Vacía - Mostrar CTA para subir CSV
  if (stats.totalCustomers === 0) {
    return (
      <>
        <div className="h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden flex items-center justify-center">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-dashed border-gray-300">
              <svg
                className="mx-auto h-24 w-24 text-gray-400 mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Bienvenido a RetainAI
              </h2>
              <p className="text-gray-600 mb-6">
                Para comenzar, carga tu dataset de clientes en formato CSV. <br />
                El sistema poblará la base de datos y generará estadísticas en tiempo real.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Qué incluye el CSV:</h3>
                <ul className="text-sm text-blue-800 space-y-1 text-left mx-auto max-w-md">
                  <li>✓ Información demográfica de clientes</li>
                  <li>✓ Datos de suscripción y facturación</li>
                  <li>✓ Métricas de uso y actividad</li>
                  <li>✓ Historial de soporte y satisfacción (NPS)</li>
                </ul>
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:shadow-xl transition-all hover:scale-105 flex items-center space-x-3 mx-auto text-lg font-semibold"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Subir Dataset CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        <UploadDatasetModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            // Refrescar datos después de subir
            fetchDashboardData();
          }}
        />
      </>
    );
  }

  // Calculate metrics
  const revenueAtRisk = stats.churnRevenue || 0;
  const churnRate = stats.churnRate || 0;
  const customersAtRisk = stats.abandonedCustomers || 0;
  const avgNps = stats.avgNpsScore || 0;

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
      {/* Main Content - Flex Column to fill viewport */}
      <div className="flex flex-col h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">

        {/* 4 KPI Cards - Horizontal, Compact (Fixed Height) */}
        <div className="flex-none grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* KPI 1: Revenue at Risk */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Ingresos en Riesgo</p>
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
                <p className="text-xs text-gray-500 uppercase font-medium">Tasa de Cancelación</p>
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
                <p className="text-xs text-gray-500 uppercase font-medium">Clientes en Riesgo</p>
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
                <p className="text-xs text-gray-500 uppercase font-medium">Satisfacción Promedio</p>
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

        {/* Geographic Churn Heatmap - FLEXIBLE (Fills remaining space) */}
        <div className="flex-1 min-h-0 relative bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Mapa Real con Mapbox */}
          <ChurnMap />
        </div>

      </div>

      {/* Botón flotante para Batch Prediction - Posicionado ARRIBA del chatbot */}
      <button
        onClick={() => setShowBatchModal(true)}
        className="fixed bottom-28 right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center space-x-2 z-50"
        title="Predecir todos los clientes"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
        <span className="font-semibold">Predecir Todos</span>
      </button>

      {/* Batch Prediction Modal */}
      <BatchPredictionModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        onComplete={() => {
          // Refrescar datos del dashboard después de completar predicciones
          fetchDashboardData();
        }}
      />

      {/* Upload Dataset Modal */}
      <UploadDatasetModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          // Refrescar datos después de subir
          fetchDashboardData();
        }}
      />
    </div>
  );
}
