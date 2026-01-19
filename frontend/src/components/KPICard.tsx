// KPI Card Component - Muestra métricas clave con trend
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    trend?: {
        value: number;
        direction: 'up' | 'down';
    };
    icon: React.ReactNode;
    breakdown?: { label: string; value: string }[];
    onViewMore?: () => void;
    riskLevel?: 'critical' | 'high' | 'medium' | 'low';
}

export default function KPICard({
    title,
    value,
    trend,
    icon,
    breakdown,
    onViewMore,
    riskLevel = 'low'
}: KPICardProps) {
    const riskColors = {
        critical: 'border-red-500 bg-red-50',
        high: 'border-orange-500 bg-orange-50',
        medium: 'border-yellow-500 bg-yellow-50',
        low: 'border-green-500 bg-green-50'
    };

    const trendColors = {
        up: trend?.direction === 'up' ? 'text-red-600' : 'text-green-600',
        down: trend?.direction === 'down' ? 'text-green-600' : 'text-red-600'
    };

    return (
        <div className={`rounded-lg border-2 ${riskColors[riskLevel]} p-6 shadow-sm hover:shadow-md transition-shadow`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                <div className="text-gray-400">{icon}</div>
            </div>

            {/* Main Value */}
            <div className="mb-4">
                <p className="text-4xl font-bold text-gray-900">{value}</p>

                {/* Trend */}
                {trend && (
                    <div className={`flex items-center mt-2 text-sm ${trendColors[trend.direction]}`}>
                        {trend.direction === 'up' ? (
                            <ArrowUp className="w-4 h-4 mr-1" />
                        ) : (
                            <ArrowDown className="w-4 h-4 mr-1" />
                        )}
                        <span className="font-medium">{Math.abs(trend.value)}%</span>
                        <span className="text-gray-500 ml-1">vs mes anterior</span>
                    </div>
                )}
            </div>

            {/* Breakdown */}
            {breakdown && breakdown.length > 0 && (
                <div className="space-y-2 mb-4 pt-4 border-t border-gray-200">
                    {breakdown.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{item.label}:</span>
                            <span className="font-semibold text-gray-900 tabular-nums">{item.value}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* View More Button */}
            {onViewMore && (
                <button
                    onClick={onViewMore}
                    className="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors flex items-center justify-center"
                >
                    Ver detalles
                    <TrendingUp className="w-4 h-4 ml-2" />
                </button>
            )}
        </div>
    );
}
