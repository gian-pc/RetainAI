"use client";

import { useState, useEffect } from 'react';
import { Customer } from '@/types/customer';
import ChurnMap from '@/components/ChurnMap';
import Sidebar from '@/components/Sidebar';

interface PredictionResult {
  risk: 'High' | 'Medium' | 'Low';
  probability: number;
}

interface DashboardStats {
  totalCustomers: number;
  churnRate: number;
  totalRevenue: number;
  churnRevenue: number;
}

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [predictions, setPredictions] = useState<Record<string, PredictionResult>>({});
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, statsRes] = await Promise.all([
            fetch('http://localhost:8080/api/customers'),
            fetch('http://localhost:8080/api/dashboard/stats')
        ]);

        if (!customersRes.ok || !statsRes.ok) throw new Error('Error conectando con Java');

        const customersData = await customersRes.json();
        const statsData = await statsRes.json();

        if (Array.isArray(customersData)) {
            setCustomers(customersData);
        } else if (customersData.content && Array.isArray(customersData.content)) {
            setCustomers(customersData.content);
        } else {
            setCustomers([]);
        }

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

  const getRiskBadgeColor = (risk: string) => {
    switch(risk) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-slate-800">
      
      {/* SIDEBAR FIJO */}
      <Sidebar />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 ml-64 p-6"> {/* Reducido padding global de p-8 a p-6 */}
        
        {/* ENCABEZADO COMPACTO */}
        <header className="mb-4 flex justify-between items-center"> {/* Reducido de mb-8 a mb-4 */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">RetainAI Dashboard</h1>
                <p className="text-sm text-slate-500">Predicción de fuga geoespacial</p>
            </div>
            <div className="text-right">
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-indigo-200">v1.0.0 Hackathon</span>
            </div>
        </header>

        {loading && (
            <div className="flex justify-center p-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        )}
        
        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {!loading && !error && (
            <>
                {/* 1. SECCIÓN DE TARJETAS (KPIs) - VERSIÓN COMPACTA */}
                {/* Reducido gap-6 a gap-4 y mb-8 a mb-5 para subir el mapa */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                    
                    {/* Card 1 */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-24">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Clientes</p>
                        <div className="flex justify-between items-end">
                            <p className="text-2xl font-extrabold text-slate-800">
                                {stats?.totalCustomers?.toLocaleString() || 0}
                            </p>
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded">MySQL</span>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-24">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasa de Fuga</p>
                        <div className="flex justify-between items-end">
                            <p className={`text-2xl font-extrabold ${stats?.churnRate && stats.churnRate > 15 ? 'text-red-600' : 'text-green-600'}`}>
                                {stats?.churnRate?.toFixed(1) || 0}%
                            </p>
                            <span className={`text-[10px] px-1.5 rounded ${stats?.churnRate && stats.churnRate > 15 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                                {stats?.churnRate && stats.churnRate > 15 ? 'Crítico' : 'Estable'}
                            </span>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-24">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ingresos (MRR)</p>
                        <div className="flex justify-between items-end">
                             <p className="text-2xl font-extrabold text-green-700">
                                ${stats?.totalRevenue?.toLocaleString() || "0"}
                            </p>
                            <span className="text-[10px] text-green-600 bg-green-50 px-1.5 rounded">Mensual</span>
                        </div>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-100 flex flex-col justify-between h-24">
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Pérdida Potencial</p>
                        <div className="flex justify-between items-end">
                             <p className="text-2xl font-extrabold text-red-700">
                                -${stats?.churnRevenue?.toLocaleString() || 0}
                            </p>
                            <span className="text-[10px] text-red-500 bg-red-100 px-1.5 rounded">Riesgo</span>
                        </div>
                    </div>
                </div>

                {/* 👇 2. SECCIÓN DE MAPA (FACTOR WOW) */}
                {/* El mapa ahora estará mucho más arriba */}
                <div className="mb-6 bg-slate-900 rounded-xl p-1 shadow-lg border border-slate-800">
                    <ChurnMap />
                </div>

                {/* 3. SECCIÓN DE TABLA */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100 mb-8">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 text-sm">Listado de Clientes</h3>
                        <span className="text-xs text-slate-400">Últimos registros</span>
                    </div>
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-3 text-[10px] font-semibold text-slate-500 uppercase">ID</th>
                            <th className="p-3 text-[10px] font-semibold text-slate-500 uppercase">Ubicación</th>
                            <th className="p-3 text-[10px] font-semibold text-slate-500 uppercase">Segmento</th>
                            <th className="p-3 text-[10px] font-semibold text-slate-500 uppercase">Estado</th>
                            <th className="p-3 text-[10px] font-semibold text-slate-500 uppercase text-center">IA Predictiva</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {customers.slice(0, 8).map((c) => { // Reducido a 8 filas para que no sea eterno el scroll
                            const prediction = predictions[c.id];
                            const isAnalyzing = analyzingIds.has(c.id);

                            return (
                            <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 text-xs font-mono text-slate-600">{c.id}</td>
                                <td className="p-3 text-xs text-slate-700">
                                    <span className="font-medium">{c.ciudad}</span>, <span className="text-slate-400">{c.pais}</span>
                                </td>
                                <td className="p-3">
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium border border-blue-100">
                                        {c.segmento}
                                    </span>
                                </td>
                                <td className="p-3">
                                    {c.abandonado ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-[10px] font-bold border border-red-100">
                                            🔴 Off
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold border border-green-100">
                                            🟢 On
                                        </span>
                                    )}
                                </td>
                                <td className="p-3 text-center">
                                {prediction ? (
                                    <div className={`inline-flex flex-col items-center px-2 py-0.5 rounded border ${getRiskBadgeColor(prediction.risk)}`}>
                                        <span className="font-bold text-[10px]">{prediction.risk}</span>
                                        <span className="text-[9px] opacity-80">{(prediction.probability * 100).toFixed(0)}%</span>
                                    </div>
                                ) : (
                                    <button 
                                    onClick={() => handlePredict(c.id)}
                                    disabled={isAnalyzing}
                                    className={`
                                        px-3 py-1 rounded text-[10px] font-medium transition-all shadow-sm
                                        ${isAnalyzing 
                                        ? 'bg-gray-100 text-gray-400 cursor-wait' 
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md active:transform active:scale-95'}
                                    `}
                                    >
                                    {isAnalyzing ? "..." : "🔮 IA"}
                                    </button>
                                )}
                                </td>
                            </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </>
        )}
      </main>
    </div>
  );
}