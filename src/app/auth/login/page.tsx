/**
 * Login Page
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
  const router = useRouter();

  // Check Firebase initialization
  React.useEffect(() => {
    if (auth) {
      console.log('✓ Firebase Auth initialized');
      setAuthReady(true);
    } else {
      console.error('✗ Firebase Auth NOT initialized');
      setError('Firebase belum siap. Refresh halaman...');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔐 Login attempt with:', email);
      
      if (!email || !password) {
        setError('Email dan password harus diisi');
        setIsLoading(false);
        return;
      }

      // Demo credentials fallback
      const DEMO_ACCOUNTS = [
        { email: 'admin1@kei-game.local', password: 'Admin@123456' },
        { email: 'admin2@kei-game.local', password: 'Admin@654321' },
      ];

      const demoMatch = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
      
      if (demoMatch) {
        console.log('✓ Demo login (no Firebase):', email);
        // Store user session
        const userData = {
          uid: `demo_${Date.now()}`,
          email: email,
          displayName: 'Admin User',
          loginTime: new Date().toISOString(),
          isDemoMode: true,
        };
        localStorage.setItem('kei_user', JSON.stringify(userData));
        
        // Set auth_token cookie for middleware
        document.cookie = `auth_token=demo_${Date.now()}_${email}; path=/; max-age=86400`;
        
        console.log('💾 User saved to localStorage and auth_token cookie set');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('🚀 Redirecting to dashboard...');
        // Use window.location as fallback
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
        return;
      }

      console.log('🔑 Calling Firebase signInWithEmailAndPassword...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✓ Login successful:', userCredential.user.email);
      
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      
      // Store user session
      localStorage.setItem('kei_user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        loginTime: new Date().toISOString(),
      }));

      // Set auth_token cookie for middleware
      document.cookie = `auth_token=${idToken}; path=/; max-age=86400`;
      
      console.log('💾 User saved and auth_token cookie set');
      console.log('🚀 Redirecting to dashboard...');
      // Use window.location as fallback
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (err: any) {
      console.error('❌ Full error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      
      const errorMap: { [key: string]: string } = {
        'auth/user-not-found': 'User tidak ditemukan. Pastikan email benar.',
        'auth/wrong-password': 'Password salah',
        'auth/invalid-email': 'Format email tidak valid',
        'auth/invalid-credential': 'Email atau password salah. Pastikan sudah setup di Firebase Console.',
        'auth/operation-not-allowed': 'Email/Password sign-in belum enabled di Firebase Console',
        'auth/too-many-requests': 'Terlalu banyak percobaan login gagal. Coba lagi nanti.',
      };

      const userMessage = errorMap[err.code] || err.message || 'Authentication failed';
      setError(`${userMessage} (${err.code})`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] flex items-center justify-center p-4">
      {/* Animated Background */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #00ff41 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          backgroundPosition: '0% 0%',
        }}
      />

      <div className="w-full max-w-md relative z-10">

        <Card>
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-[#00ff41] rounded flex items-center justify-center">
                <Lock size={24} className="text-[#0a0b10]" />
              </div>
            </div>
            <CardTitle className="text-2xl">KEI OS Terminal</CardTitle>
            <CardDescription>Military-Grade Restricted Access</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin1@kei-game.local"
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-[#0a0b10] border border-[#00ff41]/30 rounded text-[#00ff41] placeholder-gray-600 focus:border-[#00ff41] focus:outline-none focus:ring-1 focus:ring-[#00ff41]/20 disabled:opacity-50"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Lock size={16} />
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-[#0a0b10] border border-[#00ff41]/30 rounded text-[#00ff41] placeholder-gray-600 focus:border-[#00ff41] focus:outline-none focus:ring-1 focus:ring-[#00ff41]/20 disabled:opacity-50"
                />
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-600/30 rounded flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-400" />
                  <span className="text-sm text-red-300">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !email || !password || !authReady}
                className="w-full"
              >
                {!authReady ? (
                  'Initializing...'
                ) : isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Authenticating...
                  </>
                ) : (
                  'Authenticate'
                )}
              </Button>

              {/* Footer */}
              <p className="text-xs text-center text-gray-500 pt-2">
                All access is monitored and logged.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* System Status */}
        <div className="mt-6 p-3 border border-[#00ff41]/20 rounded text-xs font-mono text-gray-400">
          <p className="text-[#00ff41]">$ System Status: {authReady ? 'ONLINE' : 'INITIALIZING'}</p>
          <p className="text-gray-600">$ Firebase: {authReady ? '✓ Connected' : '○ Connecting...'}</p>
          <p className="text-gray-600 mt-2">$ Demo accounts:</p>
          <p className="text-gray-600 ml-2">admin1@kei-game.local / Admin@123456</p>
          <p className="text-gray-600 ml-2">admin2@kei-game.local / Admin@654321</p>
        </div>
      </div>
    </div>
  );
}
