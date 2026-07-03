import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Package, Truck, MapPin } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { DashboardLayout } from '../../components/DashboardLayout';
import { analyticsApi } from '../../lib/api';
import type { AnalyticsData } from '../../lib/api';
import { cn } from '../../lib/utils';

const CHART_COLORS = ['#C8A951', '#060f24', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  VALIDATED: '#3b82f6',
  REFUSED: '#ef4444',
  IN_TRANSIT: '#6366f1',
  DELIVERED: '#10b981',
};

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    analyticsApi.get()
      .then(setData)
      .catch(() => setError('Erreur lors du chargement des analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-slate-400">Chargement des analytics…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error || 'Données indisponibles'}</p>
        </div>
      </DashboardLayout>
    );
  }

  const { overview, statusDistribution, monthlyShipments, revenue, transportDistribution, topRoutes, materialDistribution } = data;

  const statCards = [
    { label: 'Total colis', value: overview.totalParcels, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'En transit', value: overview.inTransit, icon: Truck, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Livrés', value: overview.delivered, icon: MapPin, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Taux livraison', value: `${overview.deliveryRate}%`, icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
    { label: 'Revenu total', value: `${overview.totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €`, icon: BarChart3, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Revenu ce mois', value: `${overview.currentMonthRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €`, icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 sm:gap-3">
            <BarChart3 className="w-6 h-6 text-yellow-500" />
            Analytics & Rapports
          </h1>
          <p className="text-sm text-slate-500 mt-1">Vue d'ensemble de la performance de livraison</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {statCards.map((s) => (
            <div key={s.label} className={cn('rounded-xl p-4 border border-slate-100', s.color)}>
              <s.icon className="w-5 h-5 mb-2 opacity-70" />
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs mt-1 opacity-80">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Status Distribution Pie */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Distribution par statut</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="label"
                >
                  {statusDistribution.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Shipments Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Expéditions par mois</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyShipments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#C8A951" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Transport Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Modes de transport</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={transportDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="mode" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#060f24" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Material Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Types de matériaux</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={materialDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="material"
                  label={({ material, percent }) => `${material} ${(percent * 100).toFixed(0)}%`}
                >
                  {materialDistribution.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Routes */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Top routes</h3>
          {topRoutes.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Aucune route enregistrée</p>
          ) : (
            <div className="space-y-3">
              {topRoutes.map((r, i) => (
                <div key={r.route} className="flex items-center gap-4">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-700">{r.route}</div>
                  </div>
                  <span className="text-sm font-bold text-yellow-600">{r.count} colis</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue Summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Résumé des revenus</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">
                {revenue.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </div>
              <div className="text-xs text-slate-500 mt-1">Revenu total</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {revenue.average.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </div>
              <div className="text-xs text-slate-500 mt-1">Panier moyen</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">{revenue.count}</div>
              <div className="text-xs text-slate-500 mt-1">Colis facturés</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
