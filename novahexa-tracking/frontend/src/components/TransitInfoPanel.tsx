import { useState } from 'react';
import {
  MapPin, Clock, Gauge, Route,
  ChevronDown, ChevronUp, Plus, Loader2, Trash2, GripVertical, Navigation,
} from 'lucide-react';
import type { PackageItem, Waypoint } from '../types';
import {
  totalRouteDistance, buildRoutePoints,
  getTraveledRatio, formatDuration, getTransportIcon, getTransportLabel,
  getTransportColor, reverseGeocode,
} from '../lib/mapUtils';
import { packagesApi } from '../lib/api';
import { ParcelMap } from './ParcelMap';
import { StatusBadge } from './StatusBadge';

const TRANSPORT_SPEEDS: Record<string, number> = { ROUTE: 80, AIR: 900, MER: 30 };

interface TransitInfoPanelProps {
  pkg: PackageItem;
  onRefresh: () => void;
}

export function TransitInfoPanel({ pkg, onRefresh }: TransitInfoPanelProps) {
  const [showWaypoints, setShowWaypoints] = useState(false);
  const [addingWaypoint, setAddingWaypoint] = useState(false);
  const [wpCoords, setWpCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [wpLabel, setWpLabel] = useState('');
  const [wpSaving, setWpSaving] = useState(false);
  // ── Calculs de transit ──
  const points = buildRoutePoints(pkg);
  const totalDistKm = points.length >= 2 ? totalRouteDistance(points) : 0;
  const speed = TRANSPORT_SPEEDS[pkg.transportMode ?? 'ROUTE'] ?? 80;
  const progress = pkg.status === 'IN_TRANSIT' ? getTraveledRatio(pkg) : pkg.status === 'DELIVERED' ? 1 : 0;
  const distanceRemaining = totalDistKm * (1 - progress);
  const distanceTraveled = totalDistKm * progress;
  const elapsedMin = pkg.transitStartedAt
    ? (Date.now() - new Date(pkg.transitStartedAt).getTime()) / 60000
    : 0;
  const effectiveDuration = pkg.demoDurationMinutes ?? (totalDistKm / speed) * 60;
  const etaMinutes = Math.max(0, effectiveDuration - elapsedMin);

  const sortedWps = [...(pkg.waypoints ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);

  // ── Waypoint management ──
  const handleMapClick = (lat: number, lng: number) => {
    setWpCoords({ lat, lng });
    setWpLabel('');
    reverseGeocode(lat, lng).then((name) => setWpLabel(name));
  };

  const handleAddWaypoint = async () => {
    if (!wpCoords || !wpLabel.trim()) return;
    setWpSaving(true);
    try {
      await packagesApi.addWaypoint(pkg.id, { label: wpLabel.trim(), lat: wpCoords.lat, lng: wpCoords.lng });
      onRefresh();
      setWpCoords(null);
      setWpLabel('');
    } catch { /* */ } finally { setWpSaving(false); }
  };

  const handleDeleteWaypoint = async (wp: Waypoint) => {
    try {
      await packagesApi.deleteWaypoint(pkg.id, String(wp.id));
      onRefresh();
    } catch { /* */ }
  };

  const isTransit = pkg.status === 'IN_TRANSIT';
  const isDelivered = pkg.status === 'DELIVERED';

  return (
    <div className="space-y-3">
      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-slate-900 text-sm">{pkg.name}</h3>
          <StatusBadge status={pkg.status} size="sm" />
        </div>
        <p className="text-[11px] text-slate-400 font-mono mb-3">{pkg.trackingNumber}</p>

        {/* ── Trajet ── */}
        <div className="relative pl-4 mb-4 space-y-3 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
          <div className="relative flex items-center gap-2">
            <div className="absolute -left-[1px] top-1 w-[12px] h-[12px] rounded-full bg-blue-500 ring-2 ring-blue-100" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-blue-500 font-bold uppercase">Départ</p>
              <p className="text-xs text-slate-700 font-medium truncate">{pkg.originAddress}</p>
            </div>
          </div>

          {/* Waypoints intermédiaires */}
          {sortedWps.map((wp, i) => (
            <div key={wp.id} className="relative flex items-center gap-2">
              <div className={`absolute -left-[1px] top-1 w-[10px] h-[10px] rounded-full ring-2 ${wp.reachedAt ? 'bg-emerald-500 ring-emerald-100' : 'bg-slate-400 ring-slate-100'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Arrêt #{i + 1}</p>
                <p className="text-xs text-slate-700 font-medium truncate">{wp.label}</p>
                {wp.reachedAt && (
                  <p className="text-[10px] text-emerald-600">✓ Atteint {new Date(wp.reachedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                )}
              </div>
              {showWaypoints && (
                <button onClick={() => handleDeleteWaypoint(wp)} className="text-red-400 hover:text-red-600 transition p-0.5">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          <div className="relative flex items-center gap-2">
            <div className="absolute -left-[1px] top-1 w-[12px] h-[12px] rounded-full bg-red-500 ring-2 ring-red-100" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-red-500 font-bold uppercase">Arrivée</p>
              <p className="text-xs text-slate-700 font-medium truncate">{pkg.destinationAddress}</p>
            </div>
          </div>
        </div>

        {/* ── Infos transport ── */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Mode</p>
            <p className="text-sm text-slate-800 font-bold flex items-center gap-1">
              <span>{getTransportIcon(pkg.transportMode)}</span>
              {getTransportLabel(pkg.transportMode)}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Vitesse</p>
            <p className="text-sm text-slate-800 font-bold">
              <Gauge className="inline w-3 h-3 text-slate-400 mr-1" />
              {speed} km/h
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Distance</p>
            <p className="text-sm text-slate-800 font-bold">
              <Route className="inline w-3 h-3 text-slate-400 mr-1" />
              {totalDistKm.toFixed(1)} km
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Durée</p>
            <p className="text-sm text-slate-800 font-bold">
              <Clock className="inline w-3 h-3 text-slate-400 mr-1" />
              {pkg.demoDurationMinutes ? formatDuration(pkg.demoDurationMinutes) : formatDuration(Math.round(effectiveDuration))}
            </p>
          </div>
        </div>

        {pkg.demoDurationMinutes && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            <p className="text-[10px] text-amber-600 font-bold uppercase">⏱ Mode démo</p>
            <p className="text-xs text-amber-700 font-medium">Durée compressée : {formatDuration(pkg.demoDurationMinutes)}</p>
          </div>
        )}

        {pkg.estimatedCost != null && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-3">
            <p className="text-[10px] text-emerald-600 font-bold uppercase">💰 Prix estimé</p>
            <p className="text-sm text-emerald-700 font-bold">{pkg.estimatedCost.toLocaleString('fr-FR')} €</p>
          </div>
        )}
      </div>

      {/* ── Barre de progression (si IN_TRANSIT) ── */}
      {isTransit && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-blue-500" />
              Progression en temps réel
            </h4>
            <span className="text-xs font-bold text-blue-600">{(progress * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(100, progress * 100)}%`,
                background: `linear-gradient(90deg, ${getTransportColor(pkg.transportMode)}88, ${getTransportColor(pkg.transportMode)})`,
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Parcouru</p>
              <p className="text-xs font-bold text-slate-700">{distanceTraveled.toFixed(0)} km</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Restant</p>
              <p className="text-xs font-bold text-slate-700">{distanceRemaining.toFixed(0)} km</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">ETA</p>
              <p className="text-xs font-bold text-amber-600">{formatDuration(Math.round(etaMinutes))}</p>
            </div>
          </div>
        </div>
      )}

      {isDelivered && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-sm text-emerald-700 font-bold">✅ Colis livré</p>
          <p className="text-xs text-emerald-600 mt-1">Distance totale : {totalDistKm.toFixed(1)} km</p>
        </div>
      )}

      {/* ── Gestion des arrêts ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowWaypoints(!showWaypoints)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition"
        >
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-yellow-500" />
            Arrêts ({sortedWps.length})
          </h4>
          {showWaypoints ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showWaypoints && (
          <div className="px-4 pb-4">
            {sortedWps.length === 0 && !addingWaypoint ? (
              <p className="text-xs text-slate-400 text-center py-3">Aucun arrêt défini</p>
            ) : (
              <div className="space-y-2 mb-3">
                {sortedWps.map((wp) => (
                  <div key={wp.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg group">
                    <GripVertical className="w-3 h-3 text-slate-300 shrink-0" />
                    <div className={`w-2 h-2 rounded-full shrink-0 ${wp.reachedAt ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{wp.label}</p>
                      <p className="text-[10px] text-slate-400">{wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}</p>
                    </div>
                    <button onClick={() => handleDeleteWaypoint(wp)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition p-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {addingWaypoint ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-yellow-700 font-bold uppercase">Nouvel arrêt</p>
                  <button onClick={() => { setAddingWaypoint(false); setWpCoords(null); setWpLabel(''); }} className="text-yellow-600 hover:text-yellow-800 text-xs font-medium">
                    Annuler
                  </button>
                </div>
                <p className="text-[10px] text-yellow-600 mb-2">
                  {wpCoords ? `${wpCoords.lat.toFixed(4)}, ${wpCoords.lng.toFixed(4)}` : 'Cliquez sur la carte pour placer l\'arrêt'}
                </p>
                {wpCoords && (
                  <>
                    <input
                      type="text"
                      value={wpLabel}
                      onChange={(e) => setWpLabel(e.target.value)}
                      placeholder="Label de l'arrêt"
                      className="w-full border border-yellow-300 rounded-lg px-3 py-1.5 text-xs mb-2 focus:outline-none focus:border-yellow-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddWaypoint()}
                    />
                    <button
                      onClick={handleAddWaypoint}
                      disabled={!wpLabel.trim() || wpSaving}
                      className="w-full bg-yellow-400 text-[#060f24] px-4 py-2 rounded-lg text-xs font-bold hover:bg-yellow-300 transition disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {wpSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                      {wpSaving ? 'Ajout...' : 'Ajouter'}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAddingWaypoint(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-500 hover:border-yellow-400 hover:text-yellow-600 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter un arrêt
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Carte des arrêts (si mode ajout) ── */}
      {addingWaypoint && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2 border-b border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase">
              {wpCoords ? '📍 Arrêt placé — modifiez le label ci-dessus' : '📍 Cliquez sur la carte pour placer l\'arrêt'}
            </p>
          </div>
          <ParcelMap
            pkg={pkg}
            height="250px"
            showPosition={true}
            editMode={true}
            onMapClick={handleMapClick}
          />
        </div>
      )}
    </div>
  );
}
