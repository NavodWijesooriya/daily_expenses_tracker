import React, { useState } from 'react';
import { Wallet, UserRound, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AuthViewProps {
  onSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signInUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signInUser(name, email, password);
      onSuccess();
    } catch (err: unknown) {
      console.error('Sign in error:', err);
      const errorCode =
        typeof err === 'object' && err !== null && 'code' in err && typeof err.code === 'string'
          ? err.code
          : undefined;

      setError(
        errorCode === 'auth/operation-not-allowed'
          ? 'Email/password sign-in is disabled for this Firebase project. Enable it in Firebase Console under Authentication → Sign-in method → Email/Password, then try again.'
          : err instanceof Error
            ? err.message
            : 'Invalid email or password.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#0F0F0F]">
      <div className="w-full max-w-md bg-[#1F1F1F] rounded-3xl shadow-xl border border-[#333333] p-8 sm:p-10 space-y-7">
        {/* Brand header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#FF9248] to-[#E26E1D] text-white flex items-center justify-center shadow-lg shadow-[#FF9248]/30">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sign In
            </h1>
            <p className="text-xs sm:text-sm text-[#B3B3B3] mt-1">
              Enter your name, email, and password to access your daily expenses
            </p>
          </div>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-[#2A171A] border border-[#54252D] text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
            <span>{error}</span>
          </div>
        )}

        {/* Sign-in form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name input */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-xs font-bold text-white">
              Your Name
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A] pointer-events-none">
                <UserRound className="w-4 h-4" />
              </div>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                maxLength={60}
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#1F1F1F] border border-[#333333] rounded-2xl text-xs sm:text-sm text-white placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-bold text-white"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A] pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#1F1F1F] border border-[#333333] rounded-2xl text-xs sm:text-sm text-white placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-bold text-white"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A] pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 bg-[#1F1F1F] border border-[#333333] rounded-2xl text-xs sm:text-sm text-white placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#FF9248] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#FF9248] transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 bg-[#FF9248] hover:bg-[#F07F30] active:scale-[0.99] disabled:opacity-50 text-[#0F0F0F] text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-[#FF9248]/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
