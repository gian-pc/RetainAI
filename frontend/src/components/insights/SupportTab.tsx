// SupportTab - Análisis de tickets de soporte
'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SupportData {
    support_analysis: Array<{
        ticketRange: string;
        customers: number;
        churnRate: number;
    }>;
}

export default function SupportTab() {
    const [data, setData] = useState<SupportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSupportData();
    }, []);

    const fetchSupportData = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/dashboard/bi/support');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Support API response:', result);

            // Validar estructura de datos
            if (result && Array.isArray(result.support_analysis) && result.support_analysis.length > 0) {
                setData(result);
            } else {
                console.error('Invalid data structure:', result);
                setData(null);
            }
        } catch (error) {
            console.error('Error fetching support:', error);
            setData(null);
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
        if (churnRate > 60) return '#7f1d1d';
        if (churnRate > 40) return '#ef4444';
        if (churnRate > 20) return '#f59e0b';
        if (churnRate > 10) return '#eab308';
        return '#10b981';
    };

    return (
        <div className="space-y-6">
            {/* Bar Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Churn Rate por Tickets de Soporte
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.support_analysis} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="ticketRange" />
                        <YAxis label={{ value: 'Churn Rate (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
                                            <p className="font-bold text-slate-900">{data.ticketRange} tickets</p>
                                            <p className="text-sm text-slate-600">Churn: {data.churnRate.toFixed(1)}%</p>
                                            <p className="text-sm text-slate-600">Clientes: {data.customers.toLocaleString()}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="churnRate" radius={[8, 8, 0, 0]}>
                            {data.support_analysis.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getColor(entry.churnRate)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Critical Alert */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border-2 border-red-300 p-6">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-2xl">⚠️</span>
                        </div>
                    </div>
                    <div className="ml-4 flex-1">
                        <h3 className="text-lg font-bold text-red-900 mb-2">Alerta Crítica: 6+ Tickets</h3>
                        <p className="text-red-800 mb-3">
                            <strong>1,434 clientes</strong> con 6 o más tickets tienen <strong>77.7% de probabilidad de churn</strong>
                        </p>
                        <div className="bg-white rounded-lg p-4 border border-red-200">
                            <p className="text-sm font-semibold text-slate-900 mb-2">Acción Inmediata Requerida:</p>
                            <ul className="text-sm text-slate-700 space-y-1">
                                <li>✓ Asignar Account Manager dedicado</li>
                                <li>✓ Llamada de seguimiento en 24h</li>
                                <li>✓ Descuento del 20% por 3 meses</li>
                                <li>✓ Upgrade gratis a plan superior</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROI Insight */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-3">💰 ROI: Programa de Soporte Proactivo</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <p className="text-sm text-slate-600">Inversión</p>
                        <p className="text-xl font-bold text-indigo-600">$120K/año</p>
                        <p className="text-xs text-slate-500">2 Account Managers</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600">Retorno Anual</p>
                        <p className="text-xl font-bold text-green-600">$535K</p>
                        <p className="text-xs text-slate-500">Retención de 1,434 clientes</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600">ROI</p>
                        <p className="text-xl font-bold text-purple-600">346%</p>
                        <p className="text-xs text-slate-500">Payback: 3.3 meses</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
