import React, { useEffect, useState } from 'react';
import {
  Search, Package, Truck, Plane, Ship, MapPin, Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { packagesApi } from '../lib/api';
import { ParcelMap } from '../components/ParcelMap';
import { StatusBadge } from '../components/StatusBadge';
import { cn } from '../lib/utils';
import type { PackageItem } from '../types';

const TRANSPORT_ICONS: Record<string, React.FC<{ className?: string }>> = {
  ROUTE: Truck,
  AIR: Plane,
  MER: Ship,
};

export function Dashboard() {
  const { t } = useTranslation();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<PackageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'tracking' | 'messages'>('general');

  useEffect(() => {
    packagesApi
      .list()
      .then((data) => {
        setPackages(data);
        const firstActive = data.find(
          (p) => p.status === 'IN_TRANSIT' || p.status === 'VALIDATED',
        );
        if (firstActive) setSelectedPkg(firstActive);
        else if (data.length > 0) setSelectedPkg(data[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredPkgs = packages.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.originAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.destinationAddress.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const deliveredPkgs = packages.filter((p) => p.status === 'DELIVERED');

  const getTransportIcon = (mode?: string) => {
    if (mode && TRANSPORT_ICONS[mode]) return TRANSPORT_ICONS[mode];
    if (mode === 'AIR') return Plane;
    if (mode === 'MER') return Ship;
    return Truck;
  };

  const statusSummary = [
    { label: 'En attente', count: packages.filter((p) => p.status === 'PENDING').length, color: 'text-amber-600 bg-amber-50' },
    { label: 'Validés', count: packages.filter((p) => p.status === 'VALIDATED').length, color: 'text-blue-600 bg-blue-50' },
    { label: 'En transit', count: packages.filter((p) => p.status === 'IN_TRANSIT').length, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Livrés', count: deliveredPkgs.length, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="min-h-screen bg-[#eef2f6] font-sans flex flex-col">
      {/* DARK HEADER */}
      <div className="bg-[#060f24] text-white pb-32">
        <div className="px-8 py-8">
          <h1 className="text-[28px] font-semibold tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Suivez vos envois en temps réel
          </p>
        </div>

        {/* Search */}
        <div className="px-8 pb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, n° suivi, origine, destination…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a1530] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400/50"
            />
          </div>
        </div>

        {/* Status summary */}
        <div className="px-8">
          <div className="flex gap-3">
            {statusSummary.map((s) => (
              <div
                key={s.label}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold',
                  s.color,
                )}
              >
                <span>{s.label}</span>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 px-8 -mt-20 pb-8 w-full flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-slate-400">{t('common.loading')}</p>
            </div>
          </div>
        ) : packages.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-400">Aucun colis</h3>
              <p className="text-sm text-slate-300 mt-1">
                Vous n'avez pas encore soumis de colis.
              </p>
              <Link
                to="/"
                className="mt-4 inline-block bg-yellow-400 text-[#060f24] px-5 py-2 rounded-lg text-sm font-bold hover:bg-yellow-300 transition"
              >
                Soumettre un colis
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex gap-6 flex-1 min-h-0">
            {/* Left: Package List */}
            <div className="w-[380px] flex flex-col gap-3 overflow-y-auto pb-4 hide-scrollbar">
              {filteredPkgs.map((pkg) => {
                const isSelected = selectedPkg?.id === pkg.id;
                const TransportIcon = getTransportIcon(pkg.transportMode);
                return (
                  <button
                    key={pkg.id}
                    onClick={() => { setSelectedPkg(pkg); setActiveTab('general'); }}
                    className={cn(
                      'bg-white rounded-xl shadow-sm border transition-all cursor-pointer overflow-hidden text-left w-full',
                      isSelected
                        ? 'border-transparent ring-2 ring-yellow-500/20'
                        : 'border-slate-200 hover:border-yellow-300',
                    )}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <TransportIcon className="w-5 h-5 text-slate-500" />
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                              N° de suivi
                            </div>
                            <div className="font-bold text-slate-900 text-[13px] font-mono">
                              {pkg.trackingNumber}
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={pkg.status} size="sm" />
                      </div>

                      <div className="text-sm font-bold text-slate-800 mb-2">{pkg.name}</div>

                      <div className="relative pl-2 ml-3 space-y-4 before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                        <div className="relative flex items-center justify-between">
                          <div className="absolute -left-[14px] top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-50" />
                          <span className="text-xs font-medium text-slate-700 ml-4 truncate max-w-[200px]">
                            {pkg.originAddress}
                          </span>
                        </div>
                        <div className="relative flex items-center justify-between">
                          <div className="absolute -left-[14px] top-1.5 w-2 h-2 rounded-full bg-slate-800" />
                          <span className="text-xs font-medium text-slate-700 ml-4 truncate max-w-[200px]">
                            {pkg.destinationAddress}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Map + Details */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
              {selectedPkg ? (
                <>
                  {/* Map */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <ParcelMap pkg={selectedPkg} height="400px" showPosition={true} />
                  </div>

                  {/* Detail Tabs */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="flex border-b border-slate-100">
                      {(['general', 'tracking', 'messages'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={cn(
                            'flex-1 py-3 text-sm font-bold transition-colors',
                            activeTab === tab
                              ? 'text-yellow-600 border-b-2 border-yellow-400'
                              : 'text-slate-500 hover:text-slate-700',
                          )}
                        >
                          {tab === 'general' ? 'Général' : tab === 'tracking' ? 'Suivi' : 'Messages'}
                        </button>
                      ))}
                    </div>

                    <div className="p-5">
                      {activeTab === 'general' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Départ</p>
                              <p className="text-sm text-slate-700 font-medium">{selectedPkg.originAddress}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Arrivée</p>
                              <p className="text-sm text-slate-700 font-medium">{selectedPkg.destinationAddress}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                            {selectedPkg.transportMode && (
                              <div>
                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Transport</p>
                                <p className="text-sm text-slate-700 font-medium">{selectedPkg.transportMode}</p>
                              </div>
                            )}
                            {selectedPkg.weightKg != null && (
                              <div>
                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Poids</p>
                                <p className="text-sm text-slate-700 font-medium">{selectedPkg.weightKg} kg</p>
                              </div>
                            )}
                            {selectedPkg.estimatedDuration && (
                              <div>
                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Durée estimée</p>
                                <p className="text-sm text-slate-700 font-medium">{selectedPkg.estimatedDuration}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 pt-3 border-t border-slate-100">
                            <Clock className="w-3.5 h-3.5" />
                            Créé le {new Date(selectedPkg.createdAt).toLocaleDateString('fr-FR')}
                            {selectedPkg.validatedAt && (
                              <> · Validé le {new Date(selectedPkg.validatedAt).toLocaleDateString('fr-FR')}</>
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === 'tracking' && (
                        <div>
                          {selectedPkg.trackingEvents && selectedPkg.trackingEvents.length > 0 ? (
                            <div className="space-y-3">
                              {selectedPkg.trackingEvents.map((ev) => (
                                <div key={ev.id} className="flex items-start gap-3">
                                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 shrink-0" />
                                  <div>
                                    <p className="text-sm text-slate-700">{ev.description}</p>
                                    <p className="text-[11px] text-slate-400">
                                      {new Date(ev.createdAt).toLocaleString('fr-FR')}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400 text-center py-8">
                              Aucun événement de suivi pour le moment.
                            </p>
                          )}
                        </div>
                      )}

                      {activeTab === 'messages' && (
                        <div>
                          {selectedPkg.messages && selectedPkg.messages.length > 0 ? (
                            <div className="space-y-3">
                              {selectedPkg.messages.map((msg) => (
                                <div key={msg.id} className="bg-slate-50 rounded-lg p-3">
                                  <p className="text-xs font-bold text-slate-700">{msg.subject}</p>
                                  <p className="text-sm text-slate-600 mt-1">{msg.body}</p>
                                  <p className="text-[11px] text-slate-400 mt-1">
                                    {new Date(msg.sentAt).toLocaleString('fr-FR')}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400 text-center py-8">
                              Aucun message pour ce colis.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">Sélectionnez un colis pour voir les détails</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
