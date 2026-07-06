import React from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: Props) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user } = useAuth();

  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'N';

  return (
    <div className="flex h-screen bg-[#eef2f6] relative overflow-hidden">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 lg:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 relative z-20">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
              {userInitial}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
