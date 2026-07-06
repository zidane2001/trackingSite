import { useState } from 'react';
import { Search, Package, Clock, Truck, Plane, Ship } from 'lucide-react';
import { packagesApi } from '../lib/api';
import { ParcelMap } from '../components/ParcelMap';
import { TrackingQR } from '../components/TrackingQR';
import type { PackageItem } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../types';
import { PhotoGallery } from '../components/PhotoGallery';

export function Tracking() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [result, setResult] = useState<PackageItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const pkg = await packagesApi.getByTracking(trackingNumber.trim());
      setResult(pkg);
    } catch {
      setError('Numéro de suivi introuvable. Veuillez vérifier et réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const renderTransportIcon = (mode?: string) => {
    if (mode === 'AIR') return <Plane className="w-5 h-5 text-yellow-500" />;
    if (mode === 'MER') return <Ship className="w-5 h-5 text-yellow-500" />;
    return <Truck className="w-5 h-5 text-yellow-500" />;
  };

  return (
    <div className="bg-[#eef2f6] min-h-screen">
      {/* Search section */}
      <section className="bg-[#060f24] py-10 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-yellow-400 text-xs font-bold uppercase tracking-[0.2em]">
            Suivi public
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-3 mb-5">
            Suivre votre envoi
          </h1>
          <p className="text-slate-300 mb-8">
            Entrez votre numéro de suivi pour connaître la position de votre colis en temps réel.
          </p>

          <form onSubmit={handleSearch} className="flex h-12 sm:h-14 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Ex : YL-12345678-FR"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="flex-1 bg-[#0a1530] border border-white/10 rounded-l-xl px-5 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400/50 text-sm"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-400 text-[#060f24] px-6 rounded-r-xl font-bold text-sm hover:bg-yellow-300 transition flex items-center gap-2 disabled:opacity-60"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {error && (
          <div className="bg-white rounded-xl border border-red-200 p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{result.name}</h2>
                  <p className="text-sm text-slate-400 font-mono">{result.trackingNumber}</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 font-bold text-xs px-3 py-1.5 rounded-md border ${STATUS_COLORS[result.status]}`}>
                {STATUS_LABELS[result.status]}
              </span>
            </div>

            {/* Status info */}
            {result.status === 'PENDING' && (
              <div className="px-6 py-4 bg-amber-50 border-b border-amber-100">
                <p className="text-sm text-amber-700">
                  Votre colis est en cours de traitement par notre équipe. Il sera bientôt validé et visible publiquement.
                </p>
              </div>
            )}

            {/* Real Leaflet map */}
            <div className="relative">
              <ParcelMap pkg={result} height="280px" showPosition={true} />
            </div>

            {/* Photos */}
            <PhotoGallery imageUrls={result.imageUrls ?? []} className="!rounded-none !border-0 !border-b !border-slate-100" />

            {/* QR Code */}
            <div className="px-6 py-4 border-b border-slate-100">
              <TrackingQR
                trackingNumber={result.trackingNumber}
                name={result.name}
                origin={result.originAddress}
                destination={result.destinationAddress}
                size={120}
                showLabel={true}
              />
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Départ</p>
                  <p className="text-sm text-slate-700 font-medium">{result.originAddress}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Arrivée</p>
                  <p className="text-sm text-slate-700 font-medium">{result.destinationAddress}</p>
                </div>
              </div>

              {result.transportMode && (
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  {renderTransportIcon(result.transportMode)}
                  <span className="text-sm text-slate-600">Transport : <strong>{result.transportMode}</strong></span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                <Clock className="w-3.5 h-3.5" />
                Dernière mise à jour : {result.updatedAt ? new Date(result.updatedAt).toLocaleString('fr-FR') : '—'}
              </div>
            </div>

            {/* Events timeline */}
            {result.trackingEvents && result.trackingEvents.length > 0 && (
              <div className="px-6 pb-6">
                <h3 className="font-bold text-slate-900 text-sm mb-4">Historique</h3>
                <div className="space-y-3">
                  {result.trackingEvents.map((ev) => (
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
          </div>
        )}

        {!result && !error && !loading && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400">Entrez un numéro de suivi pour voir les résultats</p>
          </div>
        )}
      </section>
    </div>
  );
}
