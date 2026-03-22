'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export function SecurityWrapper({ children }: { children: React.ReactNode }) {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  useEffect(() => {
    // 1. Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable DevTools Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        return false;
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
      // Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
    };

    // 3. DevTools Detection
    const detectDevTools = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      
      // Also check for debugger
      const start = performance.now();
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        setIsDevToolsOpen(true);
      }

      if (widthDiff || heightDiff) {
        setIsDevToolsOpen(true);
      } else {
        // Only reset if not already detected by debugger
        if (end - start <= 100) {
          setIsDevToolsOpen(false);
        }
      }
    };

    // 4. Fake API Noise Generator
    const generateNoise = () => {
      const fakeEndpoints = [
        '/api/v1/security/heartbeat',
        '/api/v2/telemetry/sync',
        '/api/v1/auth/verify-token',
        '/api/v3/analytics/event',
        '/api/v1/cache/refresh',
        '/api/v2/logs/push',
        '/api/v1/system/status',
        '/api/v1/user/session/validate',
        '/api/v1/security/integrity-check',
        '/api/v2/network/latency-test'
      ];

      // Fetch Interceptor for Fake Responses
      try {
        const originalFetch = window.fetch;
        const interceptor = async (...args: any[]) => {
          const url = typeof args[0] === 'string' ? args[0] : (args[0] as any).url;
          if (fakeEndpoints.some(e => url.includes(e))) {
            return new Response(JSON.stringify({ 
              success: true, 
              data: "Encrypted payload: " + btoa(Math.random().toString()),
              integrity: "verified",
              session_id: Math.random().toString(36).substring(2)
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          return (originalFetch as any).apply(window, args);
        };

        // Try direct assignment first
        try {
          // @ts-ignore
          window.fetch = interceptor;
        } catch (e) {
          // If direct assignment fails, try defineProperty
          Object.defineProperty(window, 'fetch', {
            value: interceptor,
            configurable: true,
            writable: true
          });
        }
      } catch (error) {
        console.warn('Security: Fetch interception disabled due to environment restrictions.');
      }
      
      const sendFakeRequest = () => {
        const endpoint = fakeEndpoints[Math.floor(Math.random() * fakeEndpoints.length)];
        const payload = {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString(),
          status: 'success',
          encrypted_data: btoa(Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)),
          integrity_hash: btoa(Math.random().toString(36))
        };

        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Security-Token': btoa(Date.now().toString()),
            'X-Request-ID': Math.random().toString(36).substring(2),
            'X-Integrity-Check': 'verified'
          },
          body: JSON.stringify(payload)
        }).catch(() => {});
      };

      // Initial noise burst
      for(let i = 0; i < 5; i++) setTimeout(sendFakeRequest, Math.random() * 3000);

      // Periodic noise
      const interval = setInterval(sendFakeRequest, 3000 + Math.random() * 5000);
      return interval;
    };

    // 5. Console Obfuscation
    const obfuscateConsole = () => {
      const noop = () => {};
      // @ts-ignore
      if (process.env.NODE_ENV === 'production') {
        console.log = noop;
        console.info = noop;
        console.warn = noop;
        console.error = noop;
        console.debug = noop;
      }
      
      // Periodic clear
      setInterval(() => {
        console.clear();
      }, 1000);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', detectDevTools);
    
    const noiseInterval = generateNoise();
    obfuscateConsole();

    // Check periodically for devtools
    const checkInterval = setInterval(detectDevTools, 2000);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', detectDevTools);
      clearInterval(noiseInterval);
      clearInterval(checkInterval);
    };
  }, []);

  return (
    <>
      {children}
      {isDevToolsOpen && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-6 animate-pulse">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Security Violation</h1>
          <p className="text-white/60 max-w-md leading-relaxed mb-8">
            Developer tools are not allowed on this platform. Please close the inspector to continue using VIP Study.
          </p>
          <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-mono text-white/40">
            Error Code: SEC_DEVTOOLS_DETECTED
          </div>
        </div>
      )}
    </>
  );
}
