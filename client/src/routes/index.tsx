import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { ArrowUpRight, ArrowDownRight, Wallet, RefreshCw, ChevronLeft, ChevronRight, Edit2, Check, X } from 'lucide-react';
import { BudgetModal } from '@/components/BudgetModal';

export const Route = createFileRoute('/')({
  component: Dashboard,
});

function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMerchantName, setEditMerchantName] = useState("");
  const [budgetLimit, setBudgetLimit] = useState<number>(10000);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  const loadData = () => {
    fetchAPI('/transactions').then(res => setData(res.data || [])).catch(console.error);
  };
  
  const fetchBudget = async () => {
    const period = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    try {
      const res = await fetchAPI(`/budget/${period}`);
      if (res.data && res.data.userDefinedLimit) {
        setBudgetLimit(Number(res.data.userDefinedLimit));
      } else {
        setBudgetLimit(10000); // Default fallback
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    fetchBudget();
  }, [currentMonth]);

  const handleSaveBudget = async (amount: number) => {
    const period = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    try {
      await fetchAPI('/budget', {
        method: 'POST',
        body: JSON.stringify({ period, amount })
      });
      setBudgetLimit(amount);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetchAPI('/sync', { method: 'POST' });
      loadData(); // refresh data after sync
    } catch (error) {
      console.error('Sync failed', error);
      alert('Sync failed. Please check the console or ensure your .env credentials are correct.');
    } finally {
      setIsSyncing(false);
    }
  };

  const saveMerchantName = async (id: string) => {
    try {
      await fetchAPI(`/transactions/${id}/merchant`, {
        method: 'PATCH',
        body: JSON.stringify({ merchant: editMerchantName })
      });
      const tx = data.find(t => t.id === id);
      if (tx) {
        // Optimistic update
        setData(data.map(t => t.id === id ? { ...t, merchant: editMerchantName } : t));
        setEditingId(null);
      }
    } catch (e) {
      console.error("Failed to update merchant", e);
    }
  };

  // Filter data by selected month
  const filteredData = data.filter(t => {
    const d = new Date(t.transactionDate);
    return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
  });

  // Compute real aggregates from filtered data
  const totalOutflow = filteredData
    .filter(t => Number(t.amount) < 0 || t.paymentMethod === 'CASH')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    
  const totalIncome = filteredData
    .filter(t => Number(t.amount) > 0 && t.paymentMethod !== 'CASH')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const progress = totalOutflow > 0 ? (totalOutflow / budgetLimit) * 100 : 0;
  const periodLabel = currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  
  const getProgressColor = (p: number) => {
    if (p < 75) return 'bg-emerald-500';
    if (p < 100) return 'bg-amber-400';
    return 'bg-red-500';
  };

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto">
      <header className="mb-8 mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Overview</h1>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={prevMonth} className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <p className="text-sm font-medium text-slate-300 min-w-[110px] text-center">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
            <button onClick={nextMonth} className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors active:scale-95 text-sm font-medium text-slate-200"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
          {isSyncing ? 'Syncing...' : 'Sync Bank'}
        </button>
      </header>

      {/* Hero Aggregate Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-red-400">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Outflow</span>
          </div>
          <div className="text-2xl font-bold text-white">₪{totalOutflow.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <ArrowDownRight className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Income</span>
          </div>
          <div className="text-2xl font-bold text-white">₪{totalIncome.toLocaleString()}</div>
        </div>
      </div>

      {/* Budget Progress (Clickable) */}
      <div 
        onClick={() => setIsBudgetModalOpen(true)}
        className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800/50 backdrop-blur-sm cursor-pointer hover:bg-slate-900/80 transition-colors mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium text-slate-300">Monthly Budget</span>
          <span className="text-slate-400 text-sm">₪{totalOutflow.toLocaleString()} / ₪{budgetLimit.toLocaleString()}</span>
        </div>
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${progress > 90 ? 'bg-rose-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Monthly Activity List */}
      <h3 className="text-lg font-bold text-white mb-4">Monthly Activity</h3>
      <div className="space-y-3">
        {filteredData.map(t => (
          <div key={t.id} className="flex items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 group">
            <div className="flex flex-col flex-1">
              {editingId === t.id ? (
                <div className="flex items-center gap-2 mb-1">
                  <input 
                    type="text" 
                    value={editMerchantName} 
                    onChange={e => setEditMerchantName(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-white w-full outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <button onClick={() => saveMerchantName(t.id)} className="p-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditingId(null)} className="p-1 bg-slate-800 text-slate-400 rounded hover:bg-slate-700"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-200">{t.merchant}</span>
                  <button 
                    onClick={() => { setEditingId(t.id); setEditMerchantName(t.merchant); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-blue-400 transition-opacity"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <span className="text-xs text-slate-500">{new Date(t.transactionDate).toLocaleDateString()}</span>
            </div>
            <span className="font-bold text-white ml-4">₪{Number(t.amount).toFixed(2)}</span>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">No recent transactions for this month</div>
        )}
      </div>

      <BudgetModal 
        isOpen={isBudgetModalOpen} 
        onClose={() => setIsBudgetModalOpen(false)} 
        currentBudget={budgetLimit} 
        onSave={handleSaveBudget}
        period={periodLabel}
      />
    </div>
  );
}
