import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Coffee, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleFillDemo = () => {
    setEmail('admin@kafi.pk');
    setPassword('admin123456');
    setError('');
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

        {/* Login Box */}
        <div className="bg-[#150E0A]/95 border border-[#2E1E16] rounded-2xl p-7 shadow-2xl shadow-black/80 backdrop-blur-xl">
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
                  placeholder="admin@kafi.pk"
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#6E4E37] to-[#8C5D3B] hover:from-[#7D593E] hover:to-[#9D6A44] text-white font-medium text-sm shadow-lg shadow-[#6E4E37]/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
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

          {/* Quick Demo Helper */}
          <div className="mt-6 pt-5 border-t border-[#221610] text-center">
            <p className="text-[11px] text-[#7A6455] mb-2.5">Quick Testing Credentials:</p>
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2 px-3 rounded-lg bg-[#221711] hover:bg-[#2C1D15] border border-[#382317] text-xs font-mono text-[#D4A373] transition-colors flex items-center justify-center space-x-2"
            >
              <span>admin@kafi.pk / admin123456</span>
              <span className="text-[10px] text-[#8C6D53] underline font-sans">Fill</span>
            </button>
          </div>
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

