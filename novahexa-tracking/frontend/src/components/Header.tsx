import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, FileText, LogIn, UserPlus, Menu, X } from 'lucide-react';
import { IMAGES } from '../config/images';
import { useAuth } from '../contexts/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/about', label: 'À propos' },
  { to: '/services', label: 'Services' },
  { to: '/tracking', label: "Suivre l'envoi" },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full bg-[#000a2d] relative animate-header">
      {/* ── Top bar: logo + hamburger ─────────────────────── */}
      <div className="flex items-center h-16 px-4 lg:h-[100px]">
        {/* Logo block */}
        <div className="bg-[#C8A951] h-12 w-12 lg:h-[100px] lg:w-[250px] flex items-center justify-center shrink-0 rounded-lg lg:rounded-none z-10">
          <Link to="/" className="flex items-center justify-center">
            <img
              src={IMAGES.LOGO}
              alt="Youms Logistics"
              className="h-9 w-9 lg:h-14 lg:w-14 object-contain animate-logo drop-shadow-lg"
            />
          </Link>
        </div>

        {/* Center: address + nav (desktop) */}
        <div className="hidden lg:flex flex-1 flex-col justify-center px-8 z-0 animate-nav">
          <div className="flex items-center gap-8 text-white text-sm pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold" />
              <span>5 Rue du Beau Marais, 62100 Calais</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gold" />
              <span>Demandez un devis !</span>
            </div>
          </div>
          <nav className="flex items-center gap-6 text-white text-sm font-medium pt-3">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative hover:text-gold transition-colors duration-300 after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
                style={{ animationDelay: `${0.4 + i * 0.06}s` }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Spacer */}
        <div className="flex-1 lg:hidden" />

        {/* Desktop CTA block */}
        <div className="hidden lg:block relative w-[300px] h-full shrink-0 z-10 animate-cta">
          <div className="absolute inset-0 bg-[#C8A951] -skew-x-[20deg] origin-bottom-left translate-x-8" />
          <div className="relative h-full flex flex-col items-center justify-center gap-2 pr-8 pl-12">
            {isAuthenticated ? (
              <>
                <Link
                  to={user?.role === 'ADMIN' ? '/admin' : '/client'}
                  className="border border-white text-white px-5 py-2 text-sm font-medium hover:bg-white hover:text-[#060f24] transition-all duration-300 w-full text-center hover:shadow-lg hover:shadow-white/10"
                >
                  Mon espace
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="text-white/70 text-xs hover:text-white transition-colors duration-300"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/tracking"
                  className="border border-white text-white px-5 py-2 text-sm font-medium hover:bg-white hover:text-[#060f24] transition-all duration-300 w-full text-center hover:shadow-lg hover:shadow-white/10"
                >
                  Suivre l'envoi
                </Link>
                <div className="flex items-center gap-3 text-white/80 text-xs">
                  <Link to="/login" className="hover:text-white flex items-center gap-1 transition-colors duration-300">
                    <LogIn className="w-3 h-3" /> Connexion
                  </Link>
                  <span>|</span>
                  <Link to="/register" className="hover:text-white flex items-center gap-1 transition-colors duration-300">
                    <UserPlus className="w-3 h-3" /> Inscription
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile CTA + hamburger */}
        <div className="flex lg:hidden items-center gap-2 z-20">
          {isAuthenticated ? (
            <Link
              to={user?.role === 'ADMIN' ? '/admin' : '/client'}
              className="bg-[#C8A951] text-[#060f24] px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              Espace
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-white text-xs font-medium"
            >
              Connexion
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown menu ──────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0a1530] border-t border-white/10" style={{ animation: 'slideDown 0.2s ease-out' }}>
          <div className="px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <MapPin className="w-3 h-3 text-gold" />
              <span>5 Rue du Beau Marais, 62100 Calais</span>
            </div>
          </div>
          <nav className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-white text-sm font-medium rounded-lg hover:bg-white/10 hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 py-3 border-t border-white/5 space-y-2">
            {!isAuthenticated && (
              <>
                <Link
                  to="/tracking"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center border border-white text-white px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-white hover:text-[#060f24] transition-all"
                >
                  Suivre l'envoi
                </Link>
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center text-gold text-sm font-medium py-2 hover:underline"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center bg-gold text-[#060f24] text-sm font-bold py-2 rounded-lg hover:bg-gold-400 transition"
                  >
                    Inscription
                  </Link>
                </div>
              </>
            )}
            {isAuthenticated && (
              <button
                onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}
                className="w-full text-center text-white/60 text-sm py-2 hover:text-white transition-colors"
              >
                Déconnexion
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
