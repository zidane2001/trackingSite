import React, { useEffect, useState } from 'react';
import { ClipboardCheck, Check, X, Eye, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { packagesApi } from '../../lib/api';
import type { PackageItem } from '../../types';
import { cn } from '../../lib/utils';

export function AdminSubmissions() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PackageItem | null>(null);
  const [refusalReason, setRefusalReason] = useState('');
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const loadPackages = () => {
    packagesApi.list().then((pkgs) => {
      setPackages(pkgs.filter((p) => p.status === 'PENDING'));
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadPackages(); }, []);

  const handleValidate = async (pkg: PackageItem) => {
    setProcessing(true);
    try {
      await packagesApi.validate(pkg.trackingNumber);
      setSelected(null);
      loadPackages();
    } catch { /* ignore */ } finally { setProcessing(false); }
  };

  const handleRefuse = async () => {
    if (!selected || !refusalReason.trim()) return;
    setProcessing(true);
    try {
      await packagesApi.refuse(selected.trackingNumber, refusalReason);
      setShowRefuseModal(false);
      setSelected(null);
      setRefusalReason('');
      loadPackages();
    } catch { /* ignore */ } finally { setProcessing(false); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 sm:gap-3">
            <ClipboardCheck className="w-6 h-6 text-yellow-500" />
            File de validation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {packages.length} demande{packages.length !== 1 ? 's' : ''} en attente de traitement
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            Chargement...
          </div>
        ) : packages.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Check className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Toutes les soumissions sont traitées !</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={cn(
                  'bg-white rounded-xl border shadow-sm p-6 transition-all',
                  selected?.id === pkg.id ? 'border-yellow-400 ring-2 ring-yellow-400/20' : 'border-slate-200 hover:border-slate-300'
                )}
                onClick={() => setSelected(selected?.id === pkg.id ? null : pkg)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between cursor-pointer gap-2">                    <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <ClipboardCheck className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{pkg.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{pkg.trackingNumber}</div>
                      <div className="text-sm text-slate-500 mt-1">
                        {pkg.originAddress} → {pkg.destinationAddress}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">
                      {new Date(pkg.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Par {pkg.ownerName || pkg.ownerEmail || 'Client'}
                    </div>
                  </div>
                </div>

                {selected?.id === pkg.id && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-slate-500">Poids : </span>
                          <span className="font-medium">{pkg.weightKg || '—'} kg</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-500">Dimensions : </span>
                          <span className="font-medium">
                            {pkg.heightCm || '?'} × {pkg.widthCm || '?'} × {pkg.lengthCm || '?'} cm
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-500">Transport souhaité : </span>
                          <span className="font-medium">{pkg.transportMode || '—'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-slate-500">Email : </span>
                          <span className="font-medium">{pkg.ownerEmail || '—'}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-500">Date d'envoi : </span>
                          <span className="font-medium">{pkg.shippingDate || '—'}</span>
                        </div>
                        {pkg.description && (
                          <div className="text-sm">
                            <span className="text-slate-500">Description : </span>
                            <span className="font-medium">{pkg.description}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {pkg.photoUrl && (
                      <div className="mb-4">
                        <img src={pkg.photoUrl} alt="Photo du colis" className="w-32 h-32 object-cover rounded-lg border" />
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleValidate(pkg); }}
                        disabled={processing}
                        className="bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-600 transition flex items-center gap-2 disabled:opacity-50"
                      >
                        {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Valider
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowRefuseModal(true); }}
                        disabled={processing}
                        className="bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-red-100 transition flex items-center gap-2 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Refuser
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Refuse modal */}
        {showRefuseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="font-bold text-slate-900 mb-4">Refuser la soumission</h3>
              <p className="text-sm text-slate-500 mb-4">
                Veuillez indiquer le motif du refus. Le client sera notifié.
              </p>
              <textarea
                rows={4}
                value={refusalReason}
                onChange={(e) => setRefusalReason(e.target.value)}
                placeholder="Motif du refus..."
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/40 transition resize-none mb-4"
              />
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => { setShowRefuseModal(false); setRefusalReason(''); }}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleRefuse}
                  disabled={!refusalReason.trim() || processing}
                  className="bg-red-500 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-red-600 transition disabled:opacity-50"
                >
                  Confirmer le refus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
