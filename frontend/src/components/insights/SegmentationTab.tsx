// SegmentationTab - Análisis de segmentación de clientes
'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface SegmentData {
    segments: Array<{
        segment: string;
        customers: number;
        avgRevenue: number;
        churnRate: number;
        riskLevel: string;
        strategy: string;
    }>;
}

export default function SegmentationTab() {
    const [data, setData] = useState<SegmentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSegmentationData();
    }, []);

    const fetchSegmentationData = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/dashboard/bi/segmentation');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Segmentation API response:', result);

            if (result && Array.isArray(result.segments) && result.segments.length > 0) {
                setData(result);
            } else {
                console.error('Invalid data structure:', result);
                setData(null);
            }
        } catch (error) {
            console.error('Error fetching segmentation:', error);
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

    const getColor = (segment: string) => {
        switch (segment) {
            case 'BASIC': return '#ef4444';
            case 'MEDIUM': return '#f59e0b';
            case 'PREMIUM': return '#10b981';
            default: return '#6366f1';
        }
    };

    const getIcon = (segment: string) => {
        switch (segment) {
            case 'BASIC': return '🔴';
            case 'MEDIUM': return '🟠';
            case 'PREMIUM': return '🟢';
            default: return '⚪';
        }
    };

    // Preparar datos para el gráfico con nombres legibles
    const chartData = data.segments.map(seg => ({
        name: `${getIcon(seg.segment)} ${seg.segment}`,
        'Revenue Anual ($)': Math.round(seg.avgRevenue),
        'Churn Rate (%)': parseFloat(seg.churnRate.toFixed(1)),
        customers: seg.customers,
        segment: seg.segment
    }));

    return (
        <div className="space-y-6">
            {/* Bar Chart - Revenue vs Churn */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                    📊 Segmentación de Clientes: Revenue vs Churn
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                    Comparación de revenue anual promedio y tasa de churn por segmento
                </p>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis
                            yAxisId="left"
                            label={{ value: 'Revenue Anual ($)', angle: -90, position: 'insideLeft' }}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            label={{ value: 'Churn Rate (%)', angle: 90, position: 'insideRight' }}
                        />
                        <Tooltip
                            formatter={(value: any, name?: string) => {
                                if (name === 'Revenue Anual ($)') {
                                    return [`$${value.toLocaleString()}`, name];
                                }
                                return [`${value}%`, name || ''];
                            }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="Revenue Anual ($)" radius={[8, 8, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getColor(entry.segment)} />
                            ))}
                        </Bar>
                        <Bar yAxisId="right" dataKey="Churn Rate (%)" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Segment Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.segments.map((segment, idx) => (
                    <div
                        key={idx}
                        className={`rounded-2xl border p-6 ${segment.segment === 'BASIC'
                            ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
                            : segment.segment === 'MEDIUM'
                                ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
                                : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                            }`}
                    >
                        <h4 className="text-xl font-bold text-slate-900 mb-4">
                            {getIcon(segment.segment)} {segment.segment}
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-slate-600">Clientes</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {segment.customers.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Revenue Promedio</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    ${segment.avgRevenue.toFixed(0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Churn Rate</p>
                                <p className={`text-2xl font-bold ${segment.churnRate > 20 ? 'text-red-600' :
                                    segment.churnRate > 10 ? 'text-yellow-600' :
                                        'text-green-600'
                                    }`}>
                                    {segment.churnRate.toFixed(1)}%
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Nivel de Riesgo</p>
                                <p className={`text-lg font-bold ${segment.riskLevel === 'HIGH' ? 'text-red-600' :
                                    segment.riskLevel === 'MEDIUM' ? 'text-yellow-600' :
                                        'text-green-600'
                                    }`}>
                                    {segment.riskLevel}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Strategy Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.segments.map((segment, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-2xl border border-slate-200 p-6"
                    >
                        <h4 className="text-lg font-bold text-slate-900 mb-3">
                            💡 Estrategia {segment.segment}
                        </h4>
                        <p className="text-sm text-slate-700">
                            {segment.strategy}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
