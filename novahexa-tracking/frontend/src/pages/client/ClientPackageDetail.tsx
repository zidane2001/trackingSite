import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Clock, MessageSquare } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { packagesApi } from '../../lib/api';
import type { PackageItem } from '../../types';

export function ClientPackageDetail() {
  const { id } = useParams<{ id: string }>();
  const [pkg, setPkg] = useState<PackageItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    packagesApi
      .get(id)
      .then(setPkg)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-slate-400">Chargement...</div>
      </DashboardLayout>
    );
  }

  if (!pkg) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-slate-500 mb-4">Colis non trouvé.</p>
          <Link to="/client" className="text-yellow-500 font-semibold hover:underline">
            Retour au tableau de bord
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back */}
        <Link to="/client" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                <Package className="w-7 h-7 text-slate-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{pkg.name}</h1>
                <p className="text-sm text-slate-400 font-mono mt-0.5">{pkg.trackingNumber}</p>
              </div>
            </div>
            <StatusBadge status={pkg.status} />
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Map placeholder */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-[400px] bg-slate-100 flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2394a3b8' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }} />
              <div className="text-center z-10">
                <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Carte interactive</p>
                <p className="text-xs text-slate-300 mt-1">
                  {pkg.originAddress} → {pkg.destinationAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Details sidebar */}
          <div className="space-y-4">
            {/* Route info */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Détails du trajet</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">Départ</p>
                    <p className="text-sm text-slate-700">{pkg.originAddress}</p>
                  </div>
                </div>
                <div className="ml-1 border-l-2 border-dashed border-slate-200 h-4" />
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">Arrivée</p>
                    <p className="text-sm text-slate-700">{pkg.destinationAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Informations</h3>
              <div className="space-y-2 text-sm">
                {pkg.transportMode && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transport</span>
                    <span className="font-medium text-slate-700">{pkg.transportMode}</span>
                  </div>
                )}
                {pkg.weightKg && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Poids</span>
                    <span className="font-medium text-slate-700">{pkg.weightKg} kg</span>
                  </div>
                )}
                {pkg.estimatedDuration && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Durée estimée</span>
                    <span className="font-medium text-slate-700">{pkg.estimatedDuration}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Créé le</span>
                  <span className="font-medium text-slate-700">
                    {new Date(pkg.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Events */}
            {pkg.trackingEvents && pkg.trackingEvents.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Historique
                </h3>
                <div className="space-y-3">
                  {pkg.trackingEvents.map((ev) => (
                    <div key={ev.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-slate-300 rounded-full mt-2 shrink-0" />
                      <div>
                        <p className="text-sm text-slate-700">{ev.description}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(ev.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {pkg.messages && pkg.messages.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Messages
                </h3>
                <div className="space-y-3">
                  {pkg.messages.map((msg) => (
                    <div key={msg.id} className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-700">{msg.subject}</p>
                      <p className="text-sm text-slate-600 mt-1">{msg.body}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {new Date(msg.sentAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
