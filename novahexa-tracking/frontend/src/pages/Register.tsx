import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { IMAGES } from '../config/images';

export function Register() {
  const { t } = useTranslation();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const passwordStrength = (() => {
    const p = form.password;
    if (p.length < 6) return 0;
    let s = 1;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 4);
  })();

  const strengthLabel = ['', t('register.strength_weak'), t('register.strength_medium'), t('register.strength_good'), t('register.strength_strong')];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-blue-500', 'bg-emerald-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError(t('register.error_password_match'));
      return;
    }
    if (form.password.length < 6) {
      setError(t('register.error_password_length'));
      return;
    }
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || t('register.error_generic'));
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#eef2f6] flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{t('register.success_title')}</h2>
          <p className="text-slate-500 mb-6">
            {t('register.success_desc')} <strong>{form.email}</strong>. {t('register.success_desc2')}
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-gold text-[#060f24] px-6 py-3 rounded-lg font-bold text-sm hover:bg-gold-400 transition"
          >
            {t('register.login')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef2f6] flex flex-col">
      <div className="bg-[#060f24] py-16">
        <div className="max-w-md mx-auto px-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={IMAGES.LOGO} alt="Youms Logistics" className="h-12 w-12 object-contain" />
            <span className="text-white font-bold text-xl">Youms Logistics</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">{t('register.title')}</h1>
          <p className="text-slate-400 mt-2">{t('register.subtitle')}</p>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center -mt-8 px-6 pb-16">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('register.full_name')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" required value={form.fullName} onChange={set('fullName')} placeholder={t('register.full_name_placeholder')} className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('register.email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" required value={form.email} onChange={set('email')} placeholder="vous@email.com" className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('register.phone')} <span className="text-slate-400 font-normal">({t('register.phone_optional')})</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+33 6 00 00 00 00" className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('register.password')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={set('password')} placeholder={t('register.password_placeholder')} className="w-full border border-slate-300 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${strengthColor[passwordStrength]}`} style={{ width: `${(passwordStrength / 4) * 100}%` }} />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">{strengthLabel[passwordStrength]}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('register.confirm_password')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" required value={form.confirmPassword} onChange={set('confirmPassword')} placeholder={t('register.confirm_password_placeholder')} className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition" />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-gold text-[#060f24] py-3 rounded-lg font-bold text-sm hover:bg-gold-400 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {t('register.submit')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {t('register.has_account')}{' '}
            <Link to="/login" className="text-gold hover:underline font-medium">
              {t('register.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
