import { useState, useEffect } from 'react';
import { MapPin, Trash2, Plus, GripVertical } from 'lucide-react';
import { packagesApi } from '../lib/api';
import type { PackageItem, Waypoint } from '../types';
import { ParcelMap } from './ParcelMap';

interface WaypointManagerProps {
  pkg: PackageItem;
  onUpdate: (updated: PackageItem) => void;
}

export function WaypointManager({ pkg, onUpdate }: WaypointManagerProps) {
  const [waypoints, setWaypoints] = useState<Waypoint[]>(pkg.waypoints ?? []);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [label, setLabel] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setWaypoints(pkg.waypoints ?? []);
  }, [pkg.waypoints]);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
    setLabel('');
  };

  const handleAddWaypoint = async () => {
    if (!selectedCoords || !label.trim()) return;
    setAdding(true);
    try {
      await packagesApi.addWaypoint(pkg.id, {
        label: label.trim(),
        lat: selectedCoords.lat,
        lng: selectedCoords.lng,
      });
      // Reload package to get updated waypoints
      const updated = await packagesApi.getAdmin(pkg.id);
      setWaypoints(updated.waypoints ?? []);
      onUpdate(updated);
      setSelectedCoords(null);
      setLabel('');
    } catch {
      // silently fail
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteWaypoint = async (wp: Waypoint) => {
    if (!confirm(`Supprimer l'arrêt "${wp.label}" ?`)) return;
    try {
      await packagesApi.deleteWaypoint(pkg.id, String(wp.id));
      const updated = await packagesApi.getAdmin(pkg.id);
      setWaypoints(updated.waypoints ?? []);
      onUpdate(updated);
    } catch {
      // silently fail
    }
  };

  const sorted = [...waypoints].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="space-y-4">
      {/* Map with click-to-add */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-yellow-500" />
            Carte — cliquez pour ajouter un arrêt
          </h4>
          {selectedCoords && (
            <span className="text-[10px] text-slate-400">
              {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
            </span>
          )}
        </div>
        <ParcelMap
          pkg={pkg}
          height="350px"
          showPosition={true}
          readOnly={false}
          editMode={true}
          onMapClick={handleMapClick}
        />
      </div>

      {/* Add waypoint form */}
      {selectedCoords && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-yellow-700 font-semibold mb-1">
              Nouvel arrêt : {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
            </p>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label de l'arrêt (ex: Douala, Yaoundé...)"
              className="w-full border border-yellow-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-yellow-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAddWaypoint()}
            />
          </div>
          <button
            onClick={handleAddWaypoint}
            disabled={!label.trim() || adding}
            className="bg-yellow-400 text-[#060f24] px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-300 transition disabled:opacity-50 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            {adding ? '...' : 'Ajouter'}
          </button>
          <button
            onClick={() => { setSelectedCoords(null); setLabel(''); }}
            className="text-slate-400 hover:text-slate-600 text-xs"
          >
            Annuler
          </button>
        </div>
      )}

      {/* Waypoints list */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h4 className="font-bold text-slate-900 text-sm mb-3">
          Arrêts ({sorted.length})
        </h4>
        {sorted.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            Aucun arrêt défini. Cliquez sur la carte pour en ajouter.
          </p>
        ) : (
          <div className="space-y-2">
            {/* Origin */}
            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold text-blue-700">Départ</p>
                <p className="text-[11px] text-blue-600">{pkg.originAddress}</p>
              </div>
            </div>

            {/* Waypoints */}
            {sorted.map((wp, i) => (
              <div key={wp.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg group">
                <GripVertical className="w-3 h-3 text-slate-300 shrink-0" />
                <div className="w-2 h-2 bg-slate-400 rounded-full shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700">{wp.label}</p>
                  <p className="text-[10px] text-slate-400">
                    {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                    {wp.reachedAt && ' ✓ Atteint'}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400">#{i + 1}</span>
                <button
                  onClick={() => handleDeleteWaypoint(wp)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition p-1"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Destination */}
            <div className="flex items-center gap-3 p-2 bg-red-50 rounded-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold text-red-700">Arrivée</p>
                <p className="text-[11px] text-red-600">{pkg.destinationAddress}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
