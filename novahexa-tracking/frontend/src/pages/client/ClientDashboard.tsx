import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Clock, Truck, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { packagesApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { PackageItem, DashboardStats } from '../../types';

export function ClientDashboard() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    packagesApi
      .listByOwner()
      .then(setPackages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const stats: DashboardStats = {
    total: packages.length,
    pending: packages.filter((p) => p.status === 'PENDING').length,
    validated: packages.filter((p) => p.status === 'VALIDATED').length,
    inTransit: packages.filter((p) => p.status === 'IN_TRANSIT').length,
    delivered: packages.filter((p) => p.status === 'DELIVERED').length,
    refused: packages.filter((p) => p.status === 'REFUSED').length,
  };

  const statCards = [
    { label: 'Total', value: stats.total, icon: Package, color: 'bg-slate-100 text-slate-600' },
    { label: 'En attente', value: stats.pending, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'En transit', value: stats.inTransit, icon: Truck, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Livrés', value: stats.delivered, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Bonjour, {user?.fullName?.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Voici le résumé de vos envois</p>
          </div>
          <Link
            to="/"
            className="bg-yellow-400 text-[#060f24] px-4 sm:px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-yellow-300 transition flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" /> Nouveau colis
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-600">{s.label}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Packages list */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">Mes colis</h2>
          </div>
          {loading ? (
            <div className="p-8 sm:p-12 text-center text-slate-400">Chargement...</div>
          ) : packages.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Package className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-slate-500 mb-3 sm:mb-4 text-sm">Vous n'avez pas encore de colis.</p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-yellow-400 text-[#060f24] px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-yellow-300 transition"
              >
                <Plus className="w-4 h-4" /> Soumettre un colis
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {packages.map((pkg) => (
                <Link
                  key={pkg.id}
                  to={`/client/packages/${pkg.id}`}
                  className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">{pkg.name}</div>
                      <div className="text-xs text-slate-400 font-mono truncate">{pkg.trackingNumber}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-3">
                    <div className="text-right hidden md:block">
                      <div className="text-xs text-slate-500">{pkg.originAddress}</div>
                      <div className="text-[11px] text-slate-400">→ {pkg.destinationAddress}</div>
                    </div>
                    <StatusBadge status={pkg.status} size="sm" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
