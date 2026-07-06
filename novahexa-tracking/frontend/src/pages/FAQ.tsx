import { useState, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { faqApi } from '../lib/api';

export function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<{ q: string; a: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const FALLBACK_DATA = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') },
    { q: t('faq.q6'), a: t('faq.a6') },
    { q: t('faq.q7'), a: t('faq.a7') },
    { q: t('faq.q8'), a: t('faq.a8') },
  ];

  useEffect(() => {
    faqApi.list()
      .then((data) => {
        if (data.length > 0) {
          setItems(data.map((item) => ({ q: item.question, a: item.answer })));
        } else {
          setItems(FALLBACK_DATA);
        }
      })
      .catch(() => setItems(FALLBACK_DATA))
      .finally(() => setLoading(false));
  }, [t]);

  const filtered = items.filter(
    (item) =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-[#eef2f6]">
      <section className="bg-[#060f24] text-white py-12 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full overflow-x-hidden">
          <span className="text-yellow-400 text-xs font-bold uppercase tracking-[0.2em]">{t('faq.badge')}</span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-3 mb-5">{t('faq.title')}</h1>
          <p className="text-slate-300 mb-8">
            {t('faq.desc')}
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={t('faq.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0a1530] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400/50 transition"
            />
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">{t('faq.loading')}</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-900 pr-4">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200',
                      openIndex === i && 'rotate-180',
                    )}
                  />
                </button>
                {openIndex === i && (
                  <div className="px-6 pb-5 text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-slate-400 py-12">{t('faq.no_results')}</p>
        )}
      </section>
    </div>
  );
}
