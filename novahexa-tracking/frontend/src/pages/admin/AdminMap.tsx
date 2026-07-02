import { useEffect, useState } from 'react';
import { Map as MapIcon, Navigation } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { ParcelMap } from '../../components/ParcelMap';
import { WaypointManager } from '../../components/WaypointManager';
import { StatusBadge } from '../../components/StatusBadge';
import { packagesApi } from '../../lib/api';
import type { PackageItem } from '../../types';

export function AdminMap() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<PackageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingWaypoints, setEditingWaypoints] = useState(false);

  useEffect(() => {
    packagesApi
      .list()
      .then((data) => {
        setPackages(data);
        const firstActive = data.find(
          (p) => p.status === 'IN_TRANSIT' || p.status === 'VALIDATED',
        );
        if (firstActive) setSelectedPkg(firstActive);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activePkgs = packages.filter(
    (p) =>
      p.status === 'IN_TRANSIT' ||
      p.status === 'VALIDATED' ||
      p.status === 'PENDING',
  );

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

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Map */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-[600px] relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-sm text-slate-400">Chargement de la carte…</p>
                  </div>
                </div>
              ) : activePkgs.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                  <div className="text-center">
                    <MapIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-400">Aucun colis actif</h3>
                    <p className="text-sm text-slate-300 mt-1">
                      Les colis validés et en transit apparaîtront ici
                    </p>
                  </div>
                </div>
              ) : (
                <ParcelMap
                  pkg={selectedPkg ?? activePkgs[0]!}
                  height="600px"
                  showAll={!editingWaypoints}
                  allPackages={activePkgs}
                  showPosition={true}
                  onParcelClick={(p) => { setSelectedPkg(p); setEditingWaypoints(false); }}
                />
              )}

              {/* Package list overlay */}
              <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg border border-slate-200 p-4 max-w-xs max-h-64 overflow-y-auto z-[1000]">
                <h4 className="font-bold text-slate-900 text-sm mb-3">Colis actifs</h4>
                {loading ? (
                  <p className="text-xs text-slate-400">Chargement...</p>
                ) : activePkgs.length === 0 ? (
                  <p className="text-xs text-slate-400">Aucun colis actif</p>
                ) : (
                  <div className="space-y-2">
                    {activePkgs.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => { setSelectedPkg(pkg); setEditingWaypoints(false); }}
                        className={`w-full flex items-center justify-between text-xs p-2 rounded-lg transition-colors ${
                          selectedPkg?.id === pkg.id
                            ? 'bg-yellow-50 border border-yellow-200'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-medium text-slate-900">{pkg.name}</div>
                          <div className="text-slate-400 font-mono">{pkg.trackingNumber}</div>
                        </div>
                        <StatusBadge status={pkg.status} size="sm" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Package details + Waypoint Manager */}
          <div className="space-y-4">
            {selectedPkg ? (
              <>
                {/* Package info card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900 text-sm">{selectedPkg.name}</h3>
                    <StatusBadge status={selectedPkg.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 font-mono mb-2">{selectedPkg.trackingNumber}</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-500">
                      <span className="text-blue-500">●</span> {selectedPkg.originAddress}
                    </p>
                    <p className="text-slate-500">
                      <span className="text-red-500">●</span> {selectedPkg.destinationAddress}
                    </p>
                  </div>
                </div>

                {/* Toggle waypoint editing */}
                <button
                  onClick={() => setEditingWaypoints(!editingWaypoints)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                    editingWaypoints
                      ? 'bg-yellow-400 text-[#060f24]'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-yellow-300'
                  }`}
                >
                  <Navigation className="w-4 h-4" />
                  {editingWaypoints ? 'Fermer l\'éditeur d\'arrêts' : 'Gérer les arrêts'}
                </button>

                {/* Waypoint Manager */}
                {editingWaypoints && (
                  <WaypointManager
                    pkg={selectedPkg}
                    onUpdate={(updated) => {
                      setSelectedPkg(updated);
                      setPackages((prev) => prev.map((p) => p.id === updated.id ? updated : p));
                    }}
                  />
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
                <MapIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Sélectionnez un colis sur la carte</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
