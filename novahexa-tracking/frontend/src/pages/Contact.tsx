import React, { useState } from 'react';
import { Send, MapPin, Phone, Mail, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { contactApi } from '../lib/api';

export function Contact() {
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
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#eef2f6]">
      <section className="bg-[#060f24] text-white py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 text-center">
          <span className="text-gold text-xs font-bold uppercase tracking-[0.2em]">Contact</span>
          <h1 className="text-4xl font-bold mt-3 mb-5">Nous contacter</h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Une question, une demande de devis ou un besoin d'assistance ? Notre équipe vous répond sous 24h.
          </p>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Message envoyé !</h3>
                <p className="text-slate-500">
                  Merci pour votre message. Notre équipe vous répondra sous 24 heures.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}
                  className="mt-6 text-sm font-semibold text-gold hover:text-gold-600"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold text-slate-900 mb-6">Envoyez-nous un message</h2>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom complet</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={set('name')}
                      placeholder="Votre nom"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={set('email')}
                      placeholder="vous@email.com"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={set('message')}
                      placeholder="Décrivez votre demande..."
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
                    J'accepte les conditions générales d'utilisation et la politique de confidentialité.
                  </span>
                </label>
                {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting || !agreed}
                  className="bg-gold text-[#060f24] px-6 py-3 rounded-lg font-bold text-sm hover:bg-gold-400 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Envoyer le message
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Nos coordonnées</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Adresse</p>
                    <p className="text-sm text-slate-500">5 Rue du Beau Marais, 62100 Calais, France</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Téléphone</p>
                    <p className="text-sm text-slate-500">+33 3 21 00 00 00</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Email</p>
                    <p className="text-sm text-slate-500">contact@youmslogistics.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Horaires</p>
                    <p className="text-sm text-slate-500">Lun - Sam : 8h00 - 19h00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-48">
              <iframe
                title="Localisation Youms Logistics"
                src="https://www.openstreetmap.org/export/embed.html?bbox=1.85,50.94,1.87,50.95&layer=mapnik&marker=50.945,1.855"
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
