import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, FileText, LogIn, UserPlus } from 'lucide-react';
import { IMAGES } from '../config/images';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="w-full bg-[#000a2d] flex h-[100px] relative overflow-hidden animate-header">
      {/* Bloc gauche (logo) */}
      <div className="bg-[#C8A951] w-[250px] h-full flex items-center justify-center shrink-0 z-10">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={IMAGES.LOGO}
            alt="Youms Logistics"
            className="h-14 w-14 object-contain animate-logo drop-shadow-lg"
          />
        </Link>
      </div>

      {/* Centre */}
      <div className="flex-1 flex flex-col justify-center px-8 z-0 animate-nav">
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
          {[
            { to: '/', label: 'Accueil' },
            { to: '/about', label: 'À propos' },
            { to: '/services', label: 'Services' },
            { to: '/tracking', label: "Suivre l'envoi" },
            { to: '/faq', label: 'FAQ' },
            { to: '/contact', label: 'Contact' },
          ].map((link, i) => (
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

      {/* Bloc droit (CTA / Auth) */}
      <div className="relative w-[300px] h-full shrink-0 z-10 animate-cta">
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
    </header>
  );
}
