import { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notificationsApi } from '../lib/api';
import type { Notification } from '../types';
import { cn } from '../lib/utils';

const TYPE_ICONS: Record<string, string> = {
  SUBMISSION: '📦',
  VALIDATED: '✅',
  REFUSED: '❌',
  WAYPOINT: '📍',
  DELIVERED: '🎉',
  MESSAGE: '💬',
  CLIENT_MESSAGE: '📨',
};

/**
 * NotificationBell with 30-second polling for new notifications.
 * Future enhancement: add STOMP/WebSocket via @stomp/stompjs for true real-time.
 */
export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [list, count] = await Promise.all([
        notificationsApi.list(),
        notificationsApi.unreadCount(),
      ]);
      setNotifications(list);
      setUnreadCount(count.count);
    } catch {
      // silent
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      await notificationsApi.markAllRead().catch(() => {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  };

  const markOneRead = async (id: string) => {
    await notificationsApi.markRead(id).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-[384px] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-[28rem] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold bg-gold/20 text-gold-700 px-2 py-0.5 rounded-full">
                    {unreadCount} non lues
                  </span>
                )}
                <button
                  onClick={() => {
                    notificationsApi.markAllRead().catch(() => {});
                    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                    setUnreadCount(0);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  title="Tout marquer lu"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[24rem]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Aucune notification</p>
                </div>
              ) : (
                notifications.slice(0, 20).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && markOneRead(n.id)}
                    className={cn(
                      'px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group',
                      !n.isRead && 'bg-gold/5 border-l-2 border-l-gold',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5 shrink-0">
                        {TYPE_ICONS[n.type] || '🔔'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm leading-relaxed',
                          n.isRead ? 'text-slate-500' : 'text-slate-800 font-medium',
                        )}>
                          {n.content}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[11px] text-slate-400">
                            {new Date(n.createdAt).toLocaleString('fr-FR', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                          {!n.isRead && (
                            <div className="w-2 h-2 rounded-full bg-gold shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
