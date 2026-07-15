import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../contexts/SettingsContext';

export function WhatsAppButton() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [tooltip, setTooltip] = useState(false);

  const whatsappNumber = settings?.whatsappNumber?.replace(/\D/g, '') || '33656817785';
  const WHATSAPP_URL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(t('whatsapp.message'))}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* Tooltip */}
      {tooltip && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 px-4 py-3 max-w-[220px] whatsapp-tooltip">
          <button
            onClick={() => setTooltip(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="text-sm font-semibold text-slate-900 mb-0.5">{t('whatsapp.tooltip_title')}</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t('whatsapp.tooltip_text')}
          </p>
        </div>
      )}

      {/* FAB Button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactez-nous sur WhatsApp"
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        onClick={() => setTooltip(false)}
        className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 hover:scale-110 active:scale-95 transition-all duration-300"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/20 animate-ping [animation-duration:2s]" />

        {/* WhatsApp SVG icon */}
        <svg
          viewBox="0 0 32 32"
          fill="currentColor"
          className="relative w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-sm"
        >
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.744 3.054 9.374L1.054 31.25l6.118-1.97A15.906 15.906 0 0 0 16.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0Zm9.326 22.608c-.39 1.1-1.932 2.014-3.168 2.28-.84.18-1.938.322-5.636-1.21-4.734-1.962-7.778-6.764-8.016-7.08-.23-.316-1.9-2.524-1.9-4.814 0-2.29 1.2-3.416 1.628-3.88.39-.428.924-.54 1.23-.54h.894c.284 0 .668-.108 1.042.794.39.94 1.324 3.228 1.44 3.462.116.234.194.506.038.822-.156.316-.234.514-.466.79-.234.278-.49.62-.7.834-.234.234-.476.488-.202.958.274.468 1.216 2.006 2.612 3.25 1.794 1.6 3.304 2.096 3.772 2.328.468.234.742.194 1.016-.118.274-.312 1.17-1.364 1.482-1.832.312-.468.624-.39 1.056-.234.434.156 2.756 1.298 3.228 1.534.468.234.78.352.896.548.116.194.116 1.134-.274 2.234Z" />
        </svg>
      </a>
    </div>
  );
}
