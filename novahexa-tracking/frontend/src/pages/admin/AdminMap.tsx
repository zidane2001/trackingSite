import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Map as MapIcon, Plus, X, Loader2, Save, Package, MapPin, Trash2, ImagePlus } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { ParcelMap } from '../../components/ParcelMap';
import { StatusBadge } from '../../components/StatusBadge';
import { TransitInfoPanel } from '../../components/TransitInfoPanel';
import { packagesApi, adminUsersApi } from '../../lib/api';
import { useImageUpload } from '../../hooks/useImageUpload';
import type { ClientSummary } from '../../lib/api';
import type { PackageItem, TransportMode } from '../../types';
import { reverseGeocode } from '../../lib/mapUtils';

type Mode = 'view' | 'create' | 'edit';
type PlacingType = 'origin' | 'destination' | 'waypoint' | null;

interface PendingWaypoint {
  label: string;
  lat: number;
  lng: number;
  stopDurationMinutes: number;
}

export function AdminMap() {
  const location = useLocation();
  const navState = (location.state as { selectedId?: string; edit?: boolean } | null);
  const preselectedId = navState?.selectedId ?? null;
  const startInEdit = navState?.edit ?? false;
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<PackageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('view');
  const [clients, setClients] = useState<ClientSummary[]>([]);

  // Create form state
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    senderName: '',
    senderEmail: '',
    originAddress: '',
    destinationAddress: '',
    transportMode: 'ROUTE' as TransportMode,
    material: 'GENERAL' as string,
    weightKg: '',
    estimatedCost: '',
    demoDurationMinutes: '',
    ownerId: '',
  });
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [placingPoint, setPlacingPoint] = useState<PlacingType>(null);
  const [creating, setCreating] = useState(false);
  const [geocodingPoint, setGeocodingPoint] = useState<'origin' | 'destination' | null>(null);
  const { images: adminImages, previews: adminPreviews, uploading: adminUploading, fileRef: adminFileRef, handleUpload: adminHandleUpload, remove: adminRemoveImage, reset: adminResetImages } = useImageUpload();

  // ── Waypoint states ──
  const [pendingWaypoints, setPendingWaypoints] = useState<PendingWaypoint[]>([]);
  const [waypointLabel, setWaypointLabel] = useState('');
  const [waypointCoords, setWaypointCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [waypointStopMinutes, setWaypointStopMinutes] = useState('');

  // startEdit is declared early so loadPackages can reference it
  const startEdit = (pkg: PackageItem) => {
    setSelectedPkg(pkg);
    setCreateForm({
      name: pkg.name,
      description: pkg.description || '',
      senderName: pkg.senderName || '',
      senderEmail: pkg.senderEmail || '',
      originAddress: pkg.originAddress,
      destinationAddress: pkg.destinationAddress,
      transportMode: (pkg.transportMode as TransportMode) || 'ROUTE',
      material: pkg.material || 'GENERAL',
      weightKg: pkg.weightKg != null ? String(pkg.weightKg) : '',
      estimatedCost: pkg.estimatedCost != null ? String(pkg.estimatedCost) : '',
      demoDurationMinutes: pkg.demoDurationMinutes != null ? String(pkg.demoDurationMinutes) : '',
      ownerId: pkg.ownerId || '',
    });
    setPendingWaypoints([]);
    setWaypointCoords(null);
    setWaypointLabel('');
    adminResetImages();
    setMode('edit');
  };

  // Load packages
  const loadPackages = useCallback(() => {
    packagesApi
      .list()
      .then((data) => {
        setPackages(data);
        if (preselectedId) {
          const match = data.find((p) => p.id === preselectedId);
          if (match) {
            setSelectedPkg(match);
            if (startInEdit) {
              startEdit(match);
            } else {
              setMode('view');
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [preselectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadPackages(); }, [loadPackages]);

  // Load clients when entering create mode
  useEffect(() => {
    if (mode === 'create' && clients.length === 0) {
      adminUsersApi.list().then(setClients).catch(() => {});
    }
  }, [mode, clients.length]);

  const activePkgs = packages.filter(
    (p) => p.status === 'IN_TRANSIT' || p.status === 'VALIDATED',
  );

  const resetForm = () => {
    setCreateForm({
      name: '', description: '', senderName: '', senderEmail: '',
      originAddress: '', destinationAddress: '',
      transportMode: 'ROUTE', material: 'GENERAL', weightKg: '',
      estimatedCost: '', demoDurationMinutes: '', ownerId: '',
    });
    setOriginCoords(null);
    setDestCoords(null);
    setPendingWaypoints([]);
    setWaypointCoords(null);
    setWaypointLabel('');
    adminResetImages();
  };

  // ── Map click handler ──
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (mode !== 'create' && mode !== 'edit') return;

    // Waypoint placement
    if (placingPoint === 'waypoint') {
      setWaypointCoords({ lat, lng });
      setWaypointLabel('');
      setPlacingPoint(null);
      return;
    }

    // Origin / destination placement (create mode only)
    if (mode !== 'create' || !placingPoint) return;
    const pointType = placingPoint as 'origin' | 'destination';

    if (pointType === 'origin') {
      setOriginCoords({ lat, lng });
      setCreateForm(f => ({ ...f, originAddress: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }));
    } else {
      setDestCoords({ lat, lng });
      setCreateForm(f => ({ ...f, destinationAddress: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }));
    }
    setPlacingPoint(null);

    // Reverse geocode (non-blocking)
    setGeocodingPoint(pointType);
    reverseGeocode(lat, lng).then((name) => {
      const field = pointType === 'origin' ? 'originAddress' : 'destinationAddress';
      setCreateForm(f => ({ ...f, [field]: name }));
    }).finally(() => setGeocodingPoint(null));
  }, [mode, placingPoint]);

  // ── Add pending waypoint ──
  const addPendingWaypoint = () => {
    if (!waypointCoords || !waypointLabel.trim()) return;
    setPendingWaypoints(prev => [...prev, {
      label: waypointLabel.trim(),
      lat: waypointCoords.lat,
      lng: waypointCoords.lng,
      stopDurationMinutes: waypointStopMinutes ? parseInt(waypointStopMinutes) || 0 : 0,
    }]);
    setWaypointCoords(null);
    setWaypointLabel('');
    setWaypointStopMinutes('');
  };

  const removePendingWaypoint = (index: number) => {
    setPendingWaypoints(prev => prev.filter((_, i) => i !== index));
  };

  // ── Create parcel ──
  const handleCreate = async () => {
    if (!originCoords || !destCoords) return;
    setCreating(true);
    try {
      const created = await packagesApi.createForClient({
        name: createForm.name || 'Colis sans nom',
        description: createForm.description,
        senderName: createForm.senderName,
        senderEmail: createForm.senderEmail,
        originAddress: createForm.originAddress,
        originLat: originCoords.lat,
        originLng: originCoords.lng,
        destinationAddress: createForm.destinationAddress,
        destinationLat: destCoords.lat,
        destinationLng: destCoords.lng,
        transportMode: createForm.transportMode,
        material: createForm.material,
        weightKg: createForm.weightKg ? parseFloat(createForm.weightKg) : null,
        estimatedCost: createForm.estimatedCost ? parseFloat(createForm.estimatedCost) : null,
        demoDurationMinutes: createForm.demoDurationMinutes ? parseInt(createForm.demoDurationMinutes) : null,
        ownerId: createForm.ownerId || null,
        imageUrls: adminImages.length > 0 ? adminImages : undefined,
      });

      // Persist pending waypoints sequentially
      for (const wp of pendingWaypoints) {
        await packagesApi.addWaypoint(created.id, {
          label: wp.label,
          lat: wp.lat,
          lng: wp.lng,
          stopDurationMinutes: wp.stopDurationMinutes || undefined,
        });
      }

      // Reload and select the new parcel
      const refreshed = await packagesApi.list();
      setPackages(refreshed);
      const match = refreshed.find((p) => p.id === created.id);
      if (match) {
        setSelectedPkg(match);
      }
      setMode('view');
      resetForm();
    } catch {
      // error handled silently
    } finally {
      setCreating(false);
    }
  };

  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setCreateForm(f => ({ ...f, [k]: e.target.value }));

  // ── Edit parcel ──
  const handleEdit = async () => {
    if (!selectedPkg) return;
    setCreating(true);
    try {
      await packagesApi.update(selectedPkg.id, {
        name: createForm.name || undefined,
        description: createForm.description || undefined,
        originAddress: createForm.originAddress || undefined,
        destinationAddress: createForm.destinationAddress || undefined,
        transportMode: createForm.transportMode as TransportMode || undefined,
        material: createForm.material || undefined,
        weightKg: createForm.weightKg ? parseFloat(createForm.weightKg) : undefined,
        estimatedCost: createForm.estimatedCost ? parseFloat(createForm.estimatedCost) : undefined,
      });

      // Persist new waypoints (existing ones already saved)
      for (const wp of pendingWaypoints) {
        await packagesApi.addWaypoint(selectedPkg.id, {
          label: wp.label,
          lat: wp.lat,
          lng: wp.lng,
          stopDurationMinutes: wp.stopDurationMinutes || undefined,
        });
      }

      setMode('view');
      resetForm();
      loadPackages();
    } catch { /* */ } finally { setCreating(false); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 sm:gap-3">
              <MapIcon className="w-6 h-6 text-yellow-500" />
              {mode === 'create' ? 'Créer un colis' : mode === 'edit' ? 'Modifier le colis' : 'Carte globale'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {mode === 'create'
                ? 'Cliquez sur la carte pour placer les points de départ et d\'arrivée'
                : 'Vue d\'ensemble de tous les colis actifs'}
            </p>
          </div>
          {mode === 'view' ? (
            <button
              onClick={() => setMode('create')}
              className="flex items-center gap-2 px-4 py-2.5 bg-yellow-400 text-[#060f24] rounded-xl font-bold text-sm hover:bg-yellow-300 transition"
            >
              <Plus className="w-4 h-4" />
              Créer un colis
            </button>
          ) : (
            <button
              onClick={() => { setMode('view'); setOriginCoords(null); setDestCoords(null); setPlacingPoint(null); resetForm(); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-4 sm:gap-6">
          {/* Map */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-[300px] sm:h-[400px] lg:h-[600px] relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-sm text-slate-400">Chargement de la carte…</p>
                  </div>
                </div>
              ) : (
                <>
                  <ParcelMap
                    pkg={selectedPkg ?? activePkgs[0] ?? packages[0] ?? { id: '', trackingNumber: '', name: '', status: 'PENDING', originAddress: '', destinationAddress: '', createdAt: '' } as PackageItem}
                    height="600px"
                    showAll={mode === 'view' && !selectedPkg}
                    allPackages={mode === 'view' ? activePkgs : []}
                    showPosition={true}
                    editMode={(mode === 'create' || mode === 'edit') && !!placingPoint}
                    onMapClick={handleMapClick}
                    onParcelClick={(p) => { setSelectedPkg(p); setMode('view'); }}
                  />

                  {/* Placing point indicator */}
                  {placingPoint && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#060f24] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg z-[1000] animate-pulse">
                      📍 Cliquez sur la carte pour placer : {
                        placingPoint === 'origin' ? 'point de départ' :
                        placingPoint === 'destination' ? 'point d\'arrivée' :
                        'l\'arrêt intermédiaire'
                      }
                    </div>
                  )}

                  {/* Package list overlay (view mode) */}
                  {mode === 'view' && (
                    <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg border border-slate-200 p-4 max-w-xs max-h-64 overflow-y-auto z-[1000]">
                      <h4 className="font-bold text-slate-900 text-sm mb-3">Colis actifs</h4>
                      {activePkgs.length === 0 ? (
                        <p className="text-xs text-slate-400">Aucun colis actif</p>
                      ) : (
                        <div className="space-y-2">
                          {activePkgs.map((pkg) => (
                            <button
                              key={pkg.id}
                              onClick={() => setSelectedPkg(pkg)}
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
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
            {(mode === 'create' || mode === 'edit') ? (
              /* ── Create / Edit form ── */
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-yellow-500" />
                  {mode === 'edit' ? 'Modifier le colis' : 'Nouveau colis'}
                </h3>

                {/* Origin */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Point de départ</label>
                  {originCoords ? (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm text-emerald-700">
                      <span className="text-emerald-500">●</span>
                      <span className="flex-1 min-w-0">
                        {geocodingPoint === 'origin' ? (
                          <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Localisation...</span>
                        ) : (
                          <span className="truncate block" title={`${originCoords.lat.toFixed(5)}, ${originCoords.lng.toFixed(5)}`}>{createForm.originAddress || `${originCoords.lat.toFixed(5)}, ${originCoords.lng.toFixed(5)}`}</span>
                        )}
                      </span>
                      <button onClick={() => { setOriginCoords(null); setCreateForm(f => ({ ...f, originAddress: '' })); }} className="ml-auto text-emerald-400 hover:text-emerald-600 shrink-0"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPlacingPoint('origin')}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border-2 border-dashed transition ${
                        placingPoint === 'origin' ? 'border-yellow-400 bg-yellow-50 text-yellow-700' : 'border-slate-300 text-slate-500 hover:border-yellow-300'
                      }`}
                    >
                      <MapIcon className="w-4 h-4" />
                      {placingPoint === 'origin' ? 'En attente du clic...' : 'Cliquer sur la carte'}
                    </button>
                  )}
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Point d'arrivée</label>
                  {destCoords ? (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                      <span className="text-red-500">●</span>
                      <span className="flex-1 min-w-0">
                        {geocodingPoint === 'destination' ? (
                          <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Localisation...</span>
                        ) : (
                          <span className="truncate block" title={`${destCoords.lat.toFixed(5)}, ${destCoords.lng.toFixed(5)}`}>{createForm.destinationAddress || `${destCoords.lat.toFixed(5)}, ${destCoords.lng.toFixed(5)}`}</span>
                        )}
                      </span>
                      <button onClick={() => { setDestCoords(null); setCreateForm(f => ({ ...f, destinationAddress: '' })); }} className="ml-auto text-red-400 hover:text-red-600 shrink-0"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPlacingPoint('destination')}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border-2 border-dashed transition ${
                        placingPoint === 'destination' ? 'border-yellow-400 bg-yellow-50 text-yellow-700' : 'border-slate-300 text-slate-500 hover:border-yellow-300'
                      }`}
                    >
                      <MapIcon className="w-4 h-4" />
                      {placingPoint === 'destination' ? 'En attente du clic...' : 'Cliquer sur la carte'}
                    </button>
                  )}
                </div>

                {/* ── WAYPOINTS SECTION ── */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-yellow-500" />
                      Arrêts intermédiaires
                      {pendingWaypoints.length > 0 && (
                        <span className="bg-yellow-400 text-[#060f24] text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                          {pendingWaypoints.length}
                        </span>
                      )}
                    </label>
                    <button
                      type="button"
                      onClick={() => setPlacingPoint('waypoint')}
                      className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md transition ${
                        placingPoint === 'waypoint'
                          ? 'bg-yellow-400 text-[#060f24] animate-pulse'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      {placingPoint === 'waypoint' ? 'Cliquez sur la carte...' : 'Ajouter un arrêt'}
                    </button>
                  </div>

                  {/* Pending waypoint input */}
                  {waypointCoords && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2 space-y-2">
                      <p className="text-[10px] text-yellow-700 font-semibold">
                        📍 {waypointCoords.lat.toFixed(4)}, {waypointCoords.lng.toFixed(4)}
                      </p>
                      <input
                        type="text"
                        value={waypointLabel}
                        onChange={(e) => setWaypointLabel(e.target.value)}
                        placeholder="Nom de l'arrêt (ex: Douala, Yaoundé...)"
                        className="w-full border border-yellow-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-yellow-500"
                        onKeyDown={(e) => e.key === 'Enter' && addPendingWaypoint()}
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] text-yellow-700 font-semibold whitespace-nowrap">Arrêt (min) :</label>
                        <input
                          type="number"
                          min="0"
                          value={waypointStopMinutes}
                          onChange={(e) => setWaypointStopMinutes(e.target.value)}
                          placeholder="0"
                          className="w-16 border border-yellow-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-yellow-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={addPendingWaypoint}
                          disabled={!waypointLabel.trim()}
                          className="bg-yellow-400 text-[#060f24] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-300 transition disabled:opacity-50 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Ajouter
                        </button>
                        <button
                          onClick={() => { setWaypointCoords(null); setWaypointLabel(''); }}
                          className="text-slate-400 hover:text-slate-600 text-xs px-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Waypoints list */}
                  {pendingWaypoints.length > 0 && (
                    <div className="space-y-1.5">
                      {pendingWaypoints.map((wp, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg group">
                          <span className="w-4 h-4 bg-yellow-400 text-[#060f24] rounded-full flex items-center justify-center text-[9px] font-bold shrink-0">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700 truncate">{wp.label}</p>
                            <p className="text-[10px] text-slate-400">{wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}{wp.stopDurationMinutes > 0 ? ` · ⏸ ${wp.stopDurationMinutes} min` : ''}</p>
                          </div>
                          <button
                            onClick={() => removePendingWaypoint(i)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition p-1"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {pendingWaypoints.length === 0 && !waypointCoords && (
                    <p className="text-[10px] text-slate-400 text-center py-2">
                      Aucun arrêt. Cliquez sur "Ajouter un arrêt" puis sur la carte.
                    </p>
                  )}
                </div>

                {/* Client */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Client</label>
                  <select value={createForm.ownerId} onChange={setField('ownerId')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition">
                    <option value="">— Aucun client —</option>
                    {clients.filter(c => c.role === 'CLIENT').map(c => (
                      <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>
                    ))}
                  </select>
                </div>

                {/* Name & Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nom du colis</label>
                  <input value={createForm.name} onChange={setField('name')} placeholder="Ex: Document important" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                  <textarea rows={2} value={createForm.description} onChange={setField('description')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition resize-none" />
                </div>

                {/* Transport & Material */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Transport</label>
                    <select value={createForm.transportMode} onChange={setField('transportMode')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition">
                      <option value="ROUTE">🚛 Routier (~80 km/h)</option>
                      <option value="AIR">✈️ Aérien (~900 km/h)</option>
                      <option value="MER">🚢 Maritime (~30 km/h)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Matériel</label>
                    <select value={createForm.material} onChange={setField('material')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition">
                      <option value="GENERAL">Général</option>
                      <option value="FRAGILE">Fragile</option>
                      <option value="ELECTRONIQUE">Électronique</option>
                      <option value="AUTO_PARTS">Pièces auto</option>
                      <option value="DOCUMENTS">Documents</option>
                    </select>
                  </div>
                </div>

                {/* Weight & Cost & Duration */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Poids (kg)</label>
                    <input type="number" min="0" step="0.1" value={createForm.weightKg} onChange={setField('weightKg')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Prix (€)</label>
                    <input type="number" min="0" step="0.01" value={createForm.estimatedCost} onChange={setField('estimatedCost')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Durée démo (min)</label>
                    <input type="number" min="1" value={createForm.demoDurationMinutes} onChange={setField('demoDurationMinutes')} placeholder="Ex: 5" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition" />
                  </div>
                </div>

                {/* Sender info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nom expéditeur</label>
                    <input value={createForm.senderName} onChange={setField('senderName')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Email expéditeur</label>
                    <input type="email" value={createForm.senderEmail} onChange={setField('senderEmail')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition" />
                  </div>
                </div>

                {/* Images */}
                <div>
                  <button
                    type="button"
                    onClick={() => adminFileRef.current?.click()}
                    disabled={adminUploading}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-yellow-500 transition font-medium"
                  >
                    {adminUploading ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Envoi…</>
                    ) : (
                      <><ImagePlus className="w-3.5 h-3.5" /> Photos du colis (optionnel)</>
                    )}
                  </button>
                  <input
                    ref={adminFileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={adminHandleUpload}
                  />
                  {adminPreviews.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                      {adminPreviews.map((src, i) => (
                        <div key={i} className="relative shrink-0 group">
                          <img src={src} alt={`Photo ${i + 1}`} className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                          <button
                            type="button"
                            onClick={() => adminRemoveImage(i)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  onClick={mode === 'edit' ? handleEdit : handleCreate}
                  disabled={mode === 'create' ? (!originCoords || !destCoords || creating) : creating}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-400 text-[#060f24] px-5 py-3 rounded-xl font-bold text-sm hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {creating ? 'Enregistrement...' : (mode === 'edit' ? 'Enregistrer les modifications' : 'Créer et valider le colis')}
                </button>
              </div>
            ) : selectedPkg ? (
              /* ── Package detail with TransitInfoPanel ── */
              <>
                <TransitInfoPanel pkg={selectedPkg} onRefresh={loadPackages} />

                {/* Quick actions */}
                {selectedPkg.status === 'VALIDATED' && (
                  <button
                    onClick={async () => {
                      await packagesApi.setInTransit(selectedPkg.trackingNumber);
                      loadPackages();
                      setSelectedPkg(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition"
                  >
                    🚀 Mettre en transit
                  </button>
                )}
                {selectedPkg.status === 'IN_TRANSIT' && (
                  <button
                    onClick={async () => {
                      await packagesApi.setDelivered(selectedPkg.trackingNumber);
                      loadPackages();
                      setSelectedPkg(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition"
                  >
                    ✅ Marquer comme livré
                  </button>
                )}
                <button
                  onClick={() => setSelectedPkg(null)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition"
                >
                  Fermer
                </button>
              </>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
                <MapIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Sélectionnez un colis ou créez-en un nouveau</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
