import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function OTPModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');
  const [session, setSession] = useState<{ sessionId: string, companyId: string } | null>(null);

  useEffect(() => {
    // Setup SSE Connection
    const eventSource = new EventSource(`${API_URL}/events`);
    
    eventSource.addEventListener('AWAITING_OTP', (e) => {
      const data = JSON.parse(e.data);
      setSession(data);
      setIsOpen(true);
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    
    // Send OTP to backend to resolve the pending Promise
    try {
      await fetch(`${API_URL}/otp/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId, code })
      });
      setIsOpen(false);
      setCode('');
      setSession(null);
    } catch (error) {
      console.error('Failed to submit OTP:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center text-white mb-2">Security Verification</h3>
              <p className="text-sm text-slate-400 text-center mb-6">
                Your bank ({session?.companyId}) has requested an SMS verification code to proceed.
              </p>
              
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="Enter 6-digit code"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-center text-2xl tracking-widest text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-4"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors active:scale-95"
                >
                  Verify
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
