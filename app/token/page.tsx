'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateToken, setVerified } from '@/lib/verification';

function TokenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const uid = searchParams.get('uid');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your token...');

  useEffect(() => {
    const verify = async () => {
      if (!token || !uid) {
        setStatus('error');
        setMessage('Invalid verification link. Please try again.');
        return;
      }

      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (validateToken(uid, token)) {
        setVerified();
        setStatus('success');
        setMessage('Verification successful! Redirecting you to the home page...');
        
        // Redirect after success
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setStatus('error');
        setMessage('Verification failed. The token is invalid or has expired.');
      }
    };

    verify();
  }, [token, uid, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-950 border border-emerald-500/30 rounded-[2.5rem] p-10 shadow-[0_0_50px_rgba(16,185,129,0.15)] text-center"
      >
        <div className="flex flex-col items-center">
          <div className="mb-8">
            {status === 'loading' && (
              <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center text-red-500">
                <AlertCircle className="w-10 h-10" />
              </div>
            )}
          </div>

          <h1 className="text-3xl font-display font-bold mb-4">
            {status === 'loading' && 'Verifying...'}
            {status === 'success' && 'Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h1>
          
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            {message}
          </p>

          {status === 'error' && (
            <button
              onClick={() => router.push('/')}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-2xl transition-all"
            >
              Back to Home
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function TokenPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <TokenContent />
    </Suspense>
  );
}
