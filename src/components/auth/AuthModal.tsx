import React, { useState } from 'react';
import { X, Mail, Lock, User, AtSign, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        await loginWithEmail(email.trim(), password);
      } else {
        if (!displayName.trim() || !username.trim()) {
          throw new Error('Veuillez renseigner votre nom complet et un pseudo.');
        }
        await registerWithEmail(email.trim(), password, displayName.trim(), username.trim());
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError('Adresse e-mail ou mot de passe incorrect.');
      } else if (code === 'auth/email-already-in-use') {
        setError('Cette adresse e-mail est déjà utilisée.');
      } else if (code === 'auth/weak-password') {
        setError('Le mot de passe doit comporter au moins 6 caractères.');
      } else {
        setError(err?.message || "Une erreur est survenue lors de l'authentification.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err?.message || 'Connexion Google interrompue.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <BrandLogo size="lg" className="items-center mb-3" />
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {mode === 'signin'
              ? 'Connectez-vous pour liker, commenter et dialoguer'
              : 'Créez votre compte pour rejoindre la communauté hey Teddy,'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'signin'
                ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'signup'
                ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Inscription
          </button>
        </div>

        {/* Google One-Click Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 text-xs font-bold text-neutral-800 dark:text-neutral-100 flex items-center justify-center gap-2.5 shadow-sm transition mb-4 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continuer avec Google</span>
        </button>

        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
          </div>
          <span className="relative px-3 bg-white dark:bg-neutral-900 text-[10px] uppercase font-bold text-neutral-400">
            ou par e-mail
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="ex: Sarah Morin"
                    required
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Nom d'utilisateur (@pseudo)
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="sarah_m"
                    required
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
              Adresse e-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="w-full text-xs pl-10 pr-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full text-xs pl-10 pr-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-none dark:text-white focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl font-bold bg-amber-400 text-neutral-950 hover:bg-amber-300 disabled:opacity-50 transition shadow-md"
            >
              {isLoading
                ? 'Chargement...'
                : mode === 'signin'
                ? 'Se connecter'
                : 'Créer mon compte'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
