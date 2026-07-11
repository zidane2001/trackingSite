import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, FileText, LogIn, UserPlus, Menu, X, Globe, Mail, Phone, MessageSquare, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IMAGES } from '../config/images';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import type { TFunction } from 'i18next';

const LANGUAGES = [
  { code: 'fr', label: 'Fran\u00e7ais', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
];

function NAV_LINKS(t: TFunction) {
  return [
    { to: '/', label: t('header.home') },
    { to: '/about', label: t('header.about') },
    { to: '/services', label: t('header.services') },
    { to: '/tracking', label: t('header.tracking') },
    { to: '/faq', label: t('header.faq') },
    { to: '/contact', label: t('header.contact') },
  ];
}

export function Header() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [langPosition, setLangPosition] = useState<{ top: number; right: number } | null>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Close lang dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Calculate dropdown position when opened
  useEffect(() => {
    if (langOpen && langRef.current) {
      const rect = langRef.current.getBoundingClientRect();
      setLangPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    } else {
      setLangPosition(null);
    }
  }, [langOpen]);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  return (
    <header className="w-full bg-[#000a2d] relative z-[1000] overflow-visible">
      {/* ── Top bar ─────────────────────────────────── */}
      <div className="flex items-center h-14 sm:h-16 px-3 sm:px-4 lg:h-[100px] min-w-0">
        {/* Logo */}
        <div className="bg-[#C8A951] h-10 w-10 lg:h-[100px] lg:w-[250px] flex items-center justify-center shrink-0 rounded-lg lg:rounded-none min-w-0">
          <Link to="/" className="flex items-center justify-center">
            <img
              src={IMAGES.LOGO}
              alt="Youms Logistics"
              className="h-7 w-7 lg:h-14 lg:w-14 object-contain drop-shadow-lg"
            />
          </Link>
        </div>

        {/* ── Desktop: address + nav ────────────────── */}
        <div className="hidden lg:flex flex-1 flex-col justify-center px-8 z-0 min-w-0">
          <div className="flex items-center justify-between text-white text-sm pb-3 border-b border-white/10">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold" />
                <span>{settings?.address || t('header.address')}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gold" />
                <span>{t('header.quote')}</span>
              </div>
            </div>
            {/* Language switcher — desktop */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors"
                aria-label="Change language"
                aria-expanded={langOpen}
                aria-haspopup="true"
              >
                <Globe className="w-4 h-4" />
                <span className="font-medium">{currentLang.short}</span>
                <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {langOpen && langPosition && (
                <div 
                  role="menu" 
                  className="fixed bg-white rounded-lg shadow-xl border border-slate-200 py-1 w-40 z-[9999]" 
                  style={{ top: `${langPosition.top}px`, right: `${langPosition.right}px`, animation: 'slideDown 0.15s ease-out' }}
                >
                  {LANGUAGES.map((lng) => (
                    <button
                      key={lng.code}
                      role="menuitem"
                      onClick={() => { i18n.changeLanguage(lng.code); setLangOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors ${
                        i18n.language === lng.code
                          ? 'bg-gold/10 text-gold font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-bold w-5">{lng.short}</span>
                      <span>{lng.label}</span>
                      {i18n.language === lng.code && (
                        <svg className="w-4 h-4 ml-auto text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <nav className="flex items-center gap-6 text-white text-sm font-medium pt-3">
            {NAV_LINKS(t).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative hover:text-gold transition-colors duration-300 after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Spacer mobile */}
        <div className="flex-1 lg:hidden" />

        {/* ── Desktop CTA (skew block) ─────────────── */}
        <div className="hidden lg:block relative w-[300px] h-full shrink-0 z-10">
          <div className="absolute inset-0 bg-[#C8A951] -skew-x-[20deg] origin-bottom-left translate-x-8" />
          <div className="relative h-full flex flex-col items-center justify-center gap-3 pr-8 pl-20 w-full">
            {/* Group 1: Contact buttons */}
            <div className="flex gap-2 w-full">
              <a href={`mailto:${settings?.email || 'youmslogistic@gmail.com'}`} className="flex-1 flex items-center justify-center bg-[#000a2d] text-white px-2 py-2 text-xs font-medium hover:bg-[#000a2d]/80 transition-all rounded" title="Email">
                <Mail className="w-4 h-4" />
              </a>
              <a href={`https://wa.me/${settings?.whatsappNumber?.replace(/\D/g, '') || '33600000000'}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center bg-[#000a2d] text-white px-2 py-2 text-xs font-medium hover:bg-[#000a2d]/80 transition-all rounded" title="WhatsApp">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>

            {/* Group 2: Auth buttons */}
            <div className="flex gap-2 w-full">
              {isAuthenticated ? (
                <>
                  <Link
                    to={user?.role === 'ADMIN' ? '/admin' : '/client'}
                    className="flex-1 border border-white text-white px-2 py-2 text-xs font-medium hover:bg-white hover:text-[#060f24] transition-all duration-300 text-center"
                  >
                    {t('header.dashboard')}
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="flex-1 text-white/70 text-xs hover:text-white transition-colors duration-300 text-center"
                  >
                    {t('header.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/tracking"
                    className="flex-1 border border-white text-white px-2 py-2 text-xs font-medium hover:bg-white hover:text-[#060f24] transition-all duration-300 text-center"
                  >
                    {t('header.tracking')}
                  </Link>
                  <div className="flex-1 flex items-center justify-center gap-1 text-white/80 text-xs">
                    <Link to="/login" className="hover:text-white transition-colors duration-300">
                      {t('header.login')}
                    </Link>
                    <span>|</span>
                    <Link to="/register" className="hover:text-white transition-colors duration-300">
                      {t('header.register')}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Mobile: CTA buttons + hamburger ──────── */}
        <div className="flex lg:hidden items-center gap-1.5 z-20 shrink-0">
          {/* Lang toggle mobile */}
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}
            className="flex items-center gap-1 bg-white/10 text-white px-2 py-1.5 rounded-lg text-xs font-bold hover:bg-white/20 transition-colors"
            aria-label="Change language"
          >
            <Globe className="w-3.5 h-3.5" />
            {currentLang.short}
          </button>

          {isAuthenticated ? (
            <Link
              to={user?.role === 'ADMIN' ? '/admin' : '/client'}
              className="bg-[#C8A951] text-[#060f24] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center justify-center"
            >
              {t('header.dashboard')}
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-[#C8A951] text-[#060f24] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 whitespace-nowrap"
            >
              <LogIn className="w-3 h-3" />
              <span>{t('header.login')}</span>
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile contact bar ─────────────────────── */}
      <div className="lg:hidden bg-[#0a1530] border-t border-white/10 px-4 py-3">
        <div className="flex items-center justify-center gap-4">
          <a href={`mailto:${settings?.email || 'youmslogistic@gmail.com'}`} className="flex items-center gap-2 text-white/80 text-xs hover:text-gold transition-colors">
            <Mail className="w-4 h-4 text-gold" />
            <span>Email</span>
          </a>
          <a href={`https://wa.me/${settings?.whatsappNumber?.replace(/\D/g, '') || '33600000000'}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/80 text-xs hover:text-gold transition-colors">
            <svg className="w-4 h-4 text-gold" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* ── Mobile tracking bar ─────────────────────── */}
      <div className="lg:hidden bg-[#000a2d] border-t border-white/10 px-4 py-2.5">
        <Link
          to="/tracking"
          className="flex items-center justify-center gap-2 w-full bg-gold text-[#060f24] px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gold-400 transition-colors"
        >
          <Truck className="w-4 h-4" />
          <span>{t('header.tracking')}</span>
        </Link>
      </div>

      {/* ── Mobile dropdown menu ──────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0a1530] border-t border-white/10" style={{ animation: 'slideDown 0.2s ease-out' }}>
          <div className="px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <MapPin className="w-3 h-3 text-gold" />
              <span>{settings?.address || t('header.address')}</span>
            </div>
          </div>
          <nav className="px-3 py-2 space-y-0.5">
            {NAV_LINKS(t).map((link) => (
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
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center border border-gold text-gold text-sm font-medium py-2.5 rounded-lg hover:bg-gold/10 transition"
                  >
                    {t('header.login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center bg-gold text-[#060f24] text-sm font-bold py-2.5 rounded-lg hover:bg-gold-400 transition"
                  >
                    {t('header.register')}
                  </Link>
                </div>
              </>
            )}
            {isAuthenticated && (
              <button
                onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}
                className="w-full text-center text-white/60 text-sm py-2 hover:text-white transition-colors"
              >
                {t('header.logout')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
