import React, { useEffect, useState } from 'react';
import { Inbox, Check, Mail } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { contactApi } from '../../lib/api';
import type { ContactMessage } from '../../types';
import { cn } from '../../lib/utils';

export function AdminContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const loadMessages = () => {
    contactApi.list().catch(() => []).finally(() => setLoading(false));
  };

  useEffect(() => { loadMessages(); }, []);

  const handleMarkTreated = async (msg: ContactMessage) => {
    await contactApi.markTreated(msg.id).catch(() => {});
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, status: 'TRAITE' as const } : m))
    );
    if (selected?.id === msg.id) {
      setSelected({ ...msg, status: 'TRAITE' });
    }
  };

  const untreatedCount = messages.filter((m) => m.status === 'NON_TRAITE').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Inbox className="w-6 h-6 text-yellow-500" />
            Messages contact
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {messages.length} message{messages.length !== 1 ? 's' : ''} au total
            {untreatedCount > 0 && (
              <span className="ml-2 text-amber-600 font-medium">
                ({untreatedCount} non traité{untreatedCount !== 1 ? 's' : ''})
              </span>
            )}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6 min-h-[500px]">
          {/* Message list */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400">Chargement...</div>
            ) : messages.length === 0 ? (
              <div className="p-12 text-center text-slate-400">Aucun message</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {messages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => setSelected(msg)}
                    className={cn(
                      'w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors',
                      selected?.id === msg.id && 'bg-yellow-50',
                      msg.status === 'NON_TRAITE' && 'bg-amber-50/30',
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-900">{msg.name}</span>
                        <span className="text-xs text-slate-400">{msg.email}</span>
                      </div>
                      {msg.status === 'NON_TRAITE' ? (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                          Nouveau
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                          Traité
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{msg.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {new Date(msg.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Mail className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">Sélectionnez un message</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900">{selected.name}</h3>
                    {selected.status === 'NON_TRAITE' && (
                      <button
                        onClick={() => handleMarkTreated(selected)}
                        className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Marquer traité
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 space-y-1">
                    <p>Email : <span className="text-slate-700">{selected.email}</span></p>
                    <p>Reçu le : <span className="text-slate-700">{new Date(selected.createdAt).toLocaleString('fr-FR')}</span></p>
                  </div>
                </div>
                <div className="flex-1 p-6">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
