import { useEffect, useState } from 'react';
import { HelpCircle, Plus, Save, Trash2, Pencil, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../../components/DashboardLayout';
import { faqApi } from '../../lib/api';
import type { FaqItem } from '../../types';

export function AdminFaq() {
  const { t } = useTranslation();
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => { load(); }, []);

  const load = () => {
    faqApi.listAll().then(setItems).catch(() => {}).finally(() => setLoading(false));
  };

  const startNew = () => {
    setEditing({ id: '', question: '', answer: '', sortOrder: items.length, enabled: true, createdAt: '' });
    setIsNew(true);
  };

  const handleSave = async () => {
    if (!editing || !editing.question.trim() || !editing.answer.trim()) return;
    setSaving(true);
    try {
      if (isNew) {
        const created = await faqApi.create(editing);
        setItems((prev) => [...prev, created]);
      } else {
        const updated = await faqApi.update(editing.id, editing);
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      }
      setEditing(null);
      setIsNew(false);
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const handleDelete = async (item: FaqItem) => {
    if (!confirm(`Supprimer cette question ?`)) return;
    await faqApi.delete(item.id).catch(() => {});
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    if (editing?.id === item.id) setEditing(null);
  };

  const toggleEnabled = async (item: FaqItem) => {
    const updated = await faqApi.update(item.id, { ...item, enabled: !item.enabled }).catch(() => null);
    if (updated) setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 sm:gap-3">
              <HelpCircle className="w-6 h-6 text-yellow-500" />
              Gestion FAQ
            </h1>
            <p className="text-sm text-slate-500 mt-1">{items.length} question{items.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={startNew} disabled={!!editing} className="bg-yellow-400 text-[#060f24] px-4 py-2 rounded-lg font-bold text-sm hover:bg-yellow-300 transition flex items-center gap-2 disabled:opacity-50 shrink-0">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">{t('common.loading')}</div>
        ) : items.length === 0 && !isNew ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Aucune question FAQ</p>
            <p className="text-sm text-slate-400 mt-1">Commencez par ajouter une question</p>
          </div>
        ) : (
          <div className="space-y-3">
            {isNew && editing && (
              <div className="bg-white rounded-xl border-2 border-yellow-400 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 text-sm mb-4">Nouvelle question</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Question" value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 transition" />
                  <textarea rows={4} placeholder="Réponse" value={editing.answer} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 transition resize-none" />
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-slate-500">Ordre :</label>
                      <input type="number" min={0} value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value) || 0 })} className="w-20 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-yellow-400 transition" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editing.enabled} onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })} className="rounded border-slate-300 text-yellow-500 focus:ring-yellow-400" />
                      <span className="text-sm text-slate-700">Activée</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={handleSave} disabled={saving || !editing.question.trim() || !editing.answer.trim()} className="bg-emerald-500 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-emerald-600 transition flex items-center gap-2 disabled:opacity-50">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Enregistrer
                    </button>
                    <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium">Annuler</button>
                  </div>
                </div>
              </div>
            )}

            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {editing?.id === item.id && !isNew ? (
                  <div className="p-6 space-y-3">
                    <input type="text" value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-yellow-400 transition" />
                    <textarea rows={4} value={editing.answer} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 transition resize-none" />
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-500">Ordre :</label>
                        <input type="number" min={0} value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value) || 0 })} className="w-20 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-yellow-400 transition" />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={editing.enabled} onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })} className="rounded border-slate-300 text-yellow-500 focus:ring-yellow-400" />
                        <span className="text-sm text-slate-700">Activée</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <button onClick={handleSave} disabled={saving} className="bg-emerald-500 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-emerald-600 transition flex items-center gap-2 disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Sauvegarder
                      </button>
                      <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium">Annuler</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <HelpCircle className="w-4 h-4 text-slate-300 shrink-0" />
                        <span className="font-bold text-slate-900 text-sm truncate">{item.question}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 ml-6">{item.answer}</p>
                      <div className="flex items-center gap-3 mt-1.5 ml-6">
                        <span className="text-[10px] text-slate-400">Ordre: {item.sortOrder}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {item.enabled ? 'Activée' : 'Désactivée'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toggleEnabled(item)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600" title={item.enabled ? 'Désactiver' : 'Activer'}>
                        {item.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button onClick={() => { setEditing(item); setIsNew(false); }} className="p-1.5 rounded-lg hover:bg-yellow-50 transition-colors text-slate-400 hover:text-yellow-600" title="Modifier">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-slate-400 hover:text-red-500" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
