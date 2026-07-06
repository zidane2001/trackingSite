import React, { useState } from 'react';
import { Send, MapPin, Phone, Mail, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { contactApi } from '../lib/api';

export function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    setSubmitting(true);
    setError('');
    try {
      await contactApi.submit(form);
      setSent(true);
    } catch {
      setError(t('contact.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#eef2f6]">
      <section className="bg-[#060f24] text-white py-12 sm:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center w-full overflow-x-hidden">
          <span className="text-gold text-xs font-bold uppercase tracking-[0.2em]">{t('contact.badge')}</span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-3 mb-5">{t('contact.hero_title')}</h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            {t('contact.hero_desc')}
          </p>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 w-full overflow-x-hidden">
        <div className="grid lg:grid-cols-[1fr_400px] gap-6 lg:gap-12">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8">
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('contact.sent_title')}</h3>
                <p className="text-slate-500">
                  {t('contact.sent_desc')}
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}
                  className="mt-6 text-sm font-semibold text-gold hover:text-gold-600"
                >
                  {t('contact.send_another')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold text-slate-900 mb-6">{t('contact.form_title')}</h2>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('contact.label_name')}</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={set('name')}
                      placeholder={t('contact.placeholder_name')}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('contact.label_email')}</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={set('email')}
                      placeholder={t('contact.placeholder_email')}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('contact.label_message')}</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={set('message')}
                      placeholder={t('contact.placeholder_message')}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition resize-none"
                    />
                  </div>
                </div>
                <label className="flex items-start gap-3 mb-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 rounded border-slate-300 text-gold focus:ring-gold"
                  />
                  <span className="text-sm text-slate-500">
                    {t('contact.consent')}
                  </span>
                </label>
                {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting || !agreed}
                  className="bg-gold text-[#060f24] px-6 py-3 rounded-lg font-bold text-sm hover:bg-gold-400 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {t('contact.send')}
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">{t('contact.info_title')}</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t('contact.address_label')}</p>
                    <p className="text-sm text-slate-500">{t('contact.address_value')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t('contact.whatsapp_label')}</p>
                    <a
                      href="https://wa.me/33656817785"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-500 hover:text-green-600 transition-colors duration-200"
                    >
                      +33 6 56 81 77 85
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t('contact.email_label')}</p>
                    <p className="text-sm text-slate-500">youmslogistics@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t('contact.hours_label')}</p>
                    <p className="text-sm text-slate-500">{t('contact.hours_value')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-48">
              <iframe
                title="Localisation Youms Logistics"
                src="https://www.openstreetmap.org/export/embed.html?bbox=2.88,42.69,2.91,42.71&layer=mapnik&marker=42.6988,2.8959"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
