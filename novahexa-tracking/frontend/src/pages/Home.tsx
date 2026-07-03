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
import { useScrollReveal } from '../hooks/useScrollReveal';

/* ── Reveal wrapper ─────────────────────────────────────────── */
function Reveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  delay?: number;
  className?: string;
}) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={`reveal reveal-${direction} ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

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
  { name: 'Jean-Pierre M.', city: 'Calais', text: "Très professionnel. L'équipe a été réactive pour la validation de ma soumission. Je recommande vivement Youms Logistics.", stars: 5 },
  { name: 'Fatou D.', city: 'Bruxelles', text: "J'ai envoyé des pièces auto au Cameroun. Le transport routier était la bonne solution et tout s'est bien passé. Merci !", stars: 5 },
];

export function Home() {
  return (
    <div className="flex flex-col bg-[#eef2f6]">
      {/* ===================== HERO ===================== */}
      <section className="relative bg-[#060f24] text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
          style={{ backgroundImage: `url(${IMAGES.heroBackdrop})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060f24] via-[#060f24]/95 to-[#060f24]/70" aria-hidden />

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-16 sm:pb-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-6 sm:gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-[0.2em] mb-3 sm:mb-4 animate-hero-badge">
              <span className="h-px w-8 bg-gold" />
              Transport &amp; logistique
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight mb-3 sm:mb-4 animate-hero-title">
              Déposez et suivez vos colis en{' '}
              <span className="text-gold relative inline-block">
                temps réel
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gold/40 animate-shimmer" />
              </span>
            </h1>
            <div className="animate-hero-desc">
              <p className="text-slate-300/90 mb-5 sm:mb-7 max-w-xl text-sm sm:text-base">
                Remplissez votre demande, obtenez un devis instantané et un numéro de
                suivi. Notre équipe valide chaque envoi avant sa mise en route.
              </p>
              <PackageHeroForm />
            </div>
          </div>

          <div className="hidden lg:block relative animate-hero-image">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img
                src={IMAGES.heroSubject}
                alt="Service de livraison Youms Logistics"
                className="w-full h-[520px] object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#060f24]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060f24]/80 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-5 left-5 bg-[#0a1530]/90 backdrop-blur border border-white/10 rounded-xl px-5 py-3 flex items-center gap-3 animate-float">
              <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center animate-pulse-glow">
                <Truck className="w-5 h-5 text-gold" />
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
      <section id="services" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-14 w-full relative z-20 mb-12 sm:mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} direction="up" delay={i * 120}>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:border-gold transition-all duration-300 group hover:shadow-lg hover:shadow-gold/10 hover:-translate-y-1">
                <div className="h-28 sm:h-36 overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-5 sm:p-7">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gold-50 rounded-full flex items-center justify-center mb-4 sm:mb-5 -mt-10 sm:-mt-12 relative border-4 border-white group-hover:bg-gold/20 transition-colors duration-300">
                    <s.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 group-hover:text-gold transition-colors duration-300">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4 sm:mb-5">{s.text}</p>
                  <Link to="/services" className="text-[#060f24] font-bold text-sm flex items-center gap-2 group-hover:text-gold transition-colors duration-300">
                    En savoir plus <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===================== PROCESSUS 4 ÉTAPES ===================== */}
      <section className="bg-[#060f24] py-12 sm:py-20 mb-0">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal direction="up">
            <div className="text-center mb-8 sm:mb-14">
              <span className="text-gold text-xs font-bold uppercase tracking-[0.2em]">
                Comment ça marche
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3">Votre colis, en 4 étapes</h2>
            </div>
          </Reveal>
          <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="hidden md:block absolute top-9 left-[12%] right-[12%] border-t-2 border-dashed border-gold/30" aria-hidden />
            {STEPS.map((step, i) => (
              <Reveal key={step.title} direction="scale" delay={i * 150}>
                <div className="relative text-center group">
                  <div className="w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-full bg-gold flex items-center justify-center mx-auto mb-3 sm:mb-5 relative z-10 shadow-lg shadow-gold/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-gold/40 group-hover:bg-gold-400">
                    <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#060f24]" />
                  </div>
                  <h3 className="text-gold font-bold mb-1 sm:mb-2 text-sm sm:text-base">{step.title}</h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== ENTREPÔT À GRANDE ÉCHELLE ===================== */}
      <section className="relative">
        <Reveal direction="scale">
          <div className="relative h-[250px] sm:h-[320px] lg:h-[420px] overflow-hidden group">
            <img
              src={IMAGES.warehouse}
              alt="Entrepôt de stockage à grande échelle"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#060f24]/95 via-[#060f24]/70 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-lg">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-2 sm:mb-4">
                    Entrepôt de stockage à grande échelle
                  </h2>
                  <p className="text-slate-300 mb-4 sm:mb-7 text-sm sm:text-base">
                    Grâce à nos projets de logistique et de transport, nous relions les
                    continents, rapprochons les entreprises et facilitons le commerce
                    international.
                  </p>
                  <a
                    href="#services"
                    className="group inline-flex items-center gap-2 bg-gold text-[#060f24] px-5 sm:px-7 py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base hover:bg-gold-400 transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 hover:-translate-y-0.5"
                  >
                    Découvrir <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===================== CHIFFRES CLÉS ===================== */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {METRICS.map((m, i) => (
            <Reveal key={m.label} direction="up" delay={i * 100}>
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3 sm:gap-4 transition-all duration-300 hover:shadow-md hover:border-gold/30 hover:-translate-y-1 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gold-50 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-gold/20 group-hover:scale-110">
                  <m.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 leading-none mb-0.5 sm:mb-1">{m.value}</div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">{m.label}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===================== TÉMOIGNAGES ===================== */}
      <section className="bg-white py-12 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal direction="up">
            <div className="text-center mb-8 sm:mb-14">
              <span className="text-gold text-xs font-bold uppercase tracking-[0.2em]">
                Témoignages
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">Ce que disent nos clients</h2>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} direction="up" delay={i * 120}>
                <div className="bg-[#eef2f6] rounded-2xl p-5 sm:p-7 border border-slate-200 transition-all duration-300 hover:shadow-lg hover:border-gold/30 hover:-translate-y-1 h-full">
                  <div className="flex items-center gap-1 mb-3 sm:mb-4">
                    {[...Array(t.stars)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-gold text-gold transition-transform duration-300 hover:scale-125" />
                    ))}
                  </div>
                  <Quote className="w-7 h-7 sm:w-8 sm:h-8 text-gold/30 mb-2 sm:mb-3" />
                  <p className="text-slate-600 text-sm leading-relaxed mb-4 sm:mb-5">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#060f24] flex items-center justify-center text-white font-bold text-sm transition-all duration-300 group-hover:bg-gold group-hover:scale-110">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.city}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA FINAL ===================== */}
      <section className="bg-[#060f24] py-10 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal direction="up">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
              Prêt à expédier votre colis ?
            </h2>
            <p className="text-slate-300 mb-6 sm:mb-8 max-w-xl mx-auto text-sm sm:text-base">
              Créez votre compte gratuitement et commencez à suivre vos envois en temps réel.
            </p>
          </Reveal>
          <Reveal direction="up" delay={200}>
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-col sm:flex-row">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-gold text-[#060f24] px-8 py-3.5 rounded-lg font-bold hover:bg-gold-400 transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-gold/20 hover:-translate-y-0.5"
              >
                Créer un compte <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/tracking"
                className="w-full sm:w-auto border border-white/20 text-white px-8 py-3.5 rounded-lg font-bold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 hover:border-white/40 hover:-translate-y-0.5"
              >
                Suivre un envoi <Search className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
