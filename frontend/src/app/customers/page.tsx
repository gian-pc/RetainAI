"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Users as UsersIcon } from 'lucide-react';

interface Customer {
    customerId: string;
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

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [riskFilter, setRiskFilter] = useState('ALL');
    const [segmentFilter, setSegmentFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [customers, searchTerm, riskFilter, segmentFilter]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);

            // ⚡ Timeout de 45 segundos - El backend llama ML para cada cliente
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 45000);

            const response = await fetch('http://localhost:8080/api/insights/priority?limit=50', {
                signal: controller.signal
            });
            clearTimeout(timeout);

            const data = await response.json();
            setCustomers(data || []); // ✅ Garantizar que siempre sea array
        } catch (error) {
            console.error('Error fetching customers:', error);
            // Si hay timeout o error, usar array vacío en lugar de bloquear
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...customers];

        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.ciudad.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (riskFilter !== 'ALL') {
            filtered = filtered.filter(c => c.risk === riskFilter);
        }

        if (segmentFilter !== 'ALL') {
            filtered = filtered.filter(c => c.segmento === segmentFilter);
        }

        setFilteredCustomers(filtered);
        setCurrentPage(1);
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'High': return 'bg-red-100 text-red-700 border-red-200';
            case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const exportToCSV = () => {
        const csv = [
            'Customer ID,Ciudad,Segmento,Risk,Probability,Main Factor,Monthly Revenue,Tenure',
            ...filteredCustomers.map(c =>
                `${c.customerId},${c.ciudad},${c.segmento},${c.risk},${c.probability},${c.mainFactor},${c.monthlyRevenue},${c.tenure}`
            )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customers_export.csv';
        a.click();
    };

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

    const totalCustomers = customers.length;
    const highRiskCount = customers.filter(c => c.risk === 'High').length;
    const mediumRiskCount = customers.filter(c => c.risk === 'Medium').length;
    const avgProbability = customers.length > 0
        ? (customers.reduce((sum, c) => sum + c.probability, 0) / customers.length * 100).toFixed(1)
        : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando clientes...</p>
                </div>
            </div>
        );
    }

    // ✅ Manejar caso de array vacío
    const hasCustomers = customers.length > 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">👥 Customers</h1>
                    <p className="text-base text-slate-600">
                        Gestión y análisis de clientes con predicciones de churn
                    </p>
                </header>

                {!loading && !hasCustomers ? (
                    // Estado vacío mejorado
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Todo bajo control!</h3>
                        <p className="text-slate-600 mb-6">
                            No hay clientes de alto riesgo en este momento. Todos los clientes están estables.
                        </p>
                        <button
                            onClick={fetchCustomers}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Actualizar
                        </button>
                    </div>
                ) : (
                    <>
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-slate-600">Total Clientes</p>
                            <UsersIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{totalCustomers}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-slate-600">Alto Riesgo</p>
                            <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        </div>
                        <p className="text-3xl font-bold text-red-600">{highRiskCount}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-slate-600">Riesgo Medio</p>
                            <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                        </div>
                        <p className="text-3xl font-bold text-amber-600">{mediumRiskCount}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-slate-600">Prob. Promedio</p>
                            <Filter className="h-5 w-5 text-slate-400" />
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{avgProbability}%</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex gap-4 items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por ID o ciudad..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <select
                            value={riskFilter}
                            onChange={(e) => setRiskFilter(e.target.value)}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="ALL">Todos los riesgos</option>
                            <option value="High">Alto riesgo</option>
                            <option value="Medium">Riesgo medio</option>
                            <option value="Low">Bajo riesgo</option>
                        </select>

                        <select
                            value={segmentFilter}
                            onChange={(e) => setSegmentFilter(e.target.value)}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="ALL">Todos los segmentos</option>
                            <option value="Residencial">Residencial</option>
                            <option value="PYME">PYME</option>
                            <option value="Corporativo">Corporativo</option>
                        </select>

                        <button
                            onClick={fetchCustomers}
                            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                            title="Refrescar"
                        >
                            <RefreshCw className="h-5 w-5 text-slate-600" />
                        </button>

                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Exportar
                        </button>
                    </div>

                    <p className="text-sm text-slate-500 mt-3">
                        Mostrando {filteredCustomers.length} de {totalCustomers} clientes
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Customer ID</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Ciudad</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Segmento</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Risk</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Probabilidad</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Factor Principal</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Revenue</th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Antigüedad</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {currentCustomers.map((customer) => (
                                    <tr
                                        key={customer.customerId}
                                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                                        onClick={() => window.location.href = `/customers/${customer.customerId}`}
                                    >
                                        <td className="py-4 px-6 text-sm font-mono text-slate-900">
                                            {customer.customerId}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-700">
                                            {customer.ciudad}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                                {customer.segmento}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${getRiskColor(customer.risk)}`}>
                                                {customer.risk}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-semibold text-slate-900">
                                            {(customer.probability * 100).toFixed(1)}%
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600 max-w-xs truncate">
                                            {customer.mainFactor}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-700">
                                            ${customer.monthlyRevenue.toFixed(0)}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-700">
                                            {customer.tenure} meses
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between">
                            <p className="text-sm text-slate-600">
                                Página {currentPage} de {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                    </>
                )}
            </main>
        </div>
    );
}
