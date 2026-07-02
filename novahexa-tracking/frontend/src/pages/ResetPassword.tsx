import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { authApi } from '../lib/api';
import { IMAGES } from '../config/images';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!token) {
    return (
      <div className="min-h-screen bg-[#eef2f6] flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 w-full max-w-md text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Lien invalide</h2>
          <p className="text-sm text-slate-500 mb-6">Ce lien de réinitialisation est invalide ou a expiré.</p>
          <Link to="/forgot-password" className="inline-flex items-center gap-2 bg-yellow-400 text-[#060f24] px-6 py-3 rounded-lg font-bold text-sm hover:bg-yellow-300 transition">
            Faire une nouvelle demande
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      setStatus('error');
      return;
    }
    if (password.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      await authApi.resetPassword(token, password);
      setStatus('success');
      setMessage('Votre mot de passe a été réinitialisé avec succès.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Lien expiré ou invalide. Veuillez faire une nouvelle demande.');
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 w-full max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <img src={IMAGES.LOGO} alt="Youms Logistics" className="h-10 w-10 object-contain" />
          <span className="text-slate-900 font-bold text-lg">Youms Logistics</span>
        </Link>

        {status === 'success' ? (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Mot de passe réinitialisé</h2>
            <p className="text-sm text-slate-500 mb-6">{message}</p>
            <Link to="/login" className="inline-flex items-center gap-2 bg-yellow-400 text-[#060f24] px-6 py-3 rounded-lg font-bold text-sm hover:bg-yellow-300 transition">
              Se connecter
            </Link>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Lock className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Nouveau mot de passe</h2>
            <p className="text-sm text-slate-500 mb-6">Choisissez un mot de passe sécurisé pour votre compte.</p>

            <form onSubmit={handleSubmit} className="text-left">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mot de passe</label>
              <div className="relative mb-4">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6 caractères minimum"
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 transition"
                />
              </div>

              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirmer</label>
              <div className="relative mb-4">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retapez le mot de passe"
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 transition"
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-500 mb-3">{message}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-yellow-400 text-[#060f24] py-3 rounded-lg font-bold text-sm hover:bg-yellow-300 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Réinitialiser le mot de passe
              </button>
            </form>

            <Link to="/login" className="inline-flex items-center gap-1.5 mt-4 text-sm text-slate-500 hover:text-slate-700">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour à la connexion
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
