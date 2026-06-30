import React, { useEffect, useState } from 'react';
import { Package, Plus, Pencil, Trash2, Search, Filter, X } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { packagesApi } from '../../lib/api';
import type { PackageItem, PackageStatus } from '../../types';
import { STATUS_LABELS } from '../../types';

export function AdminPackages() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PackageStatus | ''>('');

  const loadPackages = () => {
    packagesApi.list().catch(() => []).finally(() => setLoading(false));
  };

  useEffect(() => { loadPackages(); }, []);

  const handleDelete = async (pkg: PackageItem) => {
    if (!confirm(`Supprimer le colis "${pkg.name}" (${pkg.trackingNumber}) ?`)) return;
    await packagesApi.delete(pkg.id).catch(() => {});
    loadPackages();
  };

  const filtered = packages.filter((p) => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.originAddress.toLowerCase().includes(search.toLowerCase()) ||
      p.destinationAddress.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Package className="w-6 h-6 text-yellow-500" />
              Gestion des colis
            </h1>
            <p className="text-sm text-slate-500 mt-1">{packages.length} colis au total</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, n° suivi, adresse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-yellow-400 transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PackageStatus | '')}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          {(search || statusFilter) && (
            <button onClick={() => { setSearch(''); setStatusFilter(''); }} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">Aucun colis trouvé</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Nom</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">N° suivi</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Client</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Trajet</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Statut</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Date</th>
                    <th className="text-right px-6 py-3 font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-900">{pkg.name}</td>
                      <td className="px-6 py-3 font-mono text-slate-500 text-xs">{pkg.trackingNumber}</td>
                      <td className="px-6 py-3 text-slate-600">{pkg.ownerName || pkg.ownerEmail || '—'}</td>
                      <td className="px-6 py-3 text-slate-600">{pkg.originAddress} → {pkg.destinationAddress}</td>
                      <td className="px-6 py-3"><StatusBadge status={pkg.status} size="sm" /></td>
                      <td className="px-6 py-3 text-slate-400 text-xs">{new Date(pkg.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => handleDelete(pkg)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
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
