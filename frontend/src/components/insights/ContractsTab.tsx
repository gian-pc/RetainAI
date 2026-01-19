// ContractsTab - Análisis de contratos mensuales vs anuales
'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ContractData {
    contracts: Array<{
        contractType: string;
        customers: number;
        churnRate: number;
        avgRevenue: number;
    }>;
}

export default function ContractsTab() {
    const [data, setData] = useState<ContractData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContractData();
    }, []);

    const fetchContractData = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/dashboard/bi/contracts');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Contracts API response:', result);

            // Validar estructura de datos
            if (result && Array.isArray(result.contracts) && result.contracts.length > 0) {
                setData(result);
            } else {
                console.error('Invalid data structure:', result);
                setData(null);
            }
        } catch (error) {
            console.error('Error fetching contracts:', error);
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

    if (!data || !data.contracts || data.contracts.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500 mb-4">Error cargando datos de contratos</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Comparison Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Comparación de Contratos
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.contracts} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="contractType" />
                        <YAxis yAxisId="left" label={{ value: 'Churn Rate (%)', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Clientes', angle: 90, position: 'insideRight' }} />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="churnRate" fill="#ef4444" name="Churn Rate (%)" radius={[8, 8, 0, 0]} />
                        <Bar yAxisId="right" dataKey="customers" fill="#6366f1" name="Clientes" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.contracts.map((contract, idx) => (
                    <div
                        key={idx}
                        className={`rounded-2xl border p-6 ${contract.contractType === 'Mensual'
                            ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
                            : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                            }`}
                    >
                        <h4 className="text-xl font-bold text-slate-900 mb-4">
                            {contract.contractType === 'Mensual' ? '📅' : '📆'} {contract.contractType}
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-slate-600">Clientes</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {contract.customers.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Churn Rate</p>
                                <p className={`text-2xl font-bold ${contract.churnRate > 20 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                    {contract.churnRate.toFixed(1)}%
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Revenue Promedio</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    ${contract.avgRevenue.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ROI Insight */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-3">💰 ROI: Conversión a Contratos Anuales</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <p className="text-sm text-slate-600">Inversión</p>
                        <p className="text-xl font-bold text-indigo-600">$50K</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600">Retorno Anual</p>
                        <p className="text-xl font-bold text-green-600">$600K</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600">ROI</p>
                        <p className="text-xl font-bold text-purple-600">1,100%</p>
                    </div>
                </div>
                <p className="text-sm text-slate-700">
                    <strong>Estrategia</strong>: Ofrecer descuento del 15% en contratos anuales + 3 meses gratis de servicios premium
                </p>
            </div>
        </div>
    );
}
