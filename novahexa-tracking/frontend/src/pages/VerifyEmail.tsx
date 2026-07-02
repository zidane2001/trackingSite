import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { authApi } from '../lib/api';
import { IMAGES } from '../config/images';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Lien de vérification invalide — aucun token fourni.');
      return;
    }
    authApi.verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.message || 'Votre email a été vérifié avec succès !');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err?.message || 'Lien de vérification invalide ou expiré.');
      });
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResendStatus('sending');
    try {
      await authApi.resendVerification(resendEmail);
      setResendStatus('sent');
    } catch {
      setResendStatus('error');
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

        {/* Loading */}
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-yellow-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Vérification en cours…</h2>
            <p className="text-sm text-slate-500">Nous validons votre adresse email.</p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Email vérifié ✓</h2>
            <p className="text-sm text-slate-500 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-yellow-400 text-[#060f24] px-6 py-3 rounded-lg font-bold text-sm hover:bg-yellow-300 transition"
            >
              Se connecter
            </Link>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Vérification échouée</h2>
            <p className="text-sm text-slate-500 mb-6">{message}</p>

            {/* Resend form */}
            <div className="bg-slate-50 rounded-xl p-5 text-left">
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-yellow-500" />
                Renvoyer un email de vérification
              </h3>
              {resendStatus === 'sent' ? (
                <p className="text-sm text-emerald-600 font-medium">Email envoyé ! Vérifiez votre boîte de réception.</p>
              ) : (
                <form onSubmit={handleResend} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 transition"
                  />
                  <button
                    type="submit"
                    disabled={resendStatus === 'sending'}
                    className="bg-yellow-400 text-[#060f24] px-4 py-2 rounded-lg font-bold text-sm hover:bg-yellow-300 transition disabled:opacity-50"
                  >
                    {resendStatus === 'sending' ? '…' : 'Envoyer'}
                  </button>
                </form>
              )}
              {resendStatus === 'error' && (
                <p className="text-xs text-red-500 mt-2">Erreur lors de l'envoi. Vérifiez l'adresse email.</p>
              )}
            </div>

            <Link to="/login" className="inline-block mt-4 text-sm text-slate-500 hover:text-slate-700">
              Retour à la connexion
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
