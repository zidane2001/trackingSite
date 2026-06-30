import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { IMAGES } from '../config/images';

export function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      // Redirect based on role — user will be set in context
      // Small delay to ensure state is updated
      setTimeout(() => {
        const userStr = localStorage.getItem('youms_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          navigate(user.role === 'ADMIN' ? '/admin' : '/client', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }, 100);
    } catch (err: any) {
      setError(err?.message || 'Identifiants incorrects. Veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] flex flex-col">
      {/* Header */}
      <div className="bg-[#060f24] py-16">
        <div className="max-w-md mx-auto px-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={IMAGES.LOGO} alt="Youms Logistics" className="h-12 w-12 object-contain" />
            <span className="text-white font-bold text-xl">Youms Logistics</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Connexion</h1>
          <p className="text-slate-400 mt-2">Accédez à votre espace personnel</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center -mt-8 px-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@email.com"
                    className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-slate-300 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-[#060f24] py-3 rounded-lg font-bold text-sm hover:bg-gold-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Se connecter
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-slate-500">
              <a href="#" className="text-gold hover:underline font-medium">
                Mot de passe oublié ?
              </a>
            </p>
            <p className="text-sm text-slate-500">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-gold hover:underline font-medium">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
