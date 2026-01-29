'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import BatchPredictionModal from '@/components/BatchPredictionModal';
import UploadDatasetModal from '@/components/UploadDatasetModal';
import { useLayoutContext } from '@/context/LayoutContext';
import KPICards from '@/components/KPICards';
import AIAssistant from '@/components/AIAssistant';

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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { isChatbotOpen, isPredictionModalOpen, setPredictionModalOpen } = useLayoutContext();

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



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-400 transition-colors">Cargando Centro de Comando...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center transition-colors">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 transition-colors">
          <p className="text-red-600 dark:text-red-400 transition-colors">Error cargando datos del dashboard</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
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
        <div className="h-[calc(100vh-4rem)] bg-gray-50 dark:bg-slate-900 overflow-hidden flex items-center justify-center transition-colors">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 border-2 border-dashed border-gray-300 dark:border-slate-700 transition-colors">
              <svg
                className="mx-auto h-24 w-24 text-gray-400 dark:text-slate-500 mb-6 transition-colors"
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
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
                Bienvenido a RetainAI
              </h2>
              <p className="text-gray-600 dark:text-slate-400 mb-6 transition-colors">
                Para comenzar, carga tu dataset de clientes en formato CSV. <br />
                El sistema poblará la base de datos y generará estadísticas en tiempo real.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 transition-colors">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 transition-colors">Qué incluye el CSV:</h3>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 text-left mx-auto max-w-md transition-colors">
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
    <div
      className="h-[calc(100vh-4rem)] overflow-hidden relative transition-colors duration-300"
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      {/* Main Content - Flex Column to fill viewport */}
      <div className={`flex flex-col h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4 space-y-6 transition-all duration-300 ease-in-out`}>


        {/* KPI Cards */}
        <KPICards
          revenueAtRisk={revenueAtRisk}
          churnRate={churnRate}
          customersAtRisk={customersAtRisk}
          avgNps={avgNps}
        />

        {/* Geographic Churn Heatmap - FLEXIBLE (Fills remaining space) */}
        <div
          className="flex-1 min-h-0 relative rounded-lg shadow-sm border overflow-hidden"
          style={{
            backgroundColor: 'var(--surface-bg)',
            borderColor: 'var(--card-border)'
          }}
        >
          {/* Mapa Real con Mapbox */}
          <ChurnMap />
          <AIAssistant />
        </div>

      </div>



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
