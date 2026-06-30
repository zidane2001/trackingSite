import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ClipboardCheck,
  Map,
  MessageSquare,
  Inbox,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { IMAGES } from '../config/images';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

const adminNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin' },
  { icon: ClipboardCheck, label: 'Soumissions', path: '/admin/submissions' },
  { icon: Package, label: 'Colis', path: '/admin/packages' },
  { icon: Map, label: 'Carte globale', path: '/admin/map' },
  { icon: MessageSquare, label: 'Messagerie', path: '/admin/messages' },
  { icon: Inbox, label: 'Messages contact', path: '/admin/contact-messages' },
];

const clientNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Mon tableau de bord', path: '/client' },
  { icon: Package, label: 'Mes colis', path: '/client/packages' },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: Props) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN';
  const navItems = isAdmin ? adminNav : clientNav;

  return (
    <aside
      className={cn(
        'bg-[#060f24] text-white flex flex-col shrink-0 transition-all duration-300 h-screen sticky top-0',
        collapsed ? 'w-[68px]' : 'w-[260px]',
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2 overflow-hidden">
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
            item.path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-gold/10 text-gold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5',
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-white/5 space-y-1">
        <button
          onClick={onToggle}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 w-full transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 shrink-0" />
              <span>Réduire</span>
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
          title="Déconnexion"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
