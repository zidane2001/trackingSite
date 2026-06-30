import React, { useEffect, useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { packagesApi } from '../../lib/api';
import type { PackageItem } from '../../types';

export function AdminMap() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    packagesApi.list().catch(() => []).finally(() => setLoading(false));
  }, []);

  const activePkgs = packages.filter((p) => p.status === 'IN_TRANSIT' || p.status === 'VALIDATED');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <MapIcon className="w-6 h-6 text-yellow-500" />
            Carte globale
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Vue d'ensemble de tous les colis actifs
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-[600px] relative bg-slate-100">
            {/* Map placeholder — in production, integrate Leaflet here */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2394a3b8' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-400">Carte interactive</h3>
                <p className="text-sm text-slate-300 mt-1">
                  {activePkgs.length} colis actifs
                </p>
              </div>
            </div>

            {/* Package list overlay */}
            <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg border border-slate-200 p-4 max-w-xs max-h-64 overflow-y-auto">
              <h4 className="font-bold text-slate-900 text-sm mb-3">Colis actifs</h4>
              {loading ? (
                <p className="text-xs text-slate-400">Chargement...</p>
              ) : activePkgs.length === 0 ? (
                <p className="text-xs text-slate-400">Aucun colis actif</p>
              ) : (
                <div className="space-y-2">
                  {activePkgs.map((pkg) => (
                    <div key={pkg.id} className="flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-slate-900">{pkg.name}</div>
                        <div className="text-slate-400 font-mono">{pkg.trackingNumber}</div>
                      </div>
                      <StatusBadge status={pkg.status} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
