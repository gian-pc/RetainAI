'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  Eye,
  Phone,
  Mail,
  AlertCircle,
  TrendingUp,
  Calendar,
  FileText,
  Sparkles,
  ArrowRight,
  User,
  CheckCircle2
} from 'lucide-react';

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

  const getRiskStyles = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'HIGH':
      case 'ALTO':
        return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', icon: <AlertCircle className="w-4 h-4 text-red-600" /> };
      case 'MEDIUM':
      case 'MEDIO':
        return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', icon: <AlertCircle className="w-4 h-4 text-orange-600" /> };
      case 'LOW':
      case 'BAJO':
        return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100', icon: <AlertCircle className="w-4 h-4" /> };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900 flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="text-gray-500 dark:text-slate-400 font-medium transition-colors">Analizando prioridades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors">
        <div className="bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/50 rounded-2xl p-8 max-w-md shadow-lg text-center transition-colors">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 dark:text-red-400 transition-colors">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-gray-900 dark:text-white font-bold text-lg mb-2 transition-colors">Error de Conexión</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6 transition-colors">{error}</p>
          <button
            onClick={fetchPriorityActions}
            className="bg-gray-900 dark:bg-slate-700 text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900 pb-20 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">Acciones Prioritarias</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 transition-colors">
                Top {actions.length} clientes críticos ordenados por impacto de negocio
              </p>
            </div>
            <button
              onClick={fetchPriorityActions}
              className="p-2.5 text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200"
              title="Actualizar Datos"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Sort Badge */}
        <div className="flex justify-end mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700">
            <Sparkles className="w-3.5 h-3.5" />
            Score: Riesgo × Ingresos
          </span>
        </div>

        <div className="space-y-6">
          {actions.map((action, index) => {
            const riskStyle = getRiskStyles(action.risk);
            return (
              <div
                key={action.customerId}
                className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-blue-200/50 dark:hover:border-blue-500/30 transition-all duration-300 overflow-hidden relative"
              >
                {/* Decoration Gradient */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${riskStyle.bg.replace('bg-', 'bg-gradient-to-b from-transparent via-').replace('50', '400')} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                    {/* 1. Customer Identity */}
                    <div className="lg:w-1/4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-400 font-bold text-xl shrink-0">
                          {action.customerName ? action.customerName.charAt(0) : <User className="w-6 h-6" />}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                            {`Cliente ${action.customerName && action.customerName !== 'Unknown' ? action.customerName : action.customerId}`}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-slate-400 font-medium tracking-wide mt-1">
                            ID: <span className="font-mono text-gray-400 dark:text-slate-500">{action.customerId}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${riskStyle.bg} ${riskStyle.text} border ${riskStyle.border} dark:bg-opacity-20`}>
                              {riskStyle.icon}
                              {action.risk || 'Unknown'} Risk
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 dark:text-slate-400">{action.ciudad}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Key Metrics Grid */}
                    <div className="lg:w-2/5 grid grid-cols-3 gap-4 border-l border-r border-gray-100 dark:border-slate-700 px-6 mx-2">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-slate-500 font-medium mb-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Ingresos
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                          ${action.monthlyRevenue?.toFixed(0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-slate-500 font-medium mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Antigüedad
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                          {action.tenure} <span className="text-xs font-normal text-gray-400 dark:text-gray-500">meses</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-slate-500 font-medium mb-1 flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Contrato
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                          {action.contractType || 'Mensual'}
                        </p>
                      </div>
                    </div>

                    {/* 3. AI Insights & Actions */}
                    <div className="lg:w-1/3 flex flex-col gap-3">

                      {/* Insight Box */}
                      <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-900/50 relative group/insight">
                        <div className="absolute top-2 right-2 opacity-0 group-hover/insight:opacity-100 transition-opacity">
                          <span className="text-[10px] font-bold text-blue-300 dark:text-blue-500 uppercase tracking-wider">RANK #{index + 1}</span>
                        </div>
                        <div className="flex gap-3">
                          <div className="mt-0.5">
                            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">Sugerencia AI</p>
                            <p className="text-sm text-gray-600 dark:text-slate-300 leading-snug">
                              {action.nextBestAction || 'Contactar para entender necesidades'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button className="flex-1 h-9 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-slate-400 transition-colors" title="Ver Detalles">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="flex-1 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                          <Phone className="w-4 h-4" />
                          Llamar
                        </button>
                        <button className="flex-1 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                          <Mail className="w-4 h-4" />
                          Email
                        </button>
                      </div>

                    </div>

                  </div>
                </div>

                {/* Priority Rank Badge */}
                <div className="absolute top-0 right-0 p-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-0.5">Rank</p>
                    <p className="text-2xl font-black text-gray-200 group-hover:text-blue-500/20 transition-colors">#{index + 1}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
