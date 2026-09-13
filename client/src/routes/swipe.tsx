import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAPI } from '@/lib/api';
import { ShoppingCart, Fuel, Baby, Utensils } from 'lucide-react';

export const Route = createFileRoute('/swipe')({
  component: SwipeQueue,
});

function SwipeQueue() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI('/swipe-queue')
      .then((res) => {
        setQueue(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleClassify = async (id: number, categoryId: number) => {
    // Optimistic update
    setQueue((prev) => prev.filter((item) => item.id !== id));
    
    // Background sync
    try {
      await fetchAPI(`/transactions/${id}/category`, {
        method: 'PATCH',
        body: JSON.stringify({ categoryId }),
      });
    } catch (error) {
      console.error('Failed to classify:', error);
      // Revert logic could go here
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-pulse">Loading queue...</div></div>;
  }

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <div className="bg-slate-800/50 p-6 rounded-full mb-4">🎉</div>
        <h2 className="text-xl font-bold mb-2">Inbox Zero!</h2>
        <p className="text-slate-400">All transactions have been classified.</p>
      </div>
    );
  }

  const currentItem = queue[0];

  return (
    <div className="flex flex-col h-[80vh]">
      <header className="mb-6 text-center">
        <h1 className="text-xl font-bold tracking-tight">Classification Queue</h1>
        <p className="text-sm text-slate-400">{queue.length} remaining</p>
      </header>

      <div className="flex-1 relative flex items-center justify-center perspective-1000">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentItem.id}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.05, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute w-full max-w-sm bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700 text-center"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -10000) {
                // Swipe Left - Ignore for now
              } else if (swipe > 10000) {
                // Swipe Right - Quick classify
              }
            }}
          >
            <div className="text-sm text-slate-400 mb-2 font-medium uppercase tracking-wider">
              {new Date(currentItem.transactionDate).toLocaleDateString()}
            </div>
            <h2 className="text-3xl font-extrabold mb-4 text-white">
              ₪{Number(currentItem.amount).toFixed(2)}
            </h2>
            <div className="text-xl font-medium text-slate-300">
              {currentItem.merchant}
            </div>
            {currentItem.accountId && (
              <div className="mt-4 text-xs text-slate-500 bg-slate-900 inline-block px-3 py-1 rounded-full">
                {currentItem.accountId}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-8">
        <button onClick={() => handleClassify(currentItem.id, 1)} className="flex flex-col items-center justify-center p-4 bg-slate-800/50 hover:bg-slate-700 rounded-2xl transition-colors active:scale-95">
          <ShoppingCart className="text-emerald-400 mb-2" />
          <span className="text-xs text-slate-300">Supermarket</span>
        </button>
        <button onClick={() => handleClassify(currentItem.id, 2)} className="flex flex-col items-center justify-center p-4 bg-slate-800/50 hover:bg-slate-700 rounded-2xl transition-colors active:scale-95">
          <Fuel className="text-amber-400 mb-2" />
          <span className="text-xs text-slate-300">Fuel</span>
        </button>
        <button onClick={() => handleClassify(currentItem.id, 3)} className="flex flex-col items-center justify-center p-4 bg-slate-800/50 hover:bg-slate-700 rounded-2xl transition-colors active:scale-95">
          <Baby className="text-pink-400 mb-2" />
          <span className="text-xs text-slate-300">Kids</span>
        </button>
        <button onClick={() => handleClassify(currentItem.id, 4)} className="flex flex-col items-center justify-center p-4 bg-slate-800/50 hover:bg-slate-700 rounded-2xl transition-colors active:scale-95">
          <Utensils className="text-purple-400 mb-2" />
          <span className="text-xs text-slate-300">Dining</span>
        </button>
      </div>
    </div>
  );
}
