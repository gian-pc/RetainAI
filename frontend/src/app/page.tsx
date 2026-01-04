"use client";

import { useState, useEffect } from 'react';
// Asegúrate de que src/types/customer.ts tenga: id, pais, ciudad, segmento, abandonado
import { Customer } from '@/types/customer';

// 1. Tipo de datos para la respuesta de la IA (Python)
interface PredictionResult {
  risk: 'High' | 'Medium' | 'Low';
  probability: number;
}

// 2. Tipo de datos para las Estadísticas (Java DashboardStatsController)
interface DashboardStats {
  totalCustomers: number;
  churnRate: number;
  totalRevenue: number; // Ingresos (MRR)
  churnRevenue: number; // Pérdidas
}

export default function Home() {
  // --- ESTADOS ---
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para la IA
  const [predictions, setPredictions] = useState<Record<string, PredictionResult>>({});
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());

  // --- CARGA INICIAL DE DATOS (Paralela) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lanzamos ambas peticiones al mismo tiempo para que sea más rápido
        const [customersRes, statsRes] = await Promise.all([
            fetch('http://localhost:8080/api/customers'),
            fetch('http://localhost:8080/api/dashboard/stats')
        ]);

        if (!customersRes.ok || !statsRes.ok) throw new Error('Error conectando con Java');

        const customersData = await customersRes.json();
        const statsData = await statsRes.json();

        console.log("📦 Clientes:", customersData);
        console.log("📊 Estadísticas:", statsData);

        // 1. Procesar Clientes (Manejando paginación de Spring Boot)
        if (Array.isArray(customersData)) {
            setCustomers(customersData);
        } else if (customersData.content && Array.isArray(customersData.content)) {
            setCustomers(customersData.content);
        } else {
            setCustomers([]);
        }

        // 2. Procesar Estadísticas
        setStats(statsData);

      } catch (err) {
        console.error(err);
        setError('No se pudo conectar con el Backend. Revisa que Java esté corriendo en puerto 8080.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- FUNCIÓN PARA LLAMAR A LA IA ---
  const handlePredict = async (customerId: string) => {
    setAnalyzingIds(prev => new Set(prev).add(customerId));
    try {
      const response = await fetch(`http://localhost:8080/api/customers/${customerId}/predict`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Error IA');
      
      const result: PredictionResult = await response.json();
      setPredictions(prev => ({ ...prev, [customerId]: result }));

    } catch (error) {
      console.error(error);
      alert("Error al consultar la IA");
    } finally {
      setAnalyzingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(customerId);
        return newSet;
      });
    }
  };

  // Helper para colores del badge de riesgo
  const getRiskBadgeColor = (risk: string) => {
    switch(risk) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-slate-800">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">RetainAI Dashboard</h1>
        <p className="text-slate-500">Predicción de fuga de clientes en tiempo real</p>
      </header>

      {loading && (
        <div className="flex justify-center p-20">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}
      
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {!loading && !error && (
        <>
            {/* --- SECCIÓN DE TARJETAS (KPIs) --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                
                {/* KPI 1: Total Clientes */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Clientes</p>
                    <p className="text-3xl font-extrabold text-slate-800 mt-2">
                        {stats?.totalCustomers?.toLocaleString() || 0}
                    </p>
                    <div className="mt-2 text-xs text-slate-400">Base de datos MySQL</div>
                </div>

                {/* KPI 2: Tasa de Fuga */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tasa de Fuga (Churn)</p>
                    <div className="flex items-end gap-2 mt-2">
                        <p className={`text-3xl font-extrabold ${stats?.churnRate && stats.churnRate > 15 ? 'text-red-600' : 'text-green-600'}`}>
                            {stats?.churnRate?.toFixed(1) || 0}%
                        </p>
                        <span className="text-xs text-slate-400 mb-1">del total</span>
                    </div>
                </div>

                {/* KPI 3: Ingresos (Total Revenue) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingresos (MRR)</p>
                    <p className="text-3xl font-extrabold text-green-700 mt-2">
                        ${stats?.totalRevenue?.toLocaleString() || "0"}
                    </p>
                    <p className="text-xs text-green-600 mt-1">Recurrentes Mensuales</p>
                </div>

                {/* KPI 4: Pérdidas (Churn Revenue) */}
                <div className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-100">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Pérdida Mensual</p>
                    <p className="text-3xl font-extrabold text-red-700 mt-2">
                        -${stats?.churnRevenue?.toLocaleString() || 0}
                    </p>
                    {/* Cálculo aproximado de clientes perdidos para dar contexto */}
                    <p className="text-xs text-red-500 mt-1">
                        Impacto económico por fugas
                    </p>
                </div>
            </div>

            {/* --- SECCIÓN DE TABLA --- */}
            <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">ID</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Ubicación</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Segmento</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Estado Actual</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">Motor IA</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {customers.map((c) => {
                    const prediction = predictions[c.id];
                    const isAnalyzing = analyzingIds.has(c.id);

                    return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-sm font-mono text-slate-600">{c.id}</td>
                        
                        {/* Ubicación: Ciudad y País */}
                        <td className="p-4 text-sm text-slate-700">
                            <div className="font-medium">{c.ciudad}</div>
                            <div className="text-xs text-slate-400 uppercase">{c.pais}</div>
                        </td>

                        {/* Segmento */}
                        <td className="p-4">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">
                                {c.segmento}
                            </span>
                        </td>

                        {/* Estado: Activo vs Inactivo (Base de Datos) */}
                        <td className="p-4">
                            {c.abandonado ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100">
                                    🔴 Ya se fue
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                                    🟢 Activo
                                </span>
                            )}
                        </td>

                        {/* Motor IA: Predicción de Futuro */}
                        <td className="p-4 text-center">
                        {prediction ? (
                            <div className={`inline-flex flex-col items-center px-3 py-1 rounded-lg border ${getRiskBadgeColor(prediction.risk)}`}>
                                <span className="font-bold text-sm">Riesgo {prediction.risk}</span>
                                <span className="text-xs opacity-80">{(prediction.probability * 100).toFixed(0)}% Prob.</span>
                            </div>
                        ) : (
                            <button 
                            onClick={() => handlePredict(c.id)}
                            disabled={isAnalyzing}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm
                                ${isAnalyzing 
                                ? 'bg-gray-100 text-gray-400 cursor-wait' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md active:transform active:scale-95'}
                            `}
                            >
                            {isAnalyzing ? "Pensando..." : "🔮 Predecir"}
                            </button>
                        )}
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
            <div className="p-4 text-center text-xs text-gray-400 border-t">
                Mostrando {customers.length} registros
            </div>
            </div>
        </>
      )}
    </div>
  );
}