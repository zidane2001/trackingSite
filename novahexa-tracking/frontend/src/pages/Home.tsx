import React from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Ship,
  Plane,
  Package,
  Globe2,
  ShieldCheck,
  Clock,
  ArrowRight,
  FileText,
  PackageOpen,
  Search,
  CheckCircle2,
  Star,
  Quote,
} from 'lucide-react';
import { IMAGES } from '../config/images';
import { PackageHeroForm } from '../components/PackageHeroForm';

const STEPS = [
  {
    icon: FileText,
    title: 'Frais de port',
    text: "Réglez les frais d'expédition en ligne ou au guichet. Apposez l'étiquette fournie sur le colis.",
  },
  {
    icon: PackageOpen,
    title: 'Dépôt ou ramassage',
    text: 'Déposez le colis dans un point de collecte, ou demandez un enlèvement à domicile.',
  },
  {
    icon: Search,
    title: 'Suivi des colis',
    text: "Utilisez votre numéro de suivi pour suivre la progression du colis en temps réel.",
  },
  {
    icon: CheckCircle2,
    title: 'Livraison',
    text: "Le colis est remis au destinataire. En cas d'absence, un avis de passage est laissé.",
  },
];

const SERVICES = [
  {
    icon: Truck,
    img: IMAGES.serviceRoad,
    title: 'Transport routier',
    text: 'Solutions terrestres fiables et flexibles au niveau national et continental.',
  },
  {
    icon: Ship,
    img: IMAGES.serviceSea,
    title: 'Fret maritime',
    text: 'Expédition économique de gros volumes avec suivi complet de conteneurs.',
  },
  {
    icon: Plane,
    img: IMAGES.serviceAir,
    title: 'Fret aérien',
    text: "La solution la plus rapide pour vos expéditions urgentes à l'international.",
  },
];

const METRICS = [
  { icon: Package, value: '1M+', label: 'Colis livrés' },
  { icon: Globe2, value: '150+', label: 'Pays couverts' },
  { icon: ShieldCheck, value: '99.9%', label: 'Sécurité' },
  { icon: Clock, value: '24/7', label: 'Support' },
];

const TESTIMONIALS = [
  { name: 'Amina K.', city: 'Paris', text: "Service impeccable ! Mon colis est arrivé à Dakar en 4 jours. Le suivi en temps réel m'a rassuré tout au long du trajet.", stars: 5 },
  { name: 'Jean-Pierre M.', city: 'Calais', text: "Très professionnel. L'équipe a été réactive pour la validation de ma soumission. Je recommande vivement Novahexa Move.", stars: 5 },
  { name: 'Fatou D.', city: 'Bruxelles', text: "J'ai envoyé des pièces auto au Cameroun. Le transport routier était la bonne solution et tout s'est bien passé. Merci !", stars: 5 },
];

export function Home() {
  return (
    <div className="flex flex-col bg-[#eef2f6]">
      {/* ===================== HERO ===================== */}
      <section className="relative bg-[#060f24] text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${IMAGES.heroBackdrop})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060f24] via-[#060f24]/95 to-[#060f24]/70" aria-hidden />

        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-8 pt-16 pb-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
              <span className="h-px w-8 bg-yellow-400" />
              Transport &amp; logistique
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight mb-4">
              Déposez et suivez vos colis en{' '}
              <span className="text-yellow-400">temps réel</span>
            </h1>
            <p className="text-slate-300/90 mb-7 max-w-xl">
              Remplissez votre demande, obtenez un devis instantané et un numéro de
              suivi. Notre équipe valide chaque envoi avant sa mise en route.
            </p>
            <PackageHeroForm />
          </div>

          <div className="hidden lg:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img
                src={IMAGES.heroSubject}
                alt="Service de livraison Novahexa"
                className="w-full h-[520px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#060f24]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060f24]/80 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-5 left-5 bg-[#0a1530]/90 backdrop-blur border border-white/10 rounded-xl px-5 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400/15 flex items-center justify-center">
                <Truck className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-sm font-bold leading-none">Livraison express</div>
                <div className="text-[11px] text-slate-400 mt-1">Air · Mer · Route</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SERVICES ===================== */}
      <section id="services" className="max-w-[1400px] mx-auto px-6 lg:px-8 -mt-14 w-full relative z-20 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:border-yellow-400 transition-colors group"
            >
              <div className="h-36 overflow-hidden">
                <img
                  src={s.img}
                  alt={s.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-7">
                <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mb-5 -mt-12 relative border-4 border-white">
                  <s.icon className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-5">{s.text}</p>
                <Link to="/services" className="text-[#060f24] font-bold text-sm flex items-center gap-2 group-hover:text-yellow-500 transition-colors">
                  En savoir plus <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== PROCESSUS 4 ÉTAPES ===================== */}
      <section className="bg-[#060f24] py-20 mb-0">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-yellow-400 text-xs font-bold uppercase tracking-[0.2em]">
              Comment ça marche
            </span>
            <h2 className="text-3xl font-bold text-white mt-3">Votre colis, en 4 étapes</h2>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="hidden md:block absolute top-9 left-[12%] right-[12%] border-t-2 border-dashed border-yellow-400/30" aria-hidden />
            {STEPS.map((step) => (
              <div key={step.title} className="relative text-center">
                <div className="w-[72px] h-[72px] rounded-full bg-yellow-400 flex items-center justify-center mx-auto mb-5 relative z-10 shadow-lg shadow-yellow-400/20">
                  <step.icon className="w-8 h-8 text-[#060f24]" />
                </div>
                <h3 className="text-yellow-400 font-bold mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== ENTREPÔT À GRANDE ÉCHELLE ===================== */}
      <section className="relative">
        <div className="relative h-[420px] overflow-hidden">
          <img src={IMAGES.warehouse} alt="Entrepôt de stockage à grande échelle" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060f24]/95 via-[#060f24]/70 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 w-full">
              <div className="max-w-lg">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  Entrepôt de stockage à grande échelle
                </h2>
                <p className="text-slate-300 mb-7">
                  Grâce à nos projets de logistique et de transport, nous relions les
                  continents, rapprochons les entreprises et facilitons le commerce
                  international.
                </p>
                <a
                  href="#services"
                  className="inline-flex items-center gap-2 bg-yellow-400 text-[#060f24] px-7 py-3 rounded-lg font-bold hover:bg-yellow-300 transition"
                >
                  Découvrir <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CHIFFRES CLÉS ===================== */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-20 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {METRICS.map((m) => (
            <div key={m.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                <m.icon className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 leading-none mb-1">{m.value}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{m.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== TÉMOIGNAGES ===================== */}
      <section className="bg-white py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-yellow-500 text-xs font-bold uppercase tracking-[0.2em]">
              Témoignages
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-3">Ce que disent nos clients</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-[#eef2f6] rounded-2xl p-7 border border-slate-200">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-yellow-400/30 mb-3" />
                <p className="text-slate-600 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#060f24] flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA FINAL ===================== */}
      <section className="bg-[#060f24] py-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à expédier votre colis ?
          </h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Créez votre compte gratuitement et commencez à suivre vos envois en temps réel.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/register"
              className="bg-yellow-400 text-[#060f24] px-8 py-3.5 rounded-lg font-bold hover:bg-yellow-300 transition flex items-center gap-2"
            >
              Créer un compte <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/tracking"
              className="border border-white/20 text-white px-8 py-3.5 rounded-lg font-bold hover:bg-white/10 transition flex items-center gap-2"
            >
              Suivre un envoi <Search className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
