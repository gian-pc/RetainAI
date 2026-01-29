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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Ingresos en Riesgo</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">
                            {formatCurrency(revenueAtRisk)}
                        </p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-lg">
                        <span className="text-2xl">💰</span>
                    </div>
                </div>
            </div>

            {/* KPI 2: Churn Rate */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Tasa de Cancelación</p>
                        <p className="text-2xl font-bold text-orange-600 mt-1">
                            {formatPercentage(churnRate)}
                        </p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-lg">
                        <span className="text-2xl">📉</span>
                    </div>
                </div>
            </div>

            {/* KPI 3: Customers at Risk */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Clientes en Riesgo</p>
                        <p className="text-2xl font-bold text-yellow-600 mt-1">
                            {customersAtRisk.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-lg">
                        <span className="text-2xl">⚠️</span>
                    </div>
                </div>
            </div>

            {/* KPI 4: Avg NPS Score */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Satisfacción Promedio</p>
                        <p className={`text-2xl font-bold mt-1 ${avgNps >= 50 ? 'text-green-600' : 'text-gray-600'}`}>
                            {avgNps.toFixed(0)}
                        </p>
                    </div>
                    <div className={`${avgNps >= 50 ? 'bg-green-100' : 'bg-gray-100'} p-3 rounded-lg`}>
                        <span className="text-2xl">⭐</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
