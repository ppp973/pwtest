'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ExternalLink, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function VerificationModal() {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    // Don't show on the verify page itself
    if (pathname?.startsWith('/verify/')) {
      return;
    }

    const checkVerification = () => {
      const verifiedUntil = localStorage.getItem('verified_until');
      let isVerified = false;
      
      if (verifiedUntil && Date.now() < parseInt(verifiedUntil, 10)) {
        isVerified = true;
      } else {
        localStorage.removeItem('verified_until');
      }

      if (!isVerified) {
        if (pathname === '/') {
          // Wait for splash screen to finish (3.5s)
          const timer = setTimeout(() => setShowModal(true), 3600);
          return () => clearTimeout(timer);
        } else {
          setShowModal(true);
        }
      }
    };

    checkVerification();
  }, [pathname]);

  const handleVerify = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('pendingVerificationToken', token);

      const longUrl = `${window.location.origin}/verify/${token}`;

      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: longUrl }),
      });

      const data = await response.json();

      if (data.shortUrl) {
        window.location.href = data.shortUrl;
      } else {
        setError('Failed to generate verification link. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-zinc-950 border border-emerald-500/30 rounded-[2.5rem] p-8 relative shadow-[0_0_50px_rgba(16,185,129,0.15)] text-center"
      >
        <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto mb-6">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-3">Verification Required</h2>
        <p className="text-white/50 text-sm leading-relaxed mb-8">
          To access VIP Study, you need to verify your session. Verification is quick and grants you access for 24 hours.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={isLoading}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(34,197,94,0.3)]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Link...
            </>
          ) : (
            <>
              Verify Now
              <ExternalLink className="w-4 h-4" />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
