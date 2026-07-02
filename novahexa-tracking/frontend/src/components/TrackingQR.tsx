import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Copy } from 'lucide-react';

interface TrackingQRProps {
  trackingNumber: string;
  /** Package name shown on the label */
  name?: string;
  /** Origin/destination shown on the label */
  origin?: string;
  destination?: string;
  /** Size of the QR code in px (default 128) */
  size?: number;
  /** Show full shipping label (default false = compact QR only) */
  showLabel?: boolean;
  /** Show action buttons (print, copy link) */
  showActions?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const TRACKING_BASE_URL =
  (import.meta as any).env?.VITE_TRACKING_URL ?? window.location.origin + '/tracking';

export function TrackingQR({
  trackingNumber,
  name,
  origin,
  destination,
  size = 128,
  showLabel = false,
  showActions = true,
  className = '',
}: TrackingQRProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const trackingUrl = `${TRACKING_BASE_URL}/tracking?tn=${encodeURIComponent(trackingNumber)}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(trackingUrl);
  };

  const printLabel = () => {
    const printWindow = window.open('', '_blank', 'width=400,height=500');
    if (!printWindow) return;
    const svgEl = qrRef.current?.querySelector('svg');
    const svgData = svgEl ? new XMLSerializer().serializeToString(svgEl) : '';
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Étiquette - ${trackingNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', system-ui, sans-serif; display: flex; justify-content: center; padding: 20px; }
          .label { border: 2px solid #1e293b; border-radius: 12px; padding: 24px; max-width: 340px; width: 100%; }
          .header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
          .brand { font-size: 14px; font-weight: 800; color: #060f24; letter-spacing: 0.05em; }
          .qr { display: flex; justify-content: center; margin: 16px 0; }
          .tracking { text-align: center; font-size: 18px; font-weight: 700; font-family: monospace; color: #C8A951; letter-spacing: 0.1em; margin: 12px 0; }
          .info { font-size: 11px; color: #64748b; line-height: 1.5; }
          .info strong { color: #1e293b; }
          .route { display: flex; align-items: center; gap: 6px; margin: 8px 0; font-size: 12px; color: #334155; }
          .route .arrow { color: #C8A951; font-weight: bold; }
          @media print { body { padding: 0; } .label { border-width: 1px; } }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="header">
            <span class="brand">YOUMS LOGISTICS</span>
          </div>
          <div class="qr">${svgData}</div>
          <div class="tracking">${trackingNumber}</div>
          ${name ? `<div style="text-align:center;font-size:12px;color:#475569;margin-bottom:8px;">${name}</div>` : ''}
          ${origin && destination ? `
            <div class="route">
              <strong>Départ :</strong> ${origin}
            </div>
            <div class="route">
              <strong>Arrivée :</strong> ${destination}
            </div>
          ` : ''}
          <div class="info" style="margin-top:12px;padding-top:8px;border-top:1px solid #e2e8f0;">
            Suivez votre colis : <strong>${trackingUrl}</strong>
          </div>
        </div>

      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  if (showLabel) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-5 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Youms Logistics
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Étiquette</span>
        </div>

        {/* QR Code */}
        <div ref={qrRef} className="flex justify-center mb-3">
          <QRCodeSVG
            value={trackingUrl}
            size={size}
            bgColor="#ffffff"
            fgColor="#1e293b"
            level="M"
            includeMargin={false}
          />
        </div>

        {/* Tracking Number */}
        <div className="text-center font-mono font-bold text-lg text-[#C8A951] tracking-wider mb-2">
          {trackingNumber}
        </div>

        {/* Name */}
        {name && (
          <div className="text-center text-sm text-slate-600 mb-3">{name}</div>
        )}

        {/* Route */}
        {origin && destination && (
          <div className="text-xs text-slate-500 space-y-1 mb-3">
            <div><strong className="text-slate-700">Départ :</strong> {origin}</div>
            <div><strong className="text-slate-700">Arrivée :</strong> {destination}</div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={printLabel}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimer
            </button>
            <button
              onClick={copyLink}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
            >
              <Copy className="w-3.5 h-3.5" /> Copier le lien
            </button>
          </div>
        )}
      </div>
    );
  }

  // Compact mode: just the QR code
  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <div ref={qrRef}>
        <QRCodeSVG
          value={trackingUrl}
          size={size}
          bgColor="#ffffff"
          fgColor="#1e293b"
          level="M"
          includeMargin={false}
        />
      </div>
      <span className="font-mono text-xs text-slate-500">{trackingNumber}</span>
      {showActions && (
        <div className="flex items-center gap-1.5">
          <button
            onClick={printLabel}
            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
            title="Imprimer l'étiquette"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={copyLink}
            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
            title="Copier le lien de suivi"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
