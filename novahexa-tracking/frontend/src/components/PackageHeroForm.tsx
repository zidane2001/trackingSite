import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  Ruler,
  Weight,
  CalendarDays,
  Loader2,
  CheckCircle2,
  Copy,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  ImagePlus,
} from 'lucide-react';
import {
  estimatePrice,
  formatEUR,
  MODE_LABELS,
  DELAY_LABELS,
  MATERIAL_LABELS,
  type TransportMode,
  type DeliveryDelay,
  type MaterialType,
} from '../lib/pricing';
import { generateTrackingNumber } from '../lib/tracking';
import { submitPackage, pricingApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useImageUpload } from '../hooks/useImageUpload';
import { useTranslation } from 'react-i18next';

type FormState = {
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  name: string;
  material: MaterialType;
  weightKg: string;
  heightCm: string;
  widthCm: string;
  lengthCm: string;
  originAddress: string;
  destinationAddress: string;
  mode: TransportMode;
  delay: DeliveryDelay;
  shippingDate: string;
};

const initial: FormState = {
  senderName: '',
  senderEmail: '',
  senderPhone: '',
  name: '',
  material: 'GENERAL',
  weightKg: '',
  heightCm: '',
  widthCm: '',
  lengthCm: '',
  originAddress: '',
  destinationAddress: '',
  mode: 'ROUTE',
  delay: 'STANDARD',

  shippingDate: '',
};

// --- Field styling for dark hero background ---
const label = 'block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5';
const field =
  'w-full bg-[#060f24] border border-white/10 rounded-md px-2.5 py-1.5 text-[13px] text-white ' +
  'placeholder-slate-500 focus:outline-none focus:border-yellow-400/70 focus:ring-1 focus:ring-yellow-400/40 transition';

function Labeled({
  children,
  text,
  icon: Icon,
}: {
  children: React.ReactNode;
  text: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <label className="block">
      <span className={label}>
        <Icon className="inline w-3 h-3 -mt-0.5 mr-0.5 text-yellow-400" />
        {text}
      </span>
      {children}
    </label>
  );
}

/**
 * Geocode an address string to lat/lng using Nominatim (OpenStreetMap).
 * Returns [lat, lng] or null if not found.
 */
async function geocode(address: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { 'Accept-Language': 'fr' } },
    );
    const data = await res.json();
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch {
    // Geocoding failed — submit without coordinates
  }
  return null;
}

export function PackageHeroForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ trackingNumber: string; cost: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { images, previews, uploading, fileRef, handleUpload, remove, reset } = useImageUpload();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  // Server-side cost estimate — zero re-render to avoid focus loss
  const [serverCost, setServerCost] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  // FIX: simple setter without broken useCallback
  const setField = (k: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const num = (v: string) => (v.trim() === '' ? 0 : Number(v));

  // Client-side estimate (instant, used as fallback)
  const clientCost = useMemo(
    () =>
      estimatePrice({
        mode: form.mode,
        delay: form.delay,

        material: form.material,
        weightKg: num(form.weightKg),
        heightCm: num(form.heightCm),
        widthCm: num(form.widthCm),
        lengthCm: num(form.lengthCm),
      }),
    [form.mode, form.delay, form.material, form.weightKg, form.heightCm, form.widthCm, form.lengthCm],
  );

  // Debounced server-side estimate
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (num(form.weightKg) === 0 && num(form.heightCm) === 0) {
        setServerCost(null);
        return;
      }
      const reqId = ++requestIdRef.current;
      pricingApi
        .estimate({
          mode: form.mode,
          delay: form.delay,

          material: form.material,
          weightKg: num(form.weightKg) || undefined,
          heightCm: num(form.heightCm) || undefined,
          widthCm: num(form.widthCm) || undefined,
          lengthCm: num(form.lengthCm) || undefined,
        })
        .then((res) => {
          if (reqId === requestIdRef.current) setServerCost(res.estimatedCost);
        })
        .catch(() => {
          if (reqId === requestIdRef.current) setServerCost(null);
        });
    }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [form.mode, form.delay, form.material, form.weightKg, form.heightCm, form.widthCm, form.lengthCm]);

  const estimatedCost = serverCost ?? clientCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const optimistic = generateTrackingNumber();

    // Geocode origin and destination in parallel
    const [originCoords, destCoords] = await Promise.all([
      geocode(form.originAddress),
      geocode(form.destinationAddress),
    ]);

    try {
      const res = await submitPackage({
        senderName: form.senderName,
        senderEmail: form.senderEmail,
        senderPhone: form.senderPhone || undefined,
        name: form.name,
        material: form.material,
        weightKg: num(form.weightKg),
        dimensions: {
          heightCm: num(form.heightCm),
          widthCm: num(form.widthCm),
          lengthCm: num(form.lengthCm),
        },
        originAddress: form.originAddress,
        destinationAddress: form.destinationAddress,
        originLat: originCoords?.[0],
        originLng: originCoords?.[1],
        destinationLat: destCoords?.[0],
        destinationLng: destCoords?.[1],
        mode: form.mode,
        delay: form.delay,

        shippingDate: form.shippingDate || undefined,
        estimatedCost,
        imageUrls: images.length > 0 ? images : undefined,
      });
      setResult({ trackingNumber: res.trackingNumber, cost: res.estimatedCost });
    } catch {
      setResult({ trackingNumber: optimistic, cost: estimatedCost });
    } finally {
      setSubmitting(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // --- Confirmation screen ---
  if (result) {
    return (
      <div className="bg-[#0a1530]/90 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-2xl text-center">
        <div className="w-12 h-12 rounded-full bg-yellow-400/15 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6 text-yellow-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">{t('packageHero.request_sent')}</h3>
        <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto">
          {t('packageHero.processing')}{' '}
          <span className="text-yellow-400 font-semibold">{t('packageHero.processing_status')}</span>.{' '}
          {t('packageHero.keep_number')}
        </p>

        <div className="flex items-center justify-center gap-2 mb-4">
          <code className="bg-[#060f24] border border-white/10 rounded-lg px-3 py-2 text-yellow-400 font-mono tracking-wider text-sm">
            {result.trackingNumber}
          </code>
          <button
            type="button"
            onClick={copy}
            className="p-2 rounded-lg border border-white/10 text-slate-300 hover:text-yellow-400 hover:border-yellow-400/50 transition"
            aria-label={t('packageHero.copy_tracking')}
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        {copied && <p className="text-xs text-yellow-400 mb-3">{t('packageHero.copied')}</p>}

        <div className="text-xs text-slate-400 mb-4">
          {t('packageHero.estimated_cost')}{' '}
          <span className="text-white font-semibold">{formatEUR(result.cost)}</span>
        </div>

        <button
          type="button"
          onClick={() => { setResult(null); setForm(initial); setServerCost(null); reset(); }}
          className="text-sm font-semibold text-yellow-400 hover:text-yellow-300 inline-flex items-center gap-1.5"
        >
          {t('packageHero.submit_another')} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // --- Ultra-Compact Form ---
   return (
     <form
       onSubmit={handleSubmit}
       className="bg-[#0a1530]/90 backdrop-blur border border-white/10 rounded-xl p-4 shadow-2xl"
     >
       {/* Row 1: Name + Email + Phone */}
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
         <Labeled text={t('packageHero.name')} icon={User}>
           <input className={field} value={form.senderName} onChange={setField('senderName')} placeholder={t('packageHero.name_placeholder')} required />
         </Labeled>
         <Labeled text={t('packageHero.email')} icon={Mail}>
           <input type="email" className={field} value={form.senderEmail} onChange={setField('senderEmail')} placeholder={t('packageHero.email_placeholder')} required />
         </Labeled>
         <Labeled text={t('packageHero.phone')} icon={Phone}>
           <input className={field} value={form.senderPhone} onChange={setField('senderPhone')} placeholder={t('packageHero.phone_placeholder')} />
         </Labeled>
       </div>

       {/* Row 2: Colis name + Material */}
       <div className="grid grid-cols-2 gap-2 mb-2">
         <Labeled text={t('packageHero.package_name')} icon={Package}>
           <input className={field} value={form.name} onChange={setField('name')} placeholder={t('packageHero.package_placeholder')} required />
         </Labeled>
         <Labeled text={t('packageHero.material')} icon={Package}>
           <select className={field} value={form.material} onChange={setField('material')}>
             <option value="GENERAL" className="bg-[#060f24]">{t('packageHero.material_general')}</option>
            <option value="AUTO_PARTS" className="bg-[#060f24]">{t('packageHero.material_auto_parts')}</option>
            <option value="FRAGILE" className="bg-[#060f24]">{t('packageHero.material_fragile')}</option>
            <option value="ELECTRONIQUE" className="bg-[#060f24]">{t('packageHero.material_electronique')}</option>
            <option value="DOCUMENTS" className="bg-[#060f24]">{t('packageHero.material_documents')}</option>
           </select>
         </Labeled>
       </div>

       {/* Row 3: Origin + Destination */}
       <div className="grid grid-cols-2 gap-2 mb-2">
         <Labeled text={t('packageHero.origin')} icon={MapPin}>
           <input className={field} value={form.originAddress} onChange={setField('originAddress')} placeholder={t('packageHero.origin_placeholder')} required />
         </Labeled>
         <Labeled text={t('packageHero.destination')} icon={MapPin}>
           <input className={field} value={form.destinationAddress} onChange={setField('destinationAddress')} placeholder={t('packageHero.destination_placeholder')} required />
         </Labeled>
       </div>

       {/* Row 4: Mode + Delay */}
       <div className="grid grid-cols-2 gap-2 mb-2">
         <Labeled text={t('packageHero.mode')} icon={Package}>
           <select className={field} value={form.mode} onChange={setField('mode')}>
             <option value="ROUTE" className="bg-[#060f24]">{t('packageHero.mode_route')}</option>
            <option value="MER" className="bg-[#060f24]">{t('packageHero.mode_mer')}</option>
            <option value="AIR" className="bg-[#060f24]">{t('packageHero.mode_air')}</option>
           </select>
         </Labeled>
         <Labeled text={t('packageHero.delay')} icon={CalendarDays}>
           <select className={field} value={form.delay} onChange={setField('delay')}>
             <option value="STANDARD" className="bg-[#060f24]">{t('packageHero.delay_standard')}</option>
            <option value="EXPRESS" className="bg-[#060f24]">{t('packageHero.delay_express')}</option>
            <option value="JOUR_MEME" className="bg-[#060f24]">{t('packageHero.delay_jour_meme')}</option>
           </select>
         </Labeled>
       </div>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition mb-2"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? t('packageHero.less_options') : t('packageHero.more_options')}
        </button>

        {/* Image upload (only for authenticated users) */}
        {isAuthenticated && (
          <div className="mb-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-yellow-400 transition"
            >
              {uploading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('packageHero.uploading')}</>
              ) : (
                <><ImagePlus className="w-3.5 h-3.5" /> {t('packageHero.photos')}</>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
            {previews.length > 0 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {previews.map((src, i) => (
                  <div key={i} className="relative shrink-0 group">
                    <img src={src} alt={t('packageHero.photo_alt', { index: i + 1 })} className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {!isAuthenticated && (
          <div className="mb-2 text-[10px] text-slate-500">
            <ImagePlus className="inline w-3 h-3 -mt-0.5 mr-0.5" />
            {t('packageHero.login_for_photos')}
          </div>
        )}

        {/* Advanced fields (collapsible) */}
        {expanded && (
          <div className="grid grid-cols-4 gap-2 mb-2">
            <Labeled text={t('packageHero.weight')} icon={Weight}>
              <input type="number" min="0" step="0.1" className={field} value={form.weightKg} onChange={setField('weightKg')} placeholder={t('packageHero.weight_placeholder')} />
            </Labeled>
            <Labeled text={t('packageHero.height')} icon={Ruler}>
              <input type="number" min="0" className={field} value={form.heightCm} onChange={setField('heightCm')} placeholder={t('packageHero.height_placeholder')} />
            </Labeled>
            <Labeled text={t('packageHero.width')} icon={Ruler}>
              <input type="number" min="0" className={field} value={form.widthCm} onChange={setField('widthCm')} placeholder={t('packageHero.width_placeholder')} />
            </Labeled>
            <Labeled text={t('packageHero.length')} icon={Ruler}>
              <input type="number" min="0" className={field} value={form.lengthCm} onChange={setField('lengthCm')} placeholder={t('packageHero.length_placeholder')} />
            </Labeled>
          </div>
        )}

        {/* Live estimate + CTA */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 bg-[#060f24] border border-yellow-400/20 rounded-md px-3 py-1.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t('packageHero.quote')}</span>
            <span className="text-lg font-bold text-yellow-400 leading-none">{formatEUR(estimatedCost)}</span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-yellow-400 text-[#060f24] px-5 py-2 rounded-md font-bold text-sm hover:bg-yellow-300 transition disabled:opacity-60 flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            {submitting ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('packageHero.submitting')}</>
            ) : (
              <>{t('packageHero.submit')} <ArrowRight className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      </form>
    );
  }
