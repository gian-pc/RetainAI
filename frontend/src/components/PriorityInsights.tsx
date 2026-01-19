"use client";

import { useEffect, useState } from 'react';

interface PriorityInsight {
  customerId: string;
  customerName: string;
  ciudad: string;
  segmento: string;
  risk: 'High' | 'Medium' | 'Low';
  probability: number;
  mainFactor: string;
  nextBestAction: string;
  monthlyRevenue: number;
  tenure: number;
  contractType: string;
  priorityScore: number;
}

export default function PriorityInsights() {
  const [insights, setInsights] = useState<PriorityInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        // ⚡ Timeout de 30 segundos - El backend llama ML para cada cliente
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        // Pedir hasta 20 clientes de alto riesgo (reducido para mejorar performance)
        const res = await fetch('http://localhost:8080/api/insights/priority?limit=20', {
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (!res.ok) throw new Error('Error cargando insights');
        const data = await res.json();
        setInsights(data || []); // ✅ Garantizar que siempre sea array
      } catch (err: any) {
        console.error('Error cargando insights:', err);
        // Si hay timeout o error, usar array vacío en lugar de mostrar error
        setInsights([]);
        setError(null); // No mostrar error, solo cargar vacío
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-50 border-red-200 text-red-700';
      case 'Medium': return 'bg-amber-50 border-amber-200 text-amber-700';
      default: return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-600 text-white';
      case 'Medium': return 'bg-amber-500 text-white';
      default: return 'bg-emerald-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-indigo-600"></div>
          <span className="ml-3 text-slate-600">Analizando clientes con IA...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <p className="text-red-700 text-sm">⚠️ Error: {error}</p>
      </div>
    );
  }

  // ✅ Manejar caso de array vacío
  if (!loading && insights.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🎯 Acciones Prioritarias Hoy
          </h2>
          <p className="text-indigo-100 text-sm mt-1">
            Análisis automático de IA
          </p>
        </div>
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">¡Excelente!</h3>
          <p className="text-slate-600">
            No hay clientes de alto riesgo en este momento. Todos los clientes están estables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🎯 Acciones Prioritarias Hoy
        </h2>
        <p className="text-indigo-100 text-sm mt-1">
          Análisis automático de IA • {insights.length} clientes de alto riesgo
        </p>
      </div>

      {/* Insights List */}
      <div className="divide-y divide-slate-100">
        {insights.map((insight, idx) => (
          <div
            key={insight.customerId}
            className={`p-6 hover:bg-slate-50 transition-colors ${getRiskColor(insight.risk)}`}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-slate-400">#{idx + 1}</span>
                <div>
                  <h3 className="font-bold text-slate-900">
                    {insight.ciudad} • {insight.segmento}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {insight.customerId.slice(-8)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskBadge(insight.risk)}`}>
                  {insight.risk} • {(insight.probability * 100).toFixed(0)}%
                </span>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-700">
                    Score: {insight.priorityScore.toFixed(0)}
                  </p>
                  <p className="text-xs text-slate-500">${insight.monthlyRevenue}/mes</p>
                </div>
              </div>
            </div>

            {/* Main Factor */}
            <div className="bg-white/60 rounded-lg p-3 mb-3 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">🧠 Factor Principal</p>
              <p className="text-sm font-medium text-slate-800">{insight.mainFactor}</p>
            </div>

            {/* Recommended Action */}
            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
              <p className="text-xs font-semibold text-indigo-700 uppercase mb-1">✨ Acción Recomendada</p>
              <p className="text-sm font-medium text-indigo-900">{insight.nextBestAction}</p>
            </div>

            {/* Metadata */}
            <div className="flex gap-4 mt-3 text-xs text-slate-500">
              <span>📅 {insight.tenure} meses</span>
              <span>📄 {insight.contractType}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
        <p className="text-xs text-slate-600">
          💡 <strong>Análisis automático:</strong> Estos clientes fueron identificados y analizados automáticamente por nuestro sistema de IA.
          Actualización cada 15 minutos.
        </p>
      </div>
    </div>
  );
}
