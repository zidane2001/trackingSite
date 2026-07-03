import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Package, Truck, CheckCircle2, ClipboardCheck, MapPin,
  RefreshCw, TrendingUp, AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { packagesApi, contactApi } from '../../lib/api';
import type { PackageItem, ContactMessage } from '../../types';
import { STATUS_LABELS } from '../../types';

// ── Chart colours ───────────────────────────────────────────
const STATUS_CHART_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  VALIDATED: '#3b82f6',
  REFUSED: '#ef4444',
  IN_TRANSIT: '#6366f1',
  DELIVERED: '#10b981',
};

const TRANSPORT_COLORS: Record<string, string> = {
  ROUTIER: '#6366f1',
  AERIEN: '#3b82f6',
  MARITIME: '#06b6d4',
};

// ── Helper: group packages by month ─────────────────────────
function groupByMonth(packages: PackageItem[]): { month: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of packages) {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  const entries = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6);
  return entries.map(([key, count]) => {
    const [y, m] = key.split('-');
    const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    return { month: monthName, count };
  });
}

// ── Helper: group by transport mode ─────────────────────────
function groupByTransport(packages: PackageItem[]): { mode: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of packages) {
    const mode = p.transportMode ?? 'Non défini';
    map.set(mode, (map.get(mode) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([mode, count]) => ({ mode, count }))
    .sort((a, b) => b.count - a.count);
}

// ── AdminDashboard ──────────────────────────────────────────
export function AdminDashboard() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setRefreshing(true);
    setError('');
    try {
      const [pkgs, msgs] = await Promise.all([
        packagesApi.list().catch(() => []),
        contactApi.list().catch(() => []),
      ]);
      setPackages(pkgs);
      setMessages(msgs);
    } catch {
      setError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const pending = packages.filter((p) => p.status === 'PENDING');
    const validated = packages.filter((p) => p.status === 'VALIDATED');
    const inTransit = packages.filter((p) => p.status === 'IN_TRANSIT');
    const delivered = packages.filter((p) => p.status === 'DELIVERED');
    const refused = packages.filter((p) => p.status === 'REFUSED');
    return { pending, validated, inTransit, delivered, refused };
  }, [packages]);

  const pieData = useMemo(() => {
    return Object.entries(stats)
      .filter(([_, arr]) => arr.length > 0)
      .map(([key, arr]) => ({
        name: STATUS_LABELS[key.toUpperCase() as keyof typeof STATUS_LABELS] ?? key,
        value: arr.length,
        status: key.toUpperCase(),
      }));
  }, [stats]);

  const monthlyData = useMemo(() => groupByMonth(packages), [packages]);
  const transportData = useMemo(() => groupByTransport(packages), [packages]);

  const recentPkgs = useMemo(
    () => [...packages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
    [packages],
  );

  const recentMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [messages],
  );

  const statCards = [
    { label: 'Total colis', value: packages.length, icon: Package, color: 'bg-slate-100 text-slate-600', href: '/admin/packages' },
    { label: 'En attente', value: stats.pending.length, icon: ClipboardCheck, color: 'bg-amber-50 text-amber-600', href: '/admin/submissions' },
    { label: 'En transit', value: stats.inTransit.length, icon: Truck, color: 'bg-indigo-50 text-indigo-600', href: '/admin/map' },
    { label: 'Livrés', value: stats.delivered.length, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600', href: '/admin/packages' },
    { label: 'Validés', value: stats.validated.length, icon: MapPin, color: 'bg-blue-50 text-blue-600', href: '/admin/packages' },
    { label: 'Refusés', value: stats.refused.length, icon: AlertCircle, color: 'bg-red-50 text-red-600', href: '/admin/packages' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Tableau de bord admin</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Vue d'ensemble de l'activité</p>
          </div>
          <button
            onClick={() => load()}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 sm:px-5 py-3 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {statCards.map((s) => (
            <Link
              key={s.label}
              to={s.href}
              className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-500">{s.label}</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900">{s.value}</div>
            </Link>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-500" />
              Répartition par statut
            </h3>
            {pieData.length === 0 ? (
              <div className="h-48 sm:h-64 flex items-center justify-center text-slate-400 text-sm">Aucune donnée</div>
            ) : (
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                      {pieData.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status] ?? '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [`${value} colis`, name]} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(value: string) => <span className="text-xs text-slate-600">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-500" />
              Colis par mois
            </h3>
            {monthlyData.length === 0 ? (
              <div className="h-48 sm:h-64 flex items-center justify-center text-slate-400 text-sm">Aucune donnée</div>
            ) : (
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(value: number) => [`${value} colis`, 'Créés']} />
                    <Bar dataKey="count" fill="#C8A951" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 md:col-span-2 lg:col-span-1">
            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-yellow-500" />
              Modes de transport
            </h3>
            {transportData.length === 0 ? (
              <div className="h-48 sm:h-64 flex items-center justify-center text-slate-400 text-sm">Aucune donnée</div>
            ) : (
              <div className="space-y-3 sm:space-y-4 pt-2">
                {transportData.map((t) => {
                  const pct = packages.length > 0 ? (t.count / packages.length) * 100 : 0;
                  return (
                    <div key={t.mode}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{t.mode}</span>
                        <span className="text-xs text-slate-500">{t.count} colis ({Math.round(pct)}%)</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: TRANSPORT_COLORS[t.mode] ?? '#94a3b8' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">Soumissions en attente</h2>
              <Link to="/admin/submissions" className="text-xs text-yellow-500 hover:underline font-medium">Voir tout</Link>
            </div>
            {loading ? (
              <div className="p-6 sm:p-8 text-center text-slate-400 text-sm">Chargement...</div>
            ) : stats.pending.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-slate-400 text-sm">Aucune soumission en attente</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {stats.pending.slice(0, 5).map((pkg) => (
                  <Link key={pkg.id} to="/admin/submissions" className="flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">{pkg.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{pkg.trackingNumber}</div>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0 ml-3">{new Date(pkg.createdAt).toLocaleDateString('fr-FR')}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">Messages contact</h2>
              <Link to="/admin/contact-messages" className="text-xs text-yellow-500 hover:underline font-medium">Voir tout</Link>
            </div>
            {loading ? (
              <div className="p-6 sm:p-8 text-center text-slate-400 text-sm">Chargement...</div>
            ) : recentMessages.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-slate-400 text-sm">Aucun message</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="px-4 sm:px-5 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-900">{msg.name}</span>
                      {msg.status === 'NON_TRAITE' && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">Nouveau</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{msg.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{new Date(msg.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden md:col-span-2 lg:col-span-1">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm">Activité récente</h2>
            </div>
            {loading ? (
              <div className="p-6 sm:p-8 text-center text-slate-400 text-sm">Chargement...</div>
            ) : recentPkgs.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-slate-400 text-sm">Aucune activité</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentPkgs.map((pkg) => (
                  <div key={pkg.id} className="px-4 sm:px-5 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{pkg.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{pkg.originAddress} → {pkg.destinationAddress}</div>
                    </div>
                    <StatusBadge status={pkg.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Full Packages Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Tous les colis</h2>
            <Link to="/admin/packages" className="text-xs text-yellow-500 hover:underline font-medium">Gérer les colis</Link>
          </div>
          {loading ? (
            <div className="p-6 sm:p-8 text-center text-slate-400 text-sm">Chargement...</div>
          ) : packages.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-slate-400 text-sm">Aucun colis</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 sm:px-5 py-3 font-semibold text-slate-500">Colis</th>
                    <th className="text-left px-4 sm:px-5 py-3 font-semibold text-slate-500 hidden sm:table-cell">N° suivi</th>
                    <th className="text-left px-4 sm:px-5 py-3 font-semibold text-slate-500 hidden md:table-cell">Client</th>
                    <th className="text-left px-4 sm:px-5 py-3 font-semibold text-slate-500 hidden lg:table-cell">Trajet</th>
                    <th className="text-left px-4 sm:px-5 py-3 font-semibold text-slate-500 hidden md:table-cell">Statut</th>
                    <th className="text-left px-4 sm:px-5 py-3 font-semibold text-slate-500 hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPkgs.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 sm:px-5 py-3">
                        <div className="font-medium text-slate-900 truncate max-w-[160px] sm:max-w-none">{pkg.name}</div>
                        <div className="sm:hidden text-[11px] text-slate-400 font-mono mt-0.5">{pkg.trackingNumber}</div>
                        <div className="md:hidden text-xs text-slate-500 mt-0.5">
                          <StatusBadge status={pkg.status} size="sm" />
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 py-3 font-mono text-slate-500 text-xs hidden sm:table-cell">{pkg.trackingNumber}</td>
                      <td className="px-4 sm:px-5 py-3 text-slate-600 hidden md:table-cell">{pkg.ownerName || pkg.ownerEmail || '—'}</td>
                      <td className="px-4 sm:px-5 py-3 text-slate-600 text-xs hidden lg:table-cell truncate max-w-[200px]">{pkg.originAddress} → {pkg.destinationAddress}</td>
                      <td className="px-4 sm:px-5 py-3 hidden md:table-cell"><StatusBadge status={pkg.status} size="sm" /></td>
                      <td className="px-4 sm:px-5 py-3 text-slate-400 text-xs hidden lg:table-cell">{new Date(pkg.createdAt).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
