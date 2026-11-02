import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  Coffee,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import app from '../../firebase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Forgot Password State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    setResetSubmitting(true);

    const cleanEmail = (resetEmail || '').trim().toLowerCase();

    if (!cleanEmail) {
      setResetError('Please enter your registered admin email address.');
      setResetSubmitting(false);
      return;
    }

    // 1. Strict verification: ensure email belongs to an authorized admin
    const authorizedAdmins = ['alizaman3060@gmail.com'];
    if (!authorizedAdmins.includes(cleanEmail)) {
      setResetError('Unauthorized email address. Only registered KAFI administrators are permitted to reset credentials.');
      setResetSubmitting(false);
      return;
    }

    try {
      // 2. Dispatch secure password-reset email via Firebase Authentication
      const auth = getAuth(app);
      await sendPasswordResetEmail(auth, cleanEmail);
      setResetSuccess(
        `A secure password-reset verification email has been dispatched to your registered Gmail address (${cleanEmail}). ` +
        `Please check your inbox (and spam folder) and follow the link to set your new password.`
      );
    } catch (fbErr) {
      console.warn('Firebase password reset notice:', fbErr.code, fbErr.message);

      // Attempt secure backend endpoint fallback
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail })
        });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (res.ok) {
            setResetSuccess(data.message || `Password reset link dispatched to ${cleanEmail}.`);
            setResetSubmitting(false);
            return;
          }
        }
      } catch (backendErr) {
        console.warn('Backend fallback notice:', backendErr);
      }

      if (fbErr.code === 'auth/configuration-not-found') {
        setResetError(
          `Firebase Configuration Notice: Email/Password sign-in provider is currently disabled in your Firebase Console for project 'kafi-931ef'. ` +
          `To activate automated password-reset emails, navigate to Firebase Console > Build > Authentication > Sign-in method and toggle on 'Email/Password'.`
        );
      } else {
        setResetError(fbErr.message || 'Failed to dispatch password reset email. Please try again.');
      }
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0907] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-[#EDE4D8]">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6E4E37]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#C49A6C]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-[#583925] to-[#B38758] flex items-center justify-center text-white shadow-2xl shadow-[#6E4E37]/50 border border-[#8C5D3B]/40">
            <Coffee size={32} className="text-[#F5EBE1]" />
          </div>
          <h1 className="text-2xl font-serif font-extrabold tracking-widest text-[#EAD2BC] uppercase">
            KAFI Gulberg
          </h1>
          <p className="text-xs text-[#9B806F] mt-1 tracking-wider uppercase">
            Authorized Personnel Portal
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-[#150E0A]/95 border border-[#2E1E16] rounded-2xl p-7 shadow-2xl shadow-black/80 backdrop-blur-xl">
          {!isForgotOpen ? (
            /* =========================================================================
               1. STANDARD ADMIN LOGIN VIEW
               ========================================================================= */
            <>
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#D2A679] uppercase tracking-wider mb-6 pb-3 border-b border-[#241710]">
                <ShieldCheck size={16} className="text-[#C49A6C]" />
                <span>Secure Admin Authentication</span>
              </div>

              {error && (
                <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800/60 flex items-start space-x-2.5 text-xs text-red-200">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#B8A190] mb-1.5">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A6150]">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Gmail"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#1F1510] border border-[#3A251A] rounded-xl text-sm text-[#F5EBE1] placeholder-[#664E3F] focus:outline-none focus:border-[#C49A6C] focus:ring-1 focus:ring-[#C49A6C] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#B8A190] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A6150]">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#1F1510] border border-[#3A251A] rounded-xl text-sm text-[#F5EBE1] placeholder-[#664E3F] focus:outline-none focus:border-[#C49A6C] focus:ring-1 focus:ring-[#C49A6C] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7A6150] hover:text-[#C49A6C]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link Directly Below Password Field */}
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotOpen(true);
                      setResetEmail(email || '');
                      setResetError('');
                      setResetSuccess('');
                    }}
                    className="text-xs text-[#C49A6C] hover:text-[#EAD2BC] transition-colors font-medium cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#6E4E37] to-[#8C5D3B] hover:from-[#7D593E] hover:to-[#9D6A44] text-white font-medium text-sm shadow-lg shadow-[#6E4E37]/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* =========================================================================
               2. FORGOT PASSWORD RECOVERY VIEW
               ========================================================================= */
            <>
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#D2A679] uppercase tracking-wider mb-6 pb-3 border-b border-[#241710]">
                <KeyRound size={16} className="text-[#C49A6C]" />
                <span>Reset Administrator Password</span>
              </div>

              {resetError && (
                <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800/60 flex items-start space-x-2.5 text-xs text-red-200">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-start space-x-2.5 text-xs text-emerald-200">
                  <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              <p className="text-xs text-[#A89282] leading-relaxed mb-4">
                Enter your registered admin Gmail address. We will verify your credentials and dispatch a secure password-reset verification link to your email.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#B8A190] mb-1.5">
                    Registered Admin Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7A6150]">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="alizaman3060@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#1F1510] border border-[#3A251A] rounded-xl text-sm text-[#F5EBE1] placeholder-[#664E3F] focus:outline-none focus:border-[#C49A6C] focus:ring-1 focus:ring-[#C49A6C] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#6E4E37] to-[#8C5D3B] hover:from-[#7D593E] hover:to-[#9D6A44] text-white font-medium text-sm shadow-lg shadow-[#6E4E37]/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {resetSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Password Reset Email</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotOpen(false);
                      setResetError('');
                      setResetSuccess('');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#1C130D] hover:bg-[#281B13] border border-[#382317] text-[#C49A6C] text-xs font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs text-[#8C705E] hover:text-[#C49A6C] transition-colors"
          >
            ← Back to Storefront
          </a>
        </div>
      </div>
    </div>
  );
}
