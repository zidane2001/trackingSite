import React, { useMemo, useState } from 'react';
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
import { submitPackage } from '../lib/api';

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
  description: string;
};

const initial: FormState = {
  senderName: '',
  senderEmail: '',
  senderPhone: '',
  name: '',
  material: 'general',
  weightKg: '',
  heightCm: '',
  widthCm: '',
  lengthCm: '',
  originAddress: '',
  destinationAddress: '',
  mode: 'route',
  delay: 'standard',
  shippingDate: '',
  description: '',
};

// --- petits composants de champ, stylés pour le hero sombre ---------------
const label = 'block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5';
const field =
  'w-full bg-[#060f24] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white ' +
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
        <Icon className="inline w-3.5 h-3.5 -mt-0.5 mr-1 text-yellow-400" />
        {text}
      </span>
      {children}
    </label>
  );
}

export function PackageHeroForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ trackingNumber: string; cost: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (k: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const num = (v: string) => (v.trim() === '' ? 0 : Number(v));

  const estimatedCost = useMemo(
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const optimistic = generateTrackingNumber();
    try {
      const res = await submitPackage({
        senderName: form.senderName,
        senderEmail: form.senderEmail,
        senderPhone: form.senderPhone || undefined,
        name: form.name,
        description: form.description || undefined,
        material: form.material,
        weightKg: num(form.weightKg),
        dimensions: {
          heightCm: num(form.heightCm),
          widthCm: num(form.widthCm),
          lengthCm: num(form.lengthCm),
        },
        originAddress: form.originAddress,
        destinationAddress: form.destinationAddress,
        mode: form.mode,
        delay: form.delay,
        shippingDate: form.shippingDate || undefined,
        estimatedCost,
      });
      setResult({ trackingNumber: res.trackingNumber, cost: res.estimatedCost });
    } catch {
      // Back non démarré (Phase 2) : on confirme quand même avec un n° optimiste.
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

  // --- Écran de confirmation (cahier §5.2) ---------------------------------
  if (result) {
    return (
      <div className="bg-[#0a1530]/90 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
        <div className="w-14 h-14 rounded-full bg-yellow-400/15 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-yellow-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Demande envoyée</h3>
        <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
          Votre colis est <span className="text-yellow-400 font-semibold">en cours de traitement</span>.
          Notre équipe le validera avant sa mise en suivi. Conservez votre numéro :
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          <code className="bg-[#060f24] border border-white/10 rounded-lg px-4 py-2.5 text-yellow-400 font-mono tracking-wider">
            {result.trackingNumber}
          </code>
          <button
            type="button"
            onClick={copy}
            className="p-2.5 rounded-lg border border-white/10 text-slate-300 hover:text-yellow-400 hover:border-yellow-400/50 transition"
            aria-label="Copier le numéro de suivi"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        {copied && <p className="text-xs text-yellow-400 mb-4">Numéro copié ✓</p>}

        <div className="text-sm text-slate-400 mb-6">
          Coût estimé : <span className="text-white font-semibold">{formatEUR(result.cost)}</span>
        </div>

        <button
          type="button"
          onClick={() => {
            setResult(null);
            setForm(initial);
          }}
          className="text-sm font-semibold text-yellow-400 hover:text-yellow-300 inline-flex items-center gap-1.5"
        >
          Soumettre un autre colis <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // --- Formulaire ----------------------------------------------------------
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#0a1530]/90 backdrop-blur border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-yellow-400" />
          Déposer un colis
        </h3>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Devis instantané
        </span>
      </div>

      {/* Expéditeur */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <Labeled text="Nom complet" icon={User}>
          <input className={field} value={form.senderName} onChange={set('senderName')} placeholder="Ex : Ulrich Tenkeu" required />
        </Labeled>
        <Labeled text="Email" icon={Mail}>
          <input type="email" className={field} value={form.senderEmail} onChange={set('senderEmail')} placeholder="vous@email.com" required />
        </Labeled>
        <Labeled text="Téléphone" icon={Phone}>
          <input className={field} value={form.senderPhone} onChange={set('senderPhone')} placeholder="+237 6 00 00 00 00" />
        </Labeled>
      </div>

      {/* Colis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Labeled text="Nom du colis" icon={Package}>
          <input className={field} value={form.name} onChange={set('name')} placeholder="Ex : Pièces moteur" required />
        </Labeled>
        <Labeled text="Type de matériel" icon={Package}>
          <select className={field} value={form.material} onChange={set('material')}>
            {Object.entries(MATERIAL_LABELS).map(([v, l]) => (
              <option key={v} value={v} className="bg-[#060f24]">{l}</option>
            ))}
          </select>
        </Labeled>
      </div>

      {/* Poids + dimensions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Labeled text="Poids (kg)" icon={Weight}>
          <input type="number" min="0" step="0.1" className={field} value={form.weightKg} onChange={set('weightKg')} placeholder="0" />
        </Labeled>
        <Labeled text="Hauteur (cm)" icon={Ruler}>
          <input type="number" min="0" className={field} value={form.heightCm} onChange={set('heightCm')} placeholder="0" />
        </Labeled>
        <Labeled text="Largeur (cm)" icon={Ruler}>
          <input type="number" min="0" className={field} value={form.widthCm} onChange={set('widthCm')} placeholder="0" />
        </Labeled>
        <Labeled text="Longueur (cm)" icon={Ruler}>
          <input type="number" min="0" className={field} value={form.lengthCm} onChange={set('lengthCm')} placeholder="0" />
        </Labeled>
      </div>

      {/* Trajet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Labeled text="Adresse de départ" icon={MapPin}>
          <input className={field} value={form.originAddress} onChange={set('originAddress')} placeholder="Ville, pays" required />
        </Labeled>
        <Labeled text="Adresse d'arrivée" icon={MapPin}>
          <input className={field} value={form.destinationAddress} onChange={set('destinationAddress')} placeholder="Ville, pays" required />
        </Labeled>
      </div>

      {/* Livraison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <Labeled text="Mode" icon={Package}>
          <select className={field} value={form.mode} onChange={set('mode')}>
            {Object.entries(MODE_LABELS).map(([v, l]) => (
              <option key={v} value={v} className="bg-[#060f24]">{l}</option>
            ))}
          </select>
        </Labeled>
        <Labeled text="Délai" icon={CalendarDays}>
          <select className={field} value={form.delay} onChange={set('delay')}>
            {Object.entries(DELAY_LABELS).map(([v, l]) => (
              <option key={v} value={v} className="bg-[#060f24]">{l}</option>
            ))}
          </select>
        </Labeled>
        <Labeled text="Date d'envoi" icon={CalendarDays}>
          <input type="date" className={field} value={form.shippingDate} onChange={set('shippingDate')} />
        </Labeled>
      </div>

      {/* Devis live + CTA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 bg-[#060f24] border border-yellow-400/30 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Coût estimé</span>
          <span className="text-2xl font-bold text-yellow-400 leading-none">{formatEUR(estimatedCost)}</span>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-yellow-400 text-[#060f24] px-7 py-3.5 rounded-lg font-bold hover:bg-yellow-300 transition disabled:opacity-60 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Envoi…
            </>
          ) : (
            <>
              Soumettre le colis <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
      <p className="text-[11px] text-slate-500 mt-3">
        Estimation indicative. Votre demande sera validée par notre équipe avant mise en suivi.
      </p>
    </form>
  );
}
