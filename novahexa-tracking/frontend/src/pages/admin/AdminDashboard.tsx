import React, { useEffect, useState } from 'react';
import {
  Package, Clock, Truck, CheckCircle2, ClipboardCheck, MessageSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { packagesApi, dashboardApi, contactApi } from '../../lib/api';
import type { PackageItem, ContactMessage } from '../../types';

export function AdminDashboard() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([packagesApi.list().catch(() => []), contactApi.list().catch(() => [])])
      .then(([pkgs, msgs]) => {
        setPackages(pkgs);
        setMessages(msgs);
      })
      .finally(() => setLoading(false));
  }, []);

  const pending = packages.filter((p) => p.status === 'PENDING');
  const inTransit = packages.filter((p) => p.status === 'IN_TRANSIT');
  const delivered = packages.filter((p) => p.status === 'DELIVERED');

  const statCards = [
    { label: 'Total colis', value: packages.length, icon: Package, color: 'bg-slate-100 text-slate-600', href: '/admin/packages' },
    { label: 'En attente', value: pending.length, icon: ClipboardCheck, color: 'bg-amber-50 text-amber-600', href: '/admin/submissions' },
    { label: 'En transit', value: inTransit.length, icon: Truck, color: 'bg-indigo-50 text-indigo-600', href: '/admin/map' },
    { label: 'Livrés', value: delivered.length, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600', href: '/admin/packages' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord admin</h1>
          <p className="text-sm text-slate-500 mt-1">Vue d'ensemble de l'activité</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <Link
              key={s.label}
              to={s.href}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-slate-600">{s.label}</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{s.value}</div>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending submissions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">Soumissions en attente</h2>
              <Link to="/admin/submissions" className="text-xs text-yellow-500 hover:underline font-medium">
                Voir tout
              </Link>
            </div>
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Chargement...</div>
            ) : pending.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Aucune soumission en attente</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pending.slice(0, 5).map((pkg) => (
                  <Link
                    key={pkg.id}
                    to={`/admin/submissions`}
                    className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">{pkg.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{pkg.trackingNumber}</div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(pkg.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent contact messages */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">Messages contact</h2>
              <Link to="/admin/contact-messages" className="text-xs text-yellow-500 hover:underline font-medium">
                Voir tout
              </Link>
            </div>
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Chargement...</div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Aucun message</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {messages.slice(0, 5).map((msg) => (
                  <div key={msg.id} className="px-6 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-900">{msg.name}</span>
                      {msg.status === 'NON_TRAITE' && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{msg.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active packages in transit */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-sm">Colis en transit</h2>
          </div>
          {inTransit.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Aucun colis en transit</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Colis</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">N° suivi</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Départ</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Arrivée</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inTransit.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-900">{pkg.name}</td>
                      <td className="px-6 py-3 font-mono text-slate-500">{pkg.trackingNumber}</td>
                      <td className="px-6 py-3 text-slate-600">{pkg.originAddress}</td>
                      <td className="px-6 py-3 text-slate-600">{pkg.destinationAddress}</td>
                      <td className="px-6 py-3"><StatusBadge status={pkg.status} size="sm" /></td>
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
