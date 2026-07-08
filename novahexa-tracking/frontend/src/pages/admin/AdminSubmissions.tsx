import React, { useEffect, useState } from 'react';
import { ClipboardCheck, Check, X, Loader2, Pencil, Save, ImagePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../../components/DashboardLayout';

import { packagesApi } from '../../lib/api';
import type { PackageItem } from '../../types';
import { cn } from '../../lib/utils';
import { useImageUpload } from '../../hooks/useImageUpload';

export function AdminSubmissions() {
  const { t } = useTranslation();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PackageItem | null>(null);
  const [refusalReason, setRefusalReason] = useState('');
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [validateForm, setValidateForm] = useState({ price: '', demoDurationMinutes: '' });
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [pendingValidate, setPendingValidate] = useState<PackageItem | null>(null);
  const { images: validateImages, previews: validatePreviews, uploading: uploadingImages, fileRef: validateFileRef, handleUpload, remove: removeValidateImage, reset: resetValidateImages } = useImageUpload();

  const loadPackages = () => {
    packagesApi.list().then((pkgs) => {
      setPackages(pkgs.filter((p) => p.status === 'PENDING'));
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadPackages(); }, []);

  const handleValidate = async (pkg: PackageItem) => {
    setProcessing(true);
    try {
      const data: Record<string, unknown> = {};
      if (validateForm.price) data.price = parseFloat(validateForm.price);
      if (validateForm.demoDurationMinutes) data.demoDurationMinutes = parseInt(validateForm.demoDurationMinutes);
      if (validateImages.length > 0) data.imageUrls = validateImages;
      await packagesApi.validate(pkg.trackingNumber, Object.keys(data).length > 0 ? data : undefined);
      setSelected(null);
      setShowValidateModal(false);
      setPendingValidate(null);
      setValidateForm({ price: '', demoDurationMinutes: '' });
      resetValidateImages();
      loadPackages();
    } catch { /* ignore */ } finally { setProcessing(false); }
  };

  const openValidateModal = (pkg: PackageItem) => {
    setPendingValidate(pkg);
    setValidateForm({
      price: pkg.estimatedCost?.toString() || '',
      demoDurationMinutes: pkg.demoDurationMinutes?.toString() || '',
    });
    resetValidateImages();
    setShowValidateModal(true);
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

  const startEdit = (pkg: PackageItem) => {
    setEditForm({
      name: pkg.name || '',
      description: pkg.description || '',
      originAddress: pkg.originAddress || '',
      destinationAddress: pkg.destinationAddress || '',
      transportMode: pkg.transportMode || '',
      customDeliveryDelay: pkg.customDeliveryDelay || '',
      material: pkg.material || '',
      weightKg: pkg.weightKg?.toString() || '',
      heightCm: pkg.heightCm?.toString() || '',
      widthCm: pkg.widthCm?.toString() || '',
      lengthCm: pkg.lengthCm?.toString() || '',
    });
    setEditing(true);
  };

  const saveEdit = async (pkg: PackageItem) => {
    setProcessing(true);
    try {
      await packagesApi.update(pkg.id, {
        name: editForm.name,
        description: editForm.description,
        originAddress: editForm.originAddress,
        destinationAddress: editForm.destinationAddress,
        transportMode: editForm.transportMode || undefined,
        customDeliveryDelay: editForm.customDeliveryDelay || undefined,
        material: editForm.material || undefined,
        weightKg: editForm.weightKg ? parseFloat(editForm.weightKg) : undefined,
        heightCm: editForm.heightCm ? parseInt(editForm.heightCm) : undefined,
        widthCm: editForm.widthCm ? parseInt(editForm.widthCm) : undefined,
        lengthCm: editForm.lengthCm ? parseInt(editForm.lengthCm) : undefined,
      });
      setEditing(false);
      loadPackages();
    } catch { /* ignore */ } finally { setProcessing(false); }
  };

  const setEditField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setEditForm((f) => ({ ...f, [k]: e.target.value }));

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
                        {t('common.loading')}
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
                onClick={() => { if (!editing || selected?.id !== pkg.id) { setSelected(selected?.id === pkg.id ? null : pkg); setEditing(false); } }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between cursor-pointer gap-2">
                  <div className="flex items-center gap-3 sm:gap-4">
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
                    {editing ? (
                      /* ── Edit mode ── */
                      <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Nom du colis</label>
                            <input value={editForm.name} onChange={setEditField('name')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                            <input value={editForm.description} onChange={setEditField('description')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Adresse de départ</label>
                            <input value={editForm.originAddress} onChange={setEditField('originAddress')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Adresse d'arrivée</label>
                            <input value={editForm.destinationAddress} onChange={setEditField('destinationAddress')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Transport</label>
                            <select value={editForm.transportMode} onChange={setEditField('transportMode')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition">
                              <option value="">—</option>
                              <option value="ROUTE">Routier</option>
                              <option value="AIR">Aérien</option>
                              <option value="MER">Maritime</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Matériel</label>
                            <select value={editForm.material} onChange={setEditField('material')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition">
                              <option value="">—</option>
                              <option value="GENERAL">Général</option>
                              <option value="FRAGILE">Fragile</option>
                              <option value="ELECTRONIQUE">Électronique</option>
                              <option value="AUTO_PARTS">Pièces auto</option>
                              <option value="DOCUMENTS">Documents</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Jours de livraison</label>
                            <input type="number" min="1" value={editForm.customDeliveryDelay} onChange={setEditField('customDeliveryDelay')} placeholder="Ex: 7" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Poids (kg)</label>
                            <input type="number" min="0" step="0.1" value={editForm.weightKg} onChange={setEditField('weightKg')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Hauteur (cm)</label>
                            <input type="number" min="0" value={editForm.heightCm} onChange={setEditField('heightCm')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Largeur (cm)</label>
                            <input type="number" min="0" value={editForm.widthCm} onChange={setEditField('widthCm')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Longueur (cm)</label>
                            <input type="number" min="0" value={editForm.lengthCm} onChange={setEditField('lengthCm')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                          <button onClick={() => saveEdit(pkg)} disabled={processing} className="bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-600 transition flex items-center gap-2 disabled:opacity-50">
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Sauvegarder les modifications
                          </button>
                          <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium">Annuler</button>
                        </div>
                      </div>
                    ) : (
                      /* ── View mode ── */
                      <>
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
                            <div className="text-sm">
                              <span className="text-slate-500">Délai de livraison : </span>
                              <span className="font-medium">{pkg.customDeliveryDelay ? (() => { const n = parseInt(pkg.customDeliveryDelay); return !isNaN(n) ? `${n} jour${n > 1 ? 's' : ''}` : pkg.customDeliveryDelay; })() : pkg.deliveryDelay || '—'}</span>
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

                        {(pkg.imageUrls && pkg.imageUrls.length > 0) && (
                          <div className="mb-4">
                            <p className="text-xs text-slate-500 mb-2 font-semibold">Photos du colis :</p>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {pkg.imageUrls.map((url, i) => (
                                <img key={i} src={url} alt={`Photo ${i + 1}`} className="w-32 h-32 object-cover rounded-lg border shrink-0" />
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); openValidateModal(pkg); }}
                            disabled={processing}
                            className="bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-600 transition flex items-center gap-2 disabled:opacity-50"
                          >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Valider
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); startEdit(pkg); }}
                            disabled={processing}
                            className="bg-amber-50 text-amber-700 border border-amber-200 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-amber-100 transition flex items-center gap-2 disabled:opacity-50"
                          >
                            <Pencil className="w-4 h-4" />
                            Modifier
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
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Validate modal — prix + durée démo */}
        {showValidateModal && pendingValidate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="font-bold text-slate-900 mb-2">Valider la soumission</h3>
              <p className="text-sm text-slate-500 mb-4">
                Définissez le prix et la durée démo pour <strong>{pendingValidate.name}</strong>.
              </p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Prix (€)</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={validateForm.price}
                    onChange={(e) => setValidateForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="Ex: 150.00"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Durée démo (minutes)</label>
                  <input
                    type="number" min="1"
                    value={validateForm.demoDurationMinutes}
                    onChange={(e) => setValidateForm(f => ({ ...f, demoDurationMinutes: e.target.value }))}
                    placeholder="Ex: 5"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Durée compressée pour la démo (ex: 5 min pour un trajet de 7h)</p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => validateFileRef.current?.click()}
                    disabled={uploadingImages}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-yellow-500 transition font-medium"
                  >
                    {uploadingImages ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Envoi…</>
                    ) : (
                      <><ImagePlus className="w-3.5 h-3.5" /> Ajouter des photos du colis</>
                    )}
                  </button>
                  <input
                    ref={validateFileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleUpload}
                  />
                  {validatePreviews.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                      {validatePreviews.map((src, i) => (
                        <div key={i} className="relative shrink-0 group">
                          <img src={src} alt={`Photo ${i + 1}`} className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                          <button
                            type="button"
                            onClick={() => removeValidateImage(i)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => { setShowValidateModal(false); setPendingValidate(null); resetValidateImages(); }}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={() => pendingValidate && handleValidate(pendingValidate)}
                  disabled={processing}
                  className="bg-emerald-500 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-emerald-600 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Confirmer la validation
                </button>
              </div>
            </div>
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
