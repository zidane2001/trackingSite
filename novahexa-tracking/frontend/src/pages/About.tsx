import React from 'react';
import { Shield, Heart, Globe2, Award } from 'lucide-react';
import { IMAGES } from '../config/images';

const VALUES = [
  { icon: Shield, title: 'Fiabilité', text: 'Chaque colis est traité avec le plus grand soin. Nous garantissons la sécurité de vos envois.' },
  { icon: Heart, title: 'Engagement', text: "Votre satisfaction est notre priorité. Notre équipe est disponible 24/7 pour vous accompagner." },
  { icon: Globe2, title: 'Ouverture', text: "Présents sur plus de 150 pays, nous connectons les continents et facilitons le commerce international." },
  { icon: Award, title: 'Excellence', text: 'Standards de qualité élevés à chaque étape, du dépôt à la livraison finale.' },
];

const MILESTONES = [
  { year: '2018', title: 'Création', text: "Fondation de Youms Logistics à Calais, spécialisée en transport routier européen." },
  { year: '2020', title: 'Expansion maritime', text: 'Lancement des services de fret maritime vers l\'Afrique et l\'Asie.' },
  { year: '2022', title: 'Fret aérien', text: 'Ajout du fret aérien express avec couverture mondiale.' },
  { year: '2024', title: 'Plateforme digitale', text: 'Mise en ligne de la plateforme de suivi en temps réel.' },
  { year: '2026', title: 'Innovation', text: 'Intégration de la simulation de trajet et des notifications intelligentes.' },
];

export function About() {
  return (
    <div className="bg-[#eef2f6]">
      {/* Hero */}
      <section className="relative bg-[#060f24] text-white py-14 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${IMAGES.warehouse})` }} />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold text-xs font-bold uppercase tracking-[0.2em]">À propos</span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mt-3 mb-5">
            Nous connectons le monde,<br className="hidden sm:block" />un colis à la fois
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-lg">
            Depuis 2018, Youms Logistics accompagne particuliers et entreprises dans leurs
            expéditions nationales et internationales avec rigueur et innovation.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div>
            <span className="text-gold text-xs font-bold uppercase tracking-wider">Notre mission</span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mt-3 mb-5">
              Rendre le transport international accessible à tous
            </h2>
            <p className="text-slate-500 leading-relaxed mb-4">
              Youms Logistics est née d'une conviction simple : le transport de colis
              à l'international devrait être simple, transparent et abordable. Notre plateforme
              permet à chacun de soumettre, suivre et gérer ses envois en toute confiance.
            </p>
            <p className="text-slate-500 leading-relaxed">
              De Calais au monde entier, nous mettons à votre disposition notre expertise
              logistique, nos partenariats avec les meilleurs transporteurs et une technologie
              de pointe pour offrir une expérience de suivi sans pareil.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <v.icon className="w-8 h-8 text-gold mb-3" />
                <h3 className="font-bold text-slate-900 mb-1">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-[#060f24] py-10 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-gold text-xs font-bold uppercase tracking-[0.2em]">Notre histoire</span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mt-3">Les étapes clés</h2>
          </div>
          <div className="relative">
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-white/10 sm:-translate-x-1/2" />
            <div className="space-y-8 sm:space-y-12">
              {MILESTONES.map((m, i) => (
                <div key={m.year} className={`relative flex items-center ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                  <div className="w-full sm:w-1/2 pl-10 sm:pl-8">
                    <div className={`bg-white/5 border border-white/10 rounded-xl p-6 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <span className="text-gold font-bold text-lg">{m.year}</span>
                      <h3 className="text-white font-bold mt-1">{m.title}</h3>
                      <p className="text-slate-400 text-sm mt-1">{m.text}</p>
                    </div>
                  </div>
                  <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-gold rounded-full border-3 sm:border-4 border-[#060f24] z-10" />
                  <div className="hidden sm:block w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
