import { useEffect, useState } from 'react';
import { Package, Trash2, Search, X, FileText, Tag, Truck, CheckCircle2, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { TrackingQR } from '../../components/TrackingQR';
import { packagesApi, pdfApi } from '../../lib/api';
import type { PackageItem, PackageStatus } from '../../types';
import { STATUS_LABELS } from '../../types';

export function AdminPackages() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PackageStatus | ''>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadPackages = () => {
    packagesApi.list().then(setPackages).catch(() => []).finally(() => setLoading(false));
  };

  useEffect(() => { loadPackages(); }, []);

  const handleDelete = async (pkg: PackageItem) => {
    if (!confirm(`Supprimer le colis "${pkg.name}" (${pkg.trackingNumber}) ?`)) return;
    setActionLoading(pkg.id);
    await packagesApi.delete(pkg.id).catch(() => {});
    loadPackages();
  };

  const handleSetInTransit = async (pkg: PackageItem) => {
    setActionLoading(pkg.id);
    await packagesApi.setInTransit(pkg.trackingNumber).catch(() => {});
    loadPackages();
  };

  const handleSetDelivered = async (pkg: PackageItem) => {
    setActionLoading(pkg.id);
    await packagesApi.setDelivered(pkg.trackingNumber).catch(() => {});
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
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Colis</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">QR</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Client</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Trajet</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Transport</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Statut</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Date</th>
                    <th className="text-right px-6 py-3 font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="font-medium text-slate-900">{pkg.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{pkg.trackingNumber}</div>
                      </td>
                      <td className="px-6 py-3">
                        <TrackingQR trackingNumber={pkg.trackingNumber} size={48} showActions={false} />
                      </td>
                      <td className="px-6 py-3 text-slate-600">{pkg.ownerName || pkg.ownerEmail || '—'}</td>
                      <td className="px-6 py-3 text-slate-600 text-xs">{pkg.originAddress} → {pkg.destinationAddress}</td>
                      <td className="px-6 py-3 text-slate-500 text-xs">{pkg.transportMode || '—'}</td>
                      <td className="px-6 py-3"><StatusBadge status={pkg.status} size="sm" /></td>
                      <td className="px-6 py-3 text-slate-400 text-xs">{new Date(pkg.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {pkg.status === 'VALIDATED' && (
                            <button
                              onClick={() => handleSetInTransit(pkg)}
                              disabled={actionLoading === pkg.id}
                              className="text-indigo-500 hover:text-indigo-700 transition-colors p-1"
                              title="Mettre en transit"
                            >
                              {actionLoading === pkg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                            </button>
                          )}
                          {pkg.status === 'IN_TRANSIT' && (
                            <button
                              onClick={() => handleSetDelivered(pkg)}
                              disabled={actionLoading === pkg.id}
                              className="text-emerald-500 hover:text-emerald-700 transition-colors p-1"
                              title="Marquer livré"
                            >
                              {actionLoading === pkg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            </button>
                          )}
                          <button
                            onClick={() => pdfApi.downloadQuote(pkg.trackingNumber)}
                            className="text-slate-400 hover:text-blue-500 transition-colors p-1"
                            title="Devis PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => pdfApi.downloadLabel(pkg.trackingNumber)}
                            className="text-slate-400 hover:text-yellow-500 transition-colors p-1"
                            title="Étiquette PDF"
                          >
                            <Tag className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(pkg)}
                            disabled={actionLoading === pkg.id}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
