import { Truck, Ship, Plane, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../config/images';

const SERVICES = [
  {
    icon: Truck,
    img: IMAGES.serviceRoad,
    title: 'Transport routier',
    subtitle: 'National & continental',
    description:
      'Solutions terrestres fiables et flexibles pour vos expéditions nationales et européennes. Flotte moderne, suivi GPS en temps réel et délais maîtrisés.',
    features: [
      'Livraison porte-à-porte',
      'Suivi GPS en temps réel',
      'Délais de 24 à 72h en Europe',
      'Enlèvement à domicile possible',
      'Assurance colis incluse',
    ],
  },
  {
    icon: Ship,
    img: IMAGES.serviceSea,
    title: 'Fret maritime',
    subtitle: 'International',
    description:
      'Expédition économique de gros volumes par voie maritime. Idéal pour les envois internationaux non urgents avec un excellent rapport qualité-prix.',
    features: [
      "Conteneurs 20' et 40'",
      'Couverture mondiale',
      'Tarifs compétitifs',
      'Dédouanement inclus',
      'Suivi de conteneur en ligne',
    ],
  },
  {
    icon: Plane,
    img: IMAGES.serviceAir,
    title: 'Fret aérien',
    subtitle: 'Express international',
    description:
      "La solution la plus rapide pour vos expéditions urgentes à l'international. Réseau aérien mondial avec des délais de livraison garantis.",
    features: [
      'Livraison en 24-48h mondial',
      'Envois urgents et prioritaire',
      'Température contrôlée possible',
      'Dédouanement express',
      'Assurance sur mesure',
    ],
  },
];

export function Services() {
  return (
    <div className="bg-[#eef2f6]">
      {/* Hero */}
      <section className="bg-[#060f24] text-white py-12 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold text-xs font-bold uppercase tracking-[0.2em]">
            Nos solutions
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mt-3 mb-5">
            Des moyens de transport adaptés à chaque besoin
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-lg">
            Qu'il s'agisse d'un envoi national urgent ou d'un transport maritime de gros
            volumes, Youms Logistics offre la solution qu'il vous faut.
          </p>
        </div>
      </section>

      {/* Service cards */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-10 space-y-6 sm:space-y-10 pb-10 sm:pb-20">
        {SERVICES.map((s, i) => (
          <div
            key={s.title}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className={`grid md:grid-cols-2 ${i % 2 === 1 ? 'md:[&>div:first-child]:order-last' : ''}`}>
              <div className="relative h-64 md:h-auto">
                <img
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#060f24]/60 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <div className="w-14 h-14 bg-gold rounded-full flex items-center justify-center">
                    <s.icon className="w-7 h-7 text-[#060f24]" />
                  </div>
                </div>
              </div>
              <div className="p-5 sm:p-8 lg:p-10">
                <span className="text-xs font-bold text-gold uppercase tracking-wider">
                  {s.subtitle}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-2 mb-4">{s.title}</h2>
                <p className="text-slate-500 leading-relaxed mb-6">{s.description}</p>
                <ul className="space-y-2 mb-8">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/tracking"
                  className="inline-flex items-center gap-2 bg-[#060f24] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#0a1530] transition-colors"
                >
                  Suivre un envoi <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
