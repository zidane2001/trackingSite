import { useEffect, useState } from 'react';
import { MessageSquare, Package } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { MessagingPanel } from '../../components/MessagingPanel';
import { packagesApi } from '../../lib/api';
import type { PackageItem } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { cn } from '../../lib/utils';

export function ClientMessages() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<PackageItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    packagesApi.listByOwner().then(setPackages).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 sm:gap-3">
            <MessageSquare className="w-6 h-6 text-yellow-500" />
            Messagerie
          </h1>
          <p className="text-sm text-slate-500 mt-1">Communiquez avec l'équipe concernant vos colis</p>
        </div>

        <div className="grid lg:grid-cols-[350px_1fr] gap-4 sm:gap-6 min-h-[400px] sm:min-h-[600px]">
          {/* Package list */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm">Sélectionner un colis</h2>
            </div>
            <div className="overflow-y-auto max-h-[540px]">
              {loading ? (
                <div className="p-6 text-center text-slate-400 text-sm">Chargement...</div>
              ) : packages.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">Aucun colis</div>
              ) : (
                packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPkg(pkg)}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors',
                      selectedPkg?.id === pkg.id && 'bg-yellow-50 border-l-2 border-l-yellow-400',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{pkg.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{pkg.trackingNumber}</div>
                      </div>
                      <StatusBadge status={pkg.status} size="sm" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message area */}
          <div className="flex flex-col overflow-hidden">
            {!selectedPkg ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="text-center">
                  <Package className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">Sélectionnez un colis pour accéder à la messagerie</p>
                </div>
              </div>
            ) : (
              <MessagingPanel
                parcelId={selectedPkg.id}
                packageName={selectedPkg.name}
                context="client"
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
