'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyPage() {
  const router = useRouter();
  const params = useParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    const token = params.token as string;
    const pendingToken = localStorage.getItem('pendingVerificationToken');

    if (token && token === pendingToken) {
      // Valid token! Set expiry to 24 hours from now
      const expiry = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem('verified_until', expiry.toString());
      localStorage.removeItem('pendingVerificationToken');
      
      setTimeout(() => setStatus('success'), 0);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      setTimeout(() => setStatus('error'), 0);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  }, [params, router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl"
      >
        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">Verifying...</h1>
            <p className="text-white/60">Please wait while we verify your access.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">Verification Successful!</h1>
            <p className="text-white/60">You now have access for 24 hours. Redirecting...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
            <p className="text-white/60">Invalid or expired verification link. Redirecting...</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
