import { useState } from 'react';
import { User, Mail, Phone, Lock, Loader2, Save, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { profileApi } from '../../lib/api';

export function ClientProfile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [pwErr, setPwErr] = useState('');

  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const setPw = (k: keyof typeof passwords) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPasswords((p) => ({ ...p, [k]: e.target.value }));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg('');
    setProfileErr('');
    try {
      const updated = await profileApi.update(form);
      localStorage.setItem('youms_user', JSON.stringify(updated));
      window.location.reload();
    } catch (err: any) {
      setProfileErr(err?.message || t('client.profile_save_error'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSaving(true);
    setPwMsg('');
    setPwErr('');
    if (passwords.new !== passwords.confirm) {
      setPwErr(t('client.profile_password_match'));
      setPwSaving(false);
      return;
    }
    if (passwords.new.length < 6) {
      setPwErr(t('client.profile_password_length'));
      setPwSaving(false);
      return;
    }
    try {
      await profileApi.changePassword(passwords.current, passwords.new);
      setPwMsg(t('client.profile_password_success'));
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      setPwErr(err?.message || t('client.profile_password_error'));
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-3">
            <User className="w-6 h-6 text-yellow-500" />
            {t('client.profile_title')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t('client.profile_subtitle')}</p>
        </div>

        <form onSubmit={handleSaveProfile} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-slate-900 text-sm">{t('client.profile_personal')}</h2>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('client.profile_full_name')}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" required value={form.fullName} onChange={setField('fullName')} className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('client.profile_email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" required value={form.email} onChange={setField('email')} className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('client.profile_phone')}</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="tel" value={form.phone} onChange={setField('phone')} placeholder="+33 6 00 00 00 00" className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition" />
            </div>
          </div>
          {profileMsg && <p className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> {profileMsg}</p>}
          {profileErr && <p className="text-sm text-red-500">{profileErr}</p>}
          <button type="submit" disabled={saving} className="bg-gold text-[#060f24] px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gold-400 transition flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t('client.profile_save')}
          </button>
        </form>

        <form onSubmit={handleChangePassword} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-slate-900 text-sm">{t('client.profile_change_password')}</h2>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('client.profile_current_password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type={showCurrentPw ? 'text' : 'password'} required value={passwords.current} onChange={setPw('current')} className="w-full border border-slate-300 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition" />
              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('client.profile_new_password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type={showNewPw ? 'text' : 'password'} required value={passwords.new} onChange={setPw('new')} placeholder={t('client.profile_new_password_placeholder')} className="w-full border border-slate-300 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition" />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('client.profile_confirm_password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="password" required value={passwords.confirm} onChange={setPw('confirm')} className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition" />
            </div>
          </div>
          {pwMsg && <p className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> {pwMsg}</p>}
          {pwErr && <p className="text-sm text-red-500">{pwErr}</p>}
          <button type="submit" disabled={pwSaving} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 transition flex items-center gap-2 disabled:opacity-50">
            {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {t('client.profile_password_button')}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
