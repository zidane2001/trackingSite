import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authApi } from '../lib/api';
import { IMAGES } from '../config/images';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('sending');
    try {
      await authApi.forgotPassword(email);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 w-full max-w-md text-center">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <img src={IMAGES.LOGO} alt="Youms Logistics" className="h-10 w-10 object-contain" />
          <span className="text-slate-900 font-bold text-lg">Youms Logistics</span>
        </Link>

        {status === 'sent' ? (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Email envoyé</h2>
            <p className="text-sm text-slate-500 mb-6">
              Si un compte est associé à <strong>{email}</strong>, vous recevrez un lien de réinitialisation.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-yellow-400 text-[#060f24] px-6 py-3 rounded-lg font-bold text-sm hover:bg-yellow-300 transition"
            >
              Retour à la connexion
            </Link>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Mail className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Mot de passe oublié ?</h2>
            <p className="text-sm text-slate-500 mb-6">
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            <form onSubmit={handleSubmit} className="text-left">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <div className="relative mb-4">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@email.com"
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-yellow-400 transition"
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-500 mb-3">Erreur lors de l'envoi. Veuillez réessayer.</p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-yellow-400 text-[#060f24] py-3 rounded-lg font-bold text-sm hover:bg-yellow-300 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {status === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Envoyer le lien
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
