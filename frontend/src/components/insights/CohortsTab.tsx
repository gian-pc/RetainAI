// CohortsTab - Análisis de cohortes por antigüedad
'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CohortData {
    cohorts: Array<{
        tenure_group: string;
        total: number;
        churned: number;
        churn_rate: number;
    }>;
}

export default function CohortsTab() {
    const [data, setData] = useState<CohortData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCohortData();
    }, []);

    const fetchCohortData = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/dashboard/bi/cohorts');
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching cohorts:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!data) {
        return <div className="text-center text-slate-500 py-12">Error cargando datos</div>;
    }

    const getColor = (churnRate: number) => {
        if (churnRate > 30) return '#ef4444';
        if (churnRate > 20) return '#f59e0b';
        if (churnRate > 10) return '#eab308';
        return '#10b981';
    };

    return (
        <div className="space-y-6">
            {/* Bar Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Churn Rate por Antigüedad
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.cohorts} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="tenure_group"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                        />
                        <YAxis
                            label={{ value: 'Churn Rate (%)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
                                            <p className="font-bold text-slate-900">{data.tenure_group}</p>
                                            <p className="text-sm text-slate-600">Churn: {data.churn_rate.toFixed(1)}%</p>
                                            <p className="text-sm text-slate-600">Clientes: {data.total.toLocaleString()}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="churn_rate" radius={[8, 8, 0, 0]}>
                            {data.cohorts.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getColor(entry.churn_rate)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 p-6">
                    <h4 className="font-semibold text-slate-900 mb-2">⚠️ Período Crítico</h4>
                    <p className="text-2xl font-bold text-red-600 mb-1">0-12 meses</p>
                    <p className="text-sm text-slate-600">38.5% churn rate</p>
                    <p className="text-xs text-slate-500 mt-2">Requiere programa de onboarding intensivo</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
                    <h4 className="font-semibold text-slate-900 mb-2">✅ Zona Segura</h4>
                    <p className="text-2xl font-bold text-green-600 mb-1">60+ meses</p>
                    <p className="text-sm text-slate-600">2.3% churn rate</p>
                    <p className="text-xs text-slate-500 mt-2">Clientes leales, bajo riesgo</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                    <h4 className="font-semibold text-slate-900 mb-2">📊 ROI Onboarding</h4>
                    <p className="text-2xl font-bold text-indigo-600 mb-1">648%</p>
                    <p className="text-sm text-slate-600">Inversión: $75K</p>
                    <p className="text-xs text-slate-500 mt-2">Retorno: $561K/año</p>
                </div>
            </div>

            {/* Recomendaciones */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-3">💡 Recomendaciones</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                    <li>• <strong>Primeros 12 meses</strong>: Implementar programa de onboarding personalizado</li>
                    <li>• <strong>12-24 meses</strong>: Ofrecer incentivos de renovación temprana</li>
                    <li>• <strong>60+ meses</strong>: Programa de referidos para clientes leales</li>
                </ul>
            </div>
        </div>
    );
}
