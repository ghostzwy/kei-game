/**
 * Login Page - KEI OS Terminal Access
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle, Loader2, Shield } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  React.useEffect(() => {
    if (auth) {
      setAuthReady(true);
    } else {
      setError('Firebase belum siap. Refresh halaman...');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      if (!cleanEmail || !cleanPassword) {
        setError('Email dan password harus diisi');
        setIsLoading(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      
      localStorage.setItem('kei_user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        loginTime: new Date().toISOString(),
      }));

      document.cookie = `auth_token=${idToken}; path=/; max-age=86400`;
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (err: any) {
      const errorMap: { [key: string]: string } = {
        'auth/user-not-found': 'User tidak ditemukan.',
        'auth/wrong-password': 'Password salah',
        'auth/invalid-email': 'Format email tidak valid.',
        'auth/invalid-credential': 'Email atau password salah.',
        'auth/operation-not-allowed': 'Sign-in belum enabled di Firebase.',
        'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
      };

      const userMessage = errorMap[err.code] || err.message || 'Authentication failed';
      setError(`${userMessage} (${err.code})`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
      {/* Background grid pattern */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Decorative blurs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-emerald-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* ── Card ── */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-7">
          {/* Logo */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20 mb-4">
              <Shield size={26} className="text-black" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">KEI OS</h1>
            <p className="text-xs text-slate-500 mt-1">Restricted Access Terminal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Mail size={12} /> Email
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kei-os.local"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-slate-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Lock size={12} /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-slate-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/[0.06] border border-red-500/15 rounded-xl flex items-start gap-2.5">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span className="text-xs text-red-300 leading-relaxed">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !password || !authReady}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Authenticate'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-4 font-mono">KEI OS v3.0 — Authorized Personnel Only</p>
      </div>
    </div>
  );
}
