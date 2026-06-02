'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'react-toastify';
import { Chrome, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('temp_auth_pwd', password);
      }
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Successfully logged in!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Credentials login error:', error);
      let message = 'Failed to sign in. Please check your credentials.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Add prompt selection
      provider.setCustomParameters({ prompt: 'select_account' });
      
      await signInWithPopup(auth, provider);
      toast.success('Signed in with Google successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google login error:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px]" />

      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:opacity-95 transition-opacity">
            QR Junction
          </Link>
          <h2 className="text-2xl font-semibold text-white mt-4">Welcome back</h2>
          <p className="text-slate-400 text-sm mt-1">Manage your dynamic QR codes and track conversion ROI</p>
        </div>

        {/* Google OAuth Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-slate-800/80 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm hover:shadow-primary/10"
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          ) : (
            <Chrome className="w-5 h-5 text-red-400 group-hover:scale-105 transition-transform" />
          )}
          <span>Sign in with Google</span>
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-800" />
          <span className="px-3 text-xs text-slate-500 uppercase tracking-widest">or</span>
          <div className="flex-grow border-t border-slate-800" />
        </div>

        {/* Email/Password Login Form */}
        <form onSubmit={handleCredentialsLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 transition-all outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Password</label>
              <Link href="#" className="text-xs text-primary hover:underline transition-all">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 transition-all outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full gradient-primary hover:opacity-95 text-white font-medium py-3 px-4 rounded-xl shadow-primary hover:shadow-primary-hover flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-8">
          Don't have an account?{' '}
          <Link href="/register" className="text-secondary font-medium hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
