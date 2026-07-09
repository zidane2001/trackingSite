import { Truck, Ship, Plane, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSeo } from '../hooks/useSeo';
import { IMAGES } from '../config/images';

export function Services() {
  const { t } = useTranslation();
  useSeo({ titleKey: 'seo.services_title', descKey: 'seo.services_desc', path: '/services' });

  const SERVICES = [
    {
      icon: Truck,
      img: IMAGES.serviceRoad,
      title: t('services.road_title'),
      subtitle: t('services.road_subtitle'),
      description: t('services.road_desc'),
      features: [t('services.road_f1'), t('services.road_f2'), t('services.road_f3'), t('services.road_f4'), t('services.road_f5')],
    },
    {
      icon: Ship,
      img: IMAGES.serviceSea,
      title: t('services.sea_title'),
      subtitle: t('services.sea_subtitle'),
      description: t('services.sea_desc'),
      features: [t('services.sea_f1'), t('services.sea_f2'), t('services.sea_f3'), t('services.sea_f4'), t('services.sea_f5')],
    },
    {
      icon: Plane,
      img: IMAGES.serviceAir,
      title: t('services.air_title'),
      subtitle: t('services.air_subtitle'),
      description: t('services.air_desc'),
      features: [t('services.air_f1'), t('services.air_f2'), t('services.air_f3'), t('services.air_f4'), t('services.air_f5')],
    },
  ];

  return (
    <div className="bg-[#eef2f6]">
      <section className="bg-[#060f24] text-white py-12 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center w-full overflow-x-hidden">
          <span className="text-gold text-xs font-bold uppercase tracking-[0.2em]">
            {t('services.badge')}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mt-3 mb-5">
            {t('services.title')}
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-lg">
            {t('services.desc')}
          </p>
        </div>
      </section>

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
                  {t('services.track_shipment')} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
