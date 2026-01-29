import { DollarSign, TrendingDown, AlertTriangle, Star } from 'lucide-react';

interface KPICardsProps {
    revenueAtRisk: number;
    churnRate: number;
    customersAtRisk: number;
    avgNps: number;
}

export default function KPICards({ revenueAtRisk, churnRate, customersAtRisk, avgNps }: KPICardsProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`;
    };

    return (
        <div className="flex-none grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* KPI 1: Revenue at Risk */}
            <div
                className="group backdrop-blur-sm rounded-xl shadow-sm border p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)'
                }}
            >
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <p className="text-xs font-medium tracking-wide transition-colors" style={{ color: 'var(--text-secondary)' }}>Ingresos en Riesgo</p>
                        <p className="text-xl font-bold mt-0.5 transition-colors" style={{ color: 'var(--text-primary)' }}>
                            {formatCurrency(revenueAtRisk)}
                        </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-sm shadow-red-200 dark:shadow-none group-hover:scale-105 transition-transform duration-300">
                        <DollarSign className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* KPI 2: Churn Rate */}
            <div
                className="group backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden p-4"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                    borderWidth: '1px'
                }}
            >
                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <p className="text-xs font-medium tracking-wide transition-colors" style={{ color: 'var(--text-secondary)' }}>Tasa de Cancelación</p>
                        <p className="text-xl font-bold mt-0.5 transition-colors" style={{ color: 'var(--text-primary)' }}>
                            {formatPercentage(churnRate)}
                        </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-sm shadow-orange-200 dark:shadow-none group-hover:scale-105 transition-transform duration-300">
                        <TrendingDown className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* KPI 3: Customers at Risk */}
            <div
                className="group backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden p-4"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                    borderWidth: '1px'
                }}
            >
                <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-50 dark:bg-yellow-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <p className="text-xs font-medium tracking-wide transition-colors" style={{ color: 'var(--text-secondary)' }}>Clientes en Riesgo</p>
                        <p className="text-xl font-bold mt-0.5 transition-colors" style={{ color: 'var(--text-primary)' }}>
                            {customersAtRisk.toLocaleString()}
                        </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white shadow-sm shadow-yellow-200 dark:shadow-none group-hover:scale-105 transition-transform duration-300">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* KPI 4: Avg NPS Score */}
            <div
                className="group backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden p-4"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                    borderWidth: '1px'
                }}
            >
                <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 ${avgNps >= 50 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-gray-800/20'}`}></div>
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <p className="text-xs font-medium tracking-wide transition-colors" style={{ color: 'var(--text-secondary)' }}>Satisfacción Promedio</p>
                        <p className="text-xl font-bold mt-0.5 transition-colors" style={{ color: 'var(--text-primary)' }}>
                            {avgNps.toFixed(0)}
                        </p>
                    </div>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-300 ${avgNps >= 50 ? 'from-emerald-500 to-green-600 shadow-emerald-200 dark:shadow-none' : 'from-gray-500 to-gray-600 shadow-gray-200 dark:shadow-none'}`}>
                        <Star className="w-5 h-5 fill-current" />
                    </div>
                </div>
            </div>
        </div >
    );
}
