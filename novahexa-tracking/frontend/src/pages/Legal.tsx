import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSeo } from '../hooks/useSeo';

export function Legal() {
  const { t } = useTranslation();
  useSeo({ titleKey: 'seo.cgu_title', descKey: 'seo.cgu_desc', path: '/legal/cgu' });

  return (
    <div className="bg-[#eef2f6]">
      <section className="bg-[#060f24] text-white py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <span className="text-yellow-400 text-xs font-bold uppercase tracking-[0.2em]">{t('legal.cgu_badge')}</span>
          <h1 className="text-4xl font-bold mt-3 mb-5">{t('legal.cgu_title')}</h1>
        </div>
      </section>
      <section className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 prose prose-slate max-w-none">
          <h2>{t('legal.cgu_a1_t')}</h2>
          <p>{t('legal.cgu_a1')}</p>

          <h2>{t('legal.cgu_a2_t')}</h2>
          <p>{t('legal.cgu_a2')}</p>

          <h2>{t('legal.cgu_a3_t')}</h2>
          <p>{t('legal.cgu_a3')}</p>
          <ul>
            <li>{t('legal.cgu_a3_li1')}</li>
            <li>{t('legal.cgu_a3_li2')}</li>
            <li>{t('legal.cgu_a3_li3')}</li>
            <li>{t('legal.cgu_a3_li4')}</li>
          </ul>

          <h2>{t('legal.cgu_a4_t')}</h2>
          <p>{t('legal.cgu_a4')}</p>

          <h2>{t('legal.cgu_a5_t')}</h2>
          <p>{t('legal.cgu_a5')} <Link to="/legal/privacy" className="text-yellow-500 hover:underline">{t('legal.cgu_a5_link')}</Link>.</p>

          <h2>{t('legal.cgu_a6_t')}</h2>
          <p>{t('legal.cgu_a6')}</p>

          <h2>{t('legal.cgu_a7_t')}</h2>
          <p>{t('legal.cgu_a7')}</p>

          <h2>{t('legal.cgu_a8_t')}</h2>
          <p>{t('legal.cgu_a8')}</p>

          <p className="text-sm text-slate-400 mt-8">{t('legal.last_updated')}</p>
        </div>
      </section>
    </div>
  );
}

export function PrivacyPolicy() {
  const { t } = useTranslation();
  useSeo({ titleKey: 'seo.privacy_title', descKey: 'seo.privacy_desc', path: '/legal/privacy' });

  return (
    <div className="bg-[#eef2f6]">
      <section className="bg-[#060f24] text-white py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <span className="text-yellow-400 text-xs font-bold uppercase tracking-[0.2em]">{t('legal.privacy_badge')}</span>
          <h1 className="text-4xl font-bold mt-3 mb-5">{t('legal.privacy_title')}</h1>
        </div>
      </section>
      <section className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 prose prose-slate max-w-none">
          <h2>{t('legal.privacy_collect_title')}</h2>
          <p>{t('legal.privacy_collect')}</p>
          <ul>
            <li><strong>{t('legal.privacy_collect_li1')}</strong></li>
            <li><strong>{t('legal.privacy_collect_li2')}</strong></li>
            <li><strong>{t('legal.privacy_collect_li3')}</strong></li>
          </ul>

          <h2>{t('legal.privacy_purpose_title')}</h2>
          <p>{t('legal.privacy_purpose')}</p>
          <ul>
            <li>{t('legal.privacy_purpose_li1')}</li>
            <li>{t('legal.privacy_purpose_li2')}</li>
            <li>{t('legal.privacy_purpose_li3')}</li>
            <li>{t('legal.privacy_purpose_li4')}</li>
          </ul>

          <h2>{t('legal.privacy_legal_title')}</h2>
          <p>{t('legal.privacy_legal')}</p>

          <h2>{t('legal.privacy_duration_title')}</h2>
          <p>{t('legal.privacy_duration')}</p>

          <h2>{t('legal.privacy_rights_title')}</h2>
          <p>{t('legal.privacy_rights')}</p>

          <p className="text-sm text-slate-400 mt-8">{t('legal.last_updated')}</p>
        </div>
      </section>
    </div>
  );
}

export function CookiePolicy() {
  const { t } = useTranslation();
  useSeo({ titleKey: 'seo.cookies_title', descKey: 'seo.cookies_desc', path: '/legal/cookies' });

  return (
    <div className="bg-[#eef2f6]">
      <section className="bg-[#060f24] text-white py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <span className="text-yellow-400 text-xs font-bold uppercase tracking-[0.2em]">{t('legal.cookie_badge')}</span>
          <h1 className="text-4xl font-bold mt-3 mb-5">{t('legal.cookie_title')}</h1>
        </div>
      </section>
      <section className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 prose prose-slate max-w-none">
          <h2>{t('legal.cookie_what_title')}</h2>
          <p>{t('legal.cookie_what')}</p>

          <h2>{t('legal.cookie_types_title')}</h2>
          <ul>
            <li>{t('legal.cookie_types_li1')}</li>
            <li>{t('legal.cookie_types_li2')}</li>
            <li>{t('legal.cookie_types_li3')}</li>
          </ul>

          <h2>{t('legal.cookie_manage_title')}</h2>
          <p>{t('legal.cookie_manage')}</p>

          <h2>{t('legal.cookie_third_title')}</h2>
          <p>{t('legal.cookie_third')}</p>

          <p className="text-sm text-slate-400 mt-8">{t('legal.last_updated')}</p>
        </div>
      </section>
    </div>
  );
}
