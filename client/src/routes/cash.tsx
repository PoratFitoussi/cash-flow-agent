import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';

export const Route = createFileRoute('/cash')({
  component: CashTracking,
});

function CashTracking() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [form, setForm] = useState({
    amount: '',
    merchant: '',
    date: new Date().toISOString().split('T')[0],
    isTemplate: false,
    categoryId: 1
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAPI('/templates').then(res => setTemplates(res.data || [])).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchAPI('/transactions/manual', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount)
        })
      });
      
      // Reset form
      setForm({ ...form, amount: '', merchant: '', isTemplate: false });
      
      // Refresh templates if we just saved one
      if (form.isTemplate) {
        fetchAPI('/templates').then(res => setTemplates(res.data || []));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = (t: any) => {
    setForm({
      ...form,
      amount: t.amount,
      merchant: t.merchant,
      categoryId: t.categoryId || 1,
      isTemplate: false // don't re-save the template
    });
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Manual Entry</h1>
        <p className="text-sm text-slate-400">Log cash or missing transactions</p>
      </header>

      {templates.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Frequent Templates</h3>
          <div className="flex flex-wrap gap-2">
            {templates.map(t => (
              <button 
                key={t.id} 
                onClick={() => useTemplate(t)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-full text-sm font-medium transition-colors border border-slate-700 active:scale-95"
              >
                {t.merchant} <span className="opacity-50 ml-1">₪{t.amount}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-1 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Amount (₪)</label>
          <input 
            type="number" 
            step="0.01"
            required
            value={form.amount}
            onChange={e => setForm({...form, amount: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-lg"
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Merchant</label>
          <input 
            type="text" 
            required
            value={form.merchant}
            onChange={e => setForm({...form, merchant: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            placeholder="e.g. Local Produce Stand"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
          <input 
            type="date" 
            required
            value={form.date}
            onChange={e => setForm({...form, date: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center mt-4">
          <input 
            type="checkbox" 
            id="isTemplate"
            checked={form.isTemplate}
            onChange={e => setForm({...form, isTemplate: e.target.checked})}
            className="w-5 h-5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
          />
          <label htmlFor="isTemplate" className="ml-3 text-sm text-slate-300">
            Save as frequent template
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl mt-6 transition-colors active:scale-[0.98]"
        >
          {loading ? 'Saving...' : 'Save Transaction'}
        </button>
      </form>
    </div>
  );
}
