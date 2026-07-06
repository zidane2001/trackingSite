import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ClipboardCheck,
  Map,
  MessageSquare,
  Inbox,
  BarChart3,
  HelpCircle,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Settings,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { IMAGES } from '../config/images';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

const adminNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'sidebar.admin_dashboard', path: '/admin' },
  { icon: ClipboardCheck, label: 'sidebar.admin_submissions', path: '/admin/submissions' },
  { icon: Package, label: 'sidebar.admin_packages', path: '/admin/packages' },
  { icon: Map, label: 'sidebar.admin_map', path: '/admin/map' },
  { icon: BarChart3, label: 'sidebar.admin_analytics', path: '/admin/analytics' },
  { icon: MessageSquare, label: 'sidebar.admin_messages', path: '/admin/messages' },
  { icon: Inbox, label: 'sidebar.admin_contact_messages', path: '/admin/contact-messages' },
  { icon: HelpCircle, label: 'sidebar.admin_faq', path: '/admin/faq' },
  { icon: Settings, label: 'sidebar.admin_settings', path: '/admin/settings' },
];

const clientNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'sidebar.client_dashboard', path: '/client' },
  { icon: MessageSquare, label: 'sidebar.client_messages', path: '/client/messages' },
  { icon: User, label: 'sidebar.client_profile', path: '/client/profile' },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  /** Mobile: whether sidebar drawer is open */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose }: Props) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN';
  const navItems = isAdmin ? adminNav : clientNav;

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2 overflow-hidden" onClick={onMobileClose}>
          <img src={IMAGES.LOGO} alt="Youms Logistics" className="h-8 w-8 object-contain shrink-0" />
          {!collapsed && (
            <span className="text-sm font-bold whitespace-nowrap">Youms Logistics</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            item.path === '/admin' || item.path === '/client'
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-gold/10 text-gold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5',
              )}
              title={collapsed ? t(item.label) : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{t(item.label)}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-white/5 space-y-1">
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 w-full transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 shrink-0" />
              <span>{t('sidebar.collapse')}</span>
            </>
          )}
        </button>
        {!collapsed && (
          <div className="px-3 py-2">
            <div className="text-xs text-slate-500 truncate">{user?.fullName}</div>
            <div className="text-[10px] text-slate-600 truncate">{user?.email}</div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-gold hover:bg-white/5 w-full transition-colors"
          title={t('sidebar.logout')}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>{t('sidebar.logout')}</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar (always visible) ──────────── */}
      <aside
        className={cn(
          'hidden lg:flex bg-[#060f24] text-white flex-col shrink-0 transition-all duration-300 h-screen sticky top-0',
          collapsed ? 'w-[68px]' : 'w-[260px]',
        )}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile overlay drawer ──────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[#060f24] text-white flex flex-col lg:hidden shadow-2xl" style={{ animation: 'slideInLeft 0.25s ease-out' }}>
            {/* Close button */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
              <Link to="/" className="flex items-center gap-2 overflow-hidden" onClick={onMobileClose}>
                <img src={IMAGES.LOGO} alt="Youms Logistics" className="h-8 w-8 object-contain shrink-0" />
                <span className="text-sm font-bold whitespace-nowrap">Youms Logistics</span>
              </Link>
              <button
                onClick={onMobileClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const active =
                  item.path === '/admin'
                    ? location.pathname === '/admin'
                    : location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onMobileClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'bg-gold/10 text-gold'
                        : 'text-slate-400 hover:text-white hover:bg-white/5',
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span>{t(item.label)}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-2 border-t border-white/5 space-y-1">
              <div className="px-3 py-2">
                <div className="text-xs text-slate-500 truncate">{user?.fullName}</div>
                <div className="text-[10px] text-slate-600 truncate">{user?.email}</div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-gold hover:bg-white/5 w-full transition-colors"
                title={t('sidebar.logout')}
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span>{t('sidebar.logout')}</span>
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
