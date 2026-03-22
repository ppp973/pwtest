'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { getUserId, generateToken, isVerified } from '@/lib/verification';

const VPLINK_API_TOKEN = '64cb3994119c683652e7f241880b1f4b3dda5e37';

export function VerificationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if verified after a small delay to ensure splash screen is done
    const check = () => {
      if (!isVerified()) {
        setIsOpen(true);
      }
    };
    
    const timer = setTimeout(check, 4000); // After splash screen (3.5s)
    return () => clearTimeout(timer);
  }, []);

  const handleVerify = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = getUserId();
      const token = generateToken(userId);
      
      // Construct the destination URL
      const origin = window.location.origin;
      const destinationUrl = `${origin}/token?token=${token}&uid=${userId}`;
      
      // Shorten the link using VPLINK API
      const apiUrl = `https://vplink.in/api?api=${VPLINK_API_TOKEN}&url=${encodeURIComponent(destinationUrl)}&format=text`;
      
      const response = await fetch(apiUrl);
      const shortenedUrl = await response.text();
      
      if (shortenedUrl && shortenedUrl.startsWith('http')) {
        // Redirect to the shortened link
        window.location.href = shortenedUrl;
      } else {
        throw new Error('Failed to generate verification link');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-950 border border-emerald-500/30 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(16,185,129,0.15)]"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center text-emerald-500 mb-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          
          <h3 className="text-2xl font-display font-bold mb-3">Verification Required</h3>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            To ensure the security of our premium resources, please complete a quick verification. 
            This will grant you full access for the next 24 hours.
          </p>
          
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs mb-6 bg-red-400/10 px-4 py-2 rounded-xl border border-red-400/20">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          <button 
            onClick={handleVerify}
            disabled={loading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-black font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
          >
            {loading ? (
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
          
          <p className="mt-6 text-[10px] uppercase tracking-widest text-white/20 font-bold">
            Secure Verification by VIP Study
          </p>
        </div>
      </motion.div>
    </div>
  );
}
