/**
 * Login Page - Fixed with Email Trimming
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // Check Firebase initialization
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

    // FIX: Trim email and password to avoid hidden spaces
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
        'auth/invalid-email': 'Format email tidak valid. Pastikan tidak ada spasi.',
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
    <div className="min-h-screen bg-[#0a0b10] flex items-center justify-center p-4 font-mono">
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #00ff41 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="w-full max-w-md relative z-10">
        <Card className="border-[#00ff41]/20 bg-black/60 backdrop-blur-xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-[#00ff41] rounded flex items-center justify-center shadow-[0_0_20px_rgba(0,255,65,0.4)]">
                <Lock size={24} className="text-black" />
              </div>
            </div>
            <CardTitle className="text-2xl text-[#00ff41] font-bold tracking-widest">KEI OS Terminal</CardTitle>
            <CardDescription className="text-gray-400">Military-Grade Restricted Access</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-tighter font-bold text-[#00ff41] flex items-center gap-2">
                  <Mail size={14} /> Email Address
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kei-os.local"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-black border border-[#00ff41]/30 rounded text-[#00ff41] placeholder-gray-800 focus:border-[#00ff41] focus:outline-none focus:ring-1 focus:ring-[#00ff41]/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-tighter font-bold text-[#00ff41] flex items-center gap-2">
                  <Lock size={14} /> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-black border border-[#00ff41]/30 rounded text-[#00ff41] placeholder-gray-800 focus:border-[#00ff41] focus:outline-none focus:ring-1 focus:ring-[#00ff41]/20"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-950/40 border border-red-500/50 rounded flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-red-200 leading-relaxed">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !email || !password || !authReady}
                className="w-full h-12 bg-[#00ff41] hover:bg-[#00cc33] text-black font-black uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,65,0.2)]"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Authenticate'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
