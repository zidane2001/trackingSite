import { Shield, Heart, Globe2, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSeo } from '../hooks/useSeo';
import { IMAGES } from '../config/images';

export function About() {
  const { t } = useTranslation();
  useSeo({ titleKey: 'seo.about_title', descKey: 'seo.about_desc', path: '/about' });

  const VALUES = [
    { icon: Shield, title: t('about.v1_title'), text: t('about.v1_text') },
    { icon: Heart, title: t('about.v2_title'), text: t('about.v2_text') },
    { icon: Globe2, title: t('about.v3_title'), text: t('about.v3_text') },
    { icon: Award, title: t('about.v4_title'), text: t('about.v4_text') },
  ];

  const MILESTONES = [
    { year: '2018', title: t('about.m1_title'), text: t('about.m1_text') },
    { year: '2020', title: t('about.m2_title'), text: t('about.m2_text') },
    { year: '2022', title: t('about.m3_title'), text: t('about.m3_text') },
    { year: '2024', title: t('about.m4_title'), text: t('about.m4_text') },
    { year: '2026', title: t('about.m5_title'), text: t('about.m5_text') },
  ];

  return (
    <div className="bg-[#eef2f6]">
      {/* Hero */}
      <section className="relative bg-[#060f24] text-white py-14 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${IMAGES.warehouse})` }} />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center w-full overflow-x-hidden">
          <span className="text-gold text-xs font-bold uppercase tracking-[0.2em]">{t('about.badge')}</span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mt-3 mb-5">
            {t('about.hero_title_1')}<br className="hidden sm:block" />{t('about.hero_title_2')}
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-lg">
            {t('about.hero_desc')}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 w-full overflow-x-hidden">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div>
            <span className="text-gold text-xs font-bold uppercase tracking-wider">{t('about.mission_badge')}</span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mt-3 mb-5">
              {t('about.mission_title')}
            </h2>
            <p className="text-slate-500 leading-relaxed mb-4">
              {t('about.mission_desc1')}
            </p>
            <p className="text-slate-500 leading-relaxed">
              {t('about.mission_desc2')}
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
            <span className="text-gold text-xs font-bold uppercase tracking-[0.2em]">{t('about.history_badge')}</span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mt-3">{t('about.history_title')}</h2>
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
