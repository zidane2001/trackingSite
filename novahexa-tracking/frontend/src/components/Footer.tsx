import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const NAV_LINKS = [
    { to: '/', label: t('footer.home') },
    { to: '/about', label: t('footer.about') },
    { to: '/services', label: t('footer.services') },
    { to: '/tracking', label: t('footer.tracking') },
    { to: '/contact', label: t('footer.contact_link') },
  ];

  const INFO_LINKS = [
    { to: '/faq', label: t('footer.faq') },
    { to: '/legal/cgu', label: t('footer.cgu') },
    { to: '/legal/privacy', label: t('footer.privacy') },
    { to: '/legal/cookies', label: t('footer.cookies') },
  ];

  return (
    <footer className="bg-[#000a2d] text-white pt-10 sm:pt-16 pb-6 sm:pb-8 border-t border-white/10 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bloc 1: Logo + Liens — 2 colonnes sur mobile, 4 sur desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12">
          {/* Logo & description — pleine largeur sur mobile */}
          <FooterSection className="col-span-2">
            <Link to="/" className="flex flex-row items-center gap-3 mb-4 group">
              <img
                src={IMAGES.LOGO_WITH_BG}
                alt="Youms Logistics"
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div>
                <span className="font-bold text-lg transition-colors duration-300 group-hover:text-gold block">Youms Logistics</span>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed hidden sm:block">
                  {t('footer.company_short')}
                </p>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed sm:hidden">
              {t('footer.company')}
            </p>
          </FooterSection>

          {/* Navigation */}
          <FooterSection>
            <h3 className="font-bold text-sm sm:text-lg mb-4 sm:mb-6 uppercase tracking-wider text-slate-200">{t('footer.nav_title')}</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-300">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-gold flex items-center gap-1.5 sm:gap-2 transition-colors duration-300 group">
                    <span className="text-xs text-gold/50 group-hover:text-gold transition-colors duration-300">›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* Informations */}
          <FooterSection>
            <h3 className="font-bold text-sm sm:text-lg mb-4 sm:mb-6 uppercase tracking-wider text-slate-200">{t('footer.info_title')}</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-300">
              {INFO_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-gold flex items-center gap-1.5 sm:gap-2 transition-colors duration-300 group">
                    <span className="text-xs text-gold/50 group-hover:text-gold transition-colors duration-300">›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>
        </div>

        {/* Bloc 2: Contact — séparé par une bordure, pleine largeur */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <FooterSection>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div>
                <h3 className="font-bold text-sm sm:text-lg mb-3 sm:mb-4 uppercase tracking-wider text-slate-200">{t('footer.contact_title')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-gold/60 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <div>
                      <p>26 Rue Charles Fabry</p>
                      <p>66000 Perpignan, France</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-gold/60 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    <div>
                      <a href="https://wa.me/33656817785" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors duration-300">+33 6 56 81 77 85</a>
                      <p className="text-gold">youmslogistics@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FooterSection>
        </div>

        <div className="mt-6 sm:mt-10 pt-5 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src={IMAGES.LOGO_WITH_BG} alt="Youms Logistics" className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg object-contain opacity-60" />
            <span className="text-[11px] sm:text-xs text-slate-500">© {new Date().getFullYear()} Youms Logistics. {t('footer.copyright')}</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-gold/40 animate-pulse-glow" />
            <span className="text-[10px] text-slate-600 uppercase tracking-wider">{t('footer.real_time')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
