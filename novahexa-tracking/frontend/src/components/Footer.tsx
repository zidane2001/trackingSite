import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../config/images';
import { useScrollReveal } from '../hooks/useScrollReveal';

function FooterSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={`reveal reveal-up ${isVisible ? 'visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#000a2d] text-white pt-16 pb-8 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & description */}
          <FooterSection>
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <img
                src={IMAGES.LOGO}
                alt="Youms Logistics"
                className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              />
              <span className="font-bold text-lg transition-colors duration-300 group-hover:text-gold">Youms Logistics</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Transport & logistique international. Suivez vos colis en temps réel depuis plus de 150 pays.
            </p>
          </FooterSection>

          {/* Navigation */}
          <FooterSection>
            <h3 className="font-bold text-lg mb-6">Navigation</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              {[
                { to: '/', label: 'Accueil' },
                { to: '/about', label: 'À propos' },
                { to: '/services', label: 'Services' },
                { to: '/tracking', label: 'Suivre un envoi' },
                { to: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-gold flex items-center gap-2 transition-colors duration-300 group">
                    <span className="text-xs text-gold/50 group-hover:text-gold transition-colors duration-300">›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* Legal */}
          <FooterSection>
            <h3 className="font-bold text-lg mb-6">Informations</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              {[
                { to: '/faq', label: 'FAQ' },
                { to: '/legal/cgu', label: 'CGU' },
                { to: '/legal/privacy', label: 'Politique de confidentialité' },
                { to: '/legal/cookies', label: 'Politique de cookies' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-gold flex items-center gap-2 transition-colors duration-300 group">
                    <span className="text-xs text-gold/50 group-hover:text-gold transition-colors duration-300">›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* Contact */}
          <FooterSection>
            <h3 className="font-bold text-lg mb-6">Contact</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <p>5 Rue du Beau Marais</p>
              <p>62100 Calais, France</p>
              <p>+33 3 21 00 00 00</p>
              <p className="text-gold">contact@youmslogistics.com</p>
            </div>
          </FooterSection>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={IMAGES.LOGO} alt="Youms Logistics" className="h-5 w-5 object-contain opacity-40" />
            <span className="text-xs text-slate-500">© {new Date().getFullYear()} Youms Logistics. Tous droits réservés.</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-gold/40 animate-pulse-glow" />
            <span className="text-[10px] text-slate-600 uppercase tracking-wider">Suivi en temps réel</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
