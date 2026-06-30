import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../config/images';

export function Footer() {
  return (
    <footer className="bg-[#000a2d] text-white pt-16 pb-8 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & description */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={IMAGES.LOGO} alt="Youms Logistics" className="h-10 w-10 object-contain" />
              <span className="font-bold text-lg">Youms Logistics</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Transport & logistique international. Suivez vos colis en temps réel depuis plus de 150 pays.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-bold text-lg mb-6">Navigation</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><Link to="/" className="hover:text-white flex items-center gap-2"><span className="text-xs">›</span> Accueil</Link></li>
              <li><Link to="/about" className="hover:text-white flex items-center gap-2"><span className="text-xs">›</span> À propos</Link></li>
              <li><Link to="/services" className="hover:text-white flex items-center gap-2"><span className="text-xs">›</span> Services</Link></li>
              <li><Link to="/tracking" className="hover:text-white flex items-center gap-2"><span className="text-xs">›</span> Suivre un envoi</Link></li>
              <li><Link to="/contact" className="hover:text-white flex items-center gap-2"><span className="text-xs">›</span> Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-lg mb-6">Informations</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><Link to="/faq" className="hover:text-white flex items-center gap-2"><span className="text-xs">›</span> FAQ</Link></li>
              <li><Link to="/legal/cgu" className="hover:text-white flex items-center gap-2"><span className="text-xs">›</span> CGU</Link></li>
              <li><Link to="/legal/privacy" className="hover:text-white flex items-center gap-2"><span className="text-xs">›</span> Politique de confidentialité</Link></li>
              <li><Link to="/legal/cookies" className="hover:text-white flex items-center gap-2"><span className="text-xs">›</span> Politique de cookies</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-6">Contact</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <p>5 Rue du Beau Marais</p>
              <p>62100 Calais, France</p>
              <p>+33 3 21 00 00 00</p>
              <p>contact@youmslogistics.com</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Youms Logistics. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
