// Geographic - Vista geoespacial de churn en NYC
'use client';

import Sidebar from '@/components/Sidebar';
import dynamic from 'next/dynamic';
import { Map } from 'lucide-react';

// Lazy loading del mapa
const ChurnMap = dynamic(() => import('@/components/ChurnMap'), {
    loading: () => (
        <div className="h-[600px] w-full bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-xl">
            <div className="text-indigo-600 font-semibold text-sm animate-pulse">Cargando mapa...</div>
        </div>
    ),
    ssr: false
});

export default function GeographicPage() {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Geographic Analysis</h1>
                    <p className="text-base text-slate-600">
                        Análisis geográfico de churn en New York City
                    </p>
                </header>

                {/* Mapa */}
                <div className="mb-8">
                    <ChurnMap />
                </div>

                {/* Borough Stats - Placeholder */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">📍 Análisis por Borough</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-xl border border-red-200">
                            <h3 className="font-semibold text-slate-900 mb-1">Manhattan</h3>
                            <p className="text-2xl font-bold text-red-600">18.2%</p>
                            <p className="text-sm text-slate-600">1,985 customers</p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200">
                            <h3 className="font-semibold text-slate-900 mb-1">Bronx</h3>
                            <p className="text-2xl font-bold text-orange-600">16.9%</p>
                            <p className="text-sm text-slate-600">1,850 customers</p>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-50 to-green-50 p-4 rounded-xl border border-yellow-200">
                            <h3 className="font-semibold text-slate-900 mb-1">Brooklyn</h3>
                            <p className="text-2xl font-bold text-yellow-600">15.5%</p>
                            <p className="text-sm text-slate-600">2,100 customers</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                            <h3 className="font-semibold text-slate-900 mb-1">Queens</h3>
                            <p className="text-2xl font-bold text-green-600">14.2%</p>
                            <p className="text-sm text-slate-600">1,950 customers</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                            <h3 className="font-semibold text-slate-900 mb-1">Staten Island</h3>
                            <p className="text-2xl font-bold text-blue-600">13.8%</p>
                            <p className="text-sm text-slate-600">816 customers</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
