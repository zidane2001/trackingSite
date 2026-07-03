import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, Package, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { packagesApi } from '../../lib/api';
import type { PackageItem } from '../../types';
import { cn } from '../../lib/utils';

export function AdminMessages() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<PackageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    packagesApi.list().then(setPackages).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedPkg) {
      packagesApi.getAdmin(selectedPkg.id).then(setSelectedPkg).catch(() => {});
    }
  }, [selectedPkg?.id]);

  const handleSend = async () => {
    if (!selectedPkg || !subject.trim() || !body.trim()) return;
    setSending(true);
    try {
      await packagesApi.sendMessage(selectedPkg.id, { subject, body });
      setSubject('');
      setBody('');
      // Reload the package to get updated messages
      const updated = await packagesApi.getAdmin(selectedPkg.id);
      setSelectedPkg(updated);
    } catch { /* ignore */ } finally { setSending(false); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 sm:gap-3">
            <MessageSquare className="w-6 h-6 text-yellow-500" />
            Messagerie
          </h1>
          <p className="text-sm text-slate-500 mt-1">Envoyez des messages personnalisés aux clients</p>
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
                    <div className="text-sm font-bold text-slate-900">{pkg.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{pkg.trackingNumber}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message area */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            {!selectedPkg ? (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Package className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">Sélectionnez un colis pour envoyer un message</p>
                </div>
              </div>
            ) : (
              <>
                {/* Messages history */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  {selectedPkg.messages && selectedPkg.messages.length > 0 ? (
                    selectedPkg.messages.map((msg) => (
                      <div key={msg.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-slate-900">{msg.subject}</span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(msg.sentAt).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{msg.body}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-400 py-8 text-sm">
                      Aucun message pour ce colis
                    </div>
                  )}
                </div>

                {/* Compose */}
                <div className="border-t border-slate-100 p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Objet du message"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-400 transition"
                  />
                  <textarea
                    rows={3}
                    placeholder="Rédigez votre message..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-400 transition resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSend}
                      disabled={!subject.trim() || !body.trim() || sending}
                      className="bg-yellow-400 text-[#060f24] px-5 py-2 rounded-lg font-bold text-sm hover:bg-yellow-300 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Envoyer
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
