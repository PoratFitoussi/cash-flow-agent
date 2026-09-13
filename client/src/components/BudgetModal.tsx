import { useState, useEffect } from 'react';
import { X, Save, TrendingUp } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  onSave: (amount: number) => Promise<void>;
  period: string; // e.g., "Sep 2026"
}

export function BudgetModal({ isOpen, onClose, currentBudget, onSave, period }: BudgetModalProps) {
  const [amount, setAmount] = useState(currentBudget.toString());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount(currentBudget.toString());
    }
  }, [isOpen, currentBudget]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(Number(amount));
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-full">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Monthly Budget</h2>
              <p className="text-sm text-slate-400">Set limit for {period}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Budget Amount (₪)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₪</span>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-10 pr-4 text-white text-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="0.00"
                autoFocus
              />
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving || !amount}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Budget
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
