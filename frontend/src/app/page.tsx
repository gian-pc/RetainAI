// Overview Dashboard - Página principal con KPIs ejecutivos y alertas críticas
'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import KPICard from '@/components/KPICard';
import PriorityInsights from '@/components/PriorityInsights';
import { DollarSign, TrendingDown, Users, Star } from 'lucide-react';

interface DashboardStats {
  revenueAtRisk: number;
  churnRate: number;
  customersAtRisk: number;
  npsScore: number;
  trends: {
    revenue: number;
    churn: number;
    customers: number;
    nps: number;
  };
}

interface CriticalAlert {
  type: string;
  title: string;
  description: string;
  count: number;
  severity: 'critical' | 'high' | 'medium';
  actionLabel: string;
  actionUrl: string;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    fetchCriticalAlerts();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Call Java backend which proxies to Python ML backend
      const response = await fetch('http://localhost:8080/api/dashboard/bi/stats');
      const data = await response.json();

      // Map Python snake_case to TypeScript camelCase
      setStats({
        revenueAtRisk: data.revenue_at_risk || 0,
        churnRate: data.churn_rate || 0,
        customersAtRisk: data.customers_at_risk || 0,
        npsScore: data.nps_score || 0,
        trends: {
          revenue: data.trends?.revenue || 0,
          churn: data.trends?.churn || 0,
          customers: data.trends?.customers || 0,
          nps: data.trends?.nps || 0
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Fallback to mock data
      setStats({
        revenueAtRisk: 1397215,
        churnRate: 16.0,
        customersAtRisk: 1992,
        npsScore: 45,
        trends: {
          revenue: -12,
          churn: 2,
          customers: 8,
          nps: -5
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCriticalAlerts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/dashboard/alerts');
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching critical alerts:', error);
      setAlerts([]);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <Sidebar />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </main>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <Sidebar />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-gray-500">Error cargando datos del dashboard</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <Sidebar />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Overview Dashboard</h1>
          <p className="text-base text-slate-600">
            Resumen ejecutivo de métricas clave de retención
          </p>
        </header>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="💰 Revenue en Riesgo"
            value={`$${(stats.revenueAtRisk / 1000000).toFixed(1)}M`}
            trend={{
              value: Math.abs(stats.trends.revenue),
              direction: stats.trends.revenue < 0 ? 'down' : 'up'
            }}
            icon={<DollarSign className="w-6 h-6" />}
            breakdown={[
              { label: 'Corporativo', value: '$450K' },
              { label: 'PYME', value: '$600K' },
              { label: 'Residencial', value: '$347K' }
            ]}
            riskLevel="critical"
            onViewMore={() => console.log('View revenue details')}
          />

          <KPICard
            title="📉 Churn Rate"
            value={`${stats.churnRate.toFixed(1)}%`}
            trend={{
              value: Math.abs(stats.trends.churn),
              direction: stats.trends.churn > 0 ? 'up' : 'down'
            }}
            icon={<TrendingDown className="w-6 h-6" />}
            breakdown={[
              { label: 'Mensual', value: '29.2%' },
              { label: 'Anual', value: '0.0%' }
            ]}
            riskLevel="high"
            onViewMore={() => console.log('View churn details')}
          />

          <KPICard
            title="👥 Clientes en Riesgo"
            value={stats.customersAtRisk.toLocaleString()}
            trend={{
              value: Math.abs(stats.trends.customers),
              direction: stats.trends.customers > 0 ? 'up' : 'down'
            }}
            icon={<Users className="w-6 h-6" />}
            breakdown={[
              { label: 'Crítico', value: '1,434' },
              { label: 'Alto', value: '558' }
            ]}
            riskLevel="critical"
            onViewMore={() => console.log('View customers')}
          />

          <KPICard
            title="📊 NPS Score"
            value={`${Math.round(stats.npsScore)}`}
            trend={{
              value: Math.abs(stats.trends.nps),
              direction: stats.trends.nps < 0 ? 'down' : 'up'
            }}
            icon={<Star className="w-6 h-6" />}
            breakdown={[
              { label: 'Detractores', value: '573' },
              { label: 'Promotores', value: '8,991' }
            ]}
            riskLevel="medium"
            onViewMore={() => console.log('View NPS details')}
          />
        </div>

        {/* Alertas Críticas */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">⚠️ Alertas Críticas</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">✅</div>
              <p>No hay alertas críticas en este momento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl ${alert.severity === 'critical'
                    ? 'bg-red-50 border border-red-200'
                    : alert.severity === 'high'
                      ? 'bg-orange-50 border border-orange-200'
                      : 'bg-yellow-50 border border-yellow-200'
                    }`}
                >
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${alert.severity === 'critical'
                      ? 'bg-red-500'
                      : alert.severity === 'high'
                        ? 'bg-orange-500'
                        : 'bg-yellow-500'
                      }`}></div>
                    <div>
                      <p className="font-medium text-slate-900">{alert.title}</p>
                      <p className="text-sm text-slate-600">{alert.description}</p>
                    </div>
                  </div>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${alert.severity === 'critical'
                      ? 'text-red-700 bg-red-100 hover:bg-red-200'
                      : alert.severity === 'high'
                        ? 'text-orange-700 bg-orange-100 hover:bg-orange-200'
                        : 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
                      }`}
                  >
                    {alert.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Priority Insights */}
        <div className="mb-8">
          <PriorityInsights />
        </div>
      </main>
    </div>
  );
}
