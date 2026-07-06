import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { messagesApi, clientMessagesApi } from '../lib/api';
import type { MessageItem } from '../lib/api';

interface MessagingPanelProps {
  parcelId: string;
  packageName: string;
  /** "admin" utilise l'API admin, "client" utilise l'API client. */
  context?: 'admin' | 'client';
}

export function MessagingPanel({ parcelId, packageName, context = 'admin' }: MessagingPanelProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const api = context === 'client' ? clientMessagesApi : messagesApi;

  const loadMessages = useCallback(() => {
    setLoading(true);
    setError(null);
    api.list(parcelId)
      .then(setMessages)
      .catch((err) => setError(err?.message || t('client.messages_loading')))
      .finally(() => setLoading(false));
  }, [parcelId, api]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !subject.trim()) return;
    setSending(true);
    setSendError(null);
    try {
      const msg = await api.send(parcelId, {
        subject: subject.trim(),
        body: body.trim(),
      });
      setMessages((prev) => [msg, ...prev]);
      setSubject('');
      setBody('');
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-yellow-500" />
        Messagerie — {packageName}
      </h3>

      {/* Message form */}
      <form onSubmit={handleSend} className="space-y-3 mb-4 pb-4 border-b border-slate-100">
        <input
          type="text"
          placeholder="Sujet"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
          required
        />
        <textarea
          placeholder="Votre message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none"
          required
        />
        {sendError && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-lg px-3 py-2 text-xs">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {sendError}
          </div>
        )}
        <button
          type="submit"
          disabled={sending || !body.trim() || !subject.trim()}
          className="bg-yellow-400 text-[#060f24] px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-300 transition disabled:opacity-50 flex items-center gap-2"
        >
          <Send className="w-3.5 h-3.5" />
          {sending ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>

      {/* Messages list */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-4">{t('client.messages_loading')}</p>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-3 text-xs text-center justify-center">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">Aucun message pour ce colis</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-slate-700">{msg.subject}</p>
                <p className="text-[10px] text-slate-400">
                  {new Date(msg.sentAt).toLocaleString('fr-FR')}
                </p>
              </div>
              <p className="text-sm text-slate-600">{msg.body}</p>
              {msg.senderName && (
                <p className="text-[10px] text-slate-400 mt-1">De : {msg.senderName}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
