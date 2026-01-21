'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PriorityAction {
  customerId: string;
  customerName: string;
  ciudad: string;
  segmento: string;
  risk: string;
  probability: number;
  mainFactor: string;
  nextBestAction: string;
  monthlyRevenue: number;
  tenure: number;
  contractType: string;
  priorityScore: number;
}

export default function PriorityActionsPage() {
  const [actions, setActions] = useState<PriorityAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPriorityActions();
  }, []);

  const fetchPriorityActions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/insights/priority?limit=20');

      if (!response.ok) {
        throw new Error('Error fetching priority actions');
      }

      const data = await response.json();
      setActions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskTextColor = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'HIGH':
        return 'text-red-600';
      case 'MEDIUM':
        return 'text-yellow-600';
      case 'LOW':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando acciones prioritarias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchPriorityActions}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Acciones Prioritarias</h1>
              <p className="mt-1 text-sm text-gray-600">
                Top {actions.length} clientes que requieren atención inmediata, ordenados por impacto de negocio
              </p>
            </div>
            <button
              onClick={fetchPriorityActions}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Actualizar
            </button>
          </div>

          {/* Sorting Info */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Ordenado por:</span> Riesgo × Ingresos (Priority Score)
            </p>
          </div>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {actions.map((action, index) => (
            <div
              key={action.customerId}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  {/* Left Section - Customer Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Risk Indicator */}
                      <div className={`w-3 h-3 rounded-full ${getRiskColor(action.risk)}`}></div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {action.customerName || action.customerId}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ID: {action.customerId} | {action.ciudad || 'N/A'} | {action.segmento || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Risk & Revenue Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Riesgo</p>
                        <p className={`text-lg font-bold ${getRiskTextColor(action.risk)}`}>
                          {action.risk} ({Math.round(action.probability * 100)}%)
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Ingresos Mensuales</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${action.monthlyRevenue?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Antigüedad</p>
                        <p className="text-lg font-bold text-gray-900">
                          {action.tenure || 0} meses
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Contrato</p>
                        <p className="text-lg font-bold text-gray-900">
                          {action.contractType || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* AI Insights */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-blue-900 mb-1">Factor Principal:</p>
                          <p className="text-sm text-blue-800">{action.mainFactor}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-blue-900 mb-1">Acción Sugerida:</p>
                          <p className="text-sm text-blue-800">{action.nextBestAction}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Link
                        href={`/customers/${action.customerId}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        👁️ Ver Perfil
                      </Link>
                      <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                        📞 Llamar
                      </button>
                      <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
                        📧 Enviar Email
                      </button>
                    </div>
                  </div>

                  {/* Right Section - Priority Score */}
                  <div className="ml-6 text-center">
                    <p className="text-xs text-gray-500 uppercase mb-1">Priority Score</p>
                    <div className="bg-gray-100 rounded-lg px-4 py-3">
                      <p className="text-2xl font-bold text-gray-900">
                        #{index + 1}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {action.priorityScore?.toFixed(0) || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {actions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay acciones prioritarias en este momento</p>
          </div>
        )}
      </div>
    </div>
  );
}
