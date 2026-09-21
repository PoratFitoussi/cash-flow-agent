import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import { fetchAPI } from '@/lib/api';
import { ChevronLeft, ChevronRight, Edit2, Check, X, Tags } from 'lucide-react';

export const Route = createFileRoute('/categories')({
  component: CategoriesPage,
});

function CategoriesPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [categories, setCategories] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState<string>('');

  const periodLabel = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

  const loadData = () => {
    fetchAPI('/categories').then(res => setCategories(res.data || [])).catch(console.error);
    fetchAPI(`/budget/${periodLabel}/all`).then(res => setBudgets(res.data || [])).catch(console.error);
    fetchAPI('/transactions').then(res => setTransactions(res.data || [])).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, [periodLabel]);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const monthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.transactionDate);
      return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    });
  }, [transactions, currentMonth]);

  const categoryStats = useMemo(() => {
    const stats = categories
      .filter(cat => cat.name !== 'משכורת')
      .map(cat => {
      // Find category budget
      const budget = budgets.find(b => b.categoryId === cat.id);
      const limit = budget ? Number(budget.userDefinedLimit) : 0;
      
      // Calculate spent amount (only EXPENSES)
      const spent = Math.abs(monthTransactions
        .filter(t => t.categoryId === cat.id && t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0));
        
      const progress = limit > 0 ? (spent / limit) * 100 : 0;
      
      return {
        ...cat,
        budget: budget || null,
        limit,
        spent,
        progress,
        isOverBudget: limit > 0 && spent > limit
      };
    });
    
    // Sort by most spent
    return stats.sort((a, b) => b.spent - a.spent);
  }, [categories, budgets, monthTransactions]);

  const saveBudget = async (categoryId: string) => {
    try {
      await fetchAPI('/budget', {
        method: 'POST',
        body: JSON.stringify({
          period: periodLabel,
          amount: Number(editLimit) || 0,
          categoryId
        })
      });
      setEditingId(null);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto pt-6 pb-12 font-sans px-4" dir="rtl">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/50 backdrop-blur-sm" dir="ltr">
          <button onClick={prevMonth} className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-sm font-medium text-slate-200 min-w-[100px] text-center">
            {currentMonth.toLocaleString('he-IL', { month: 'long', year: 'numeric' })}
          </div>
          <button onClick={nextMonth} className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 border border-slate-800/50 text-slate-200 backdrop-blur-sm">
             <Tags className="w-4 h-4 text-sky-400" />
             <span className="text-sm font-medium">תקציבים</span>
          </div>
        </div>
      </header>
      
      {/* Category List */}
      <div className="space-y-4">
        {categoryStats.map(stat => (
          <div key={stat.id} className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800/50 shadow-sm backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
               <div className="flex items-center gap-3">
                 <span className="text-2xl">{stat.icon}</span>
                 <span className="font-medium text-slate-200">{stat.name}</span>
               </div>
               
               <div className="flex items-center gap-2">
                  {editingId === stat.id ? (
                     <div className="flex items-center gap-2">
                       <input 
                         type="number" 
                         value={editLimit} 
                         onChange={e => setEditLimit(e.target.value)}
                         className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-200 w-24 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-center"
                         autoFocus
                         placeholder="0"
                       />
                       <button onClick={() => saveBudget(stat.id)} className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"><Check className="w-4 h-4" /></button>
                       <button onClick={() => setEditingId(null)} className="p-1 rounded-md bg-slate-800 text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
                     </div>
                  ) : (
                     <div className="flex items-center gap-3 group">
                       {!stat.budget?.isDynamic && (
                         <button 
                           onClick={() => { setEditingId(stat.id); setEditLimit(stat.limit > 0 ? stat.limit.toString() : ''); }}
                           className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-all shrink-0"
                         >
                           <Edit2 className="w-3.5 h-3.5" />
                         </button>
                       )}
                       {stat.budget?.isDynamic && (
                         <div className="text-[10px] text-slate-400/80 bg-slate-800/40 px-2 py-1 rounded-md border border-slate-700/50 shrink-0 select-none">
                           אוטומטי
                         </div>
                       )}
                       <div className="flex flex-col text-right relative">
                          <span className={`text-sm font-semibold ${stat.isOverBudget ? 'text-red-400' : 'text-slate-200'}`} dir="ltr">
                            {stat.spent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-slate-500 font-normal">/ {stat.limit > 0 ? stat.limit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '---'}</span>
                          </span>
                          {stat.isOverBudget && (
                            <span className="absolute top-full right-0 text-[10px] text-red-400 font-medium mt-0.5 whitespace-nowrap" dir="rtl">
                              חריגה של ₪{(stat.spent - stat.limit).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </span>
                          )}
                       </div>
                     </div>
                  )}
               </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2.5 w-full bg-slate-800/50 rounded-full overflow-hidden shadow-inner relative" dir="ltr">
              <div 
                className={`h-full transition-all duration-700 rounded-full ${stat.isOverBudget ? 'bg-red-500' : 'bg-sky-500'}`}
                style={{ width: `${Math.min(stat.progress, 100)}%` }}
              />
            </div>
            
          </div>
        ))}
        
        {categoryStats.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            לא נמצאו קטגוריות.
          </div>
        )}
      </div>
    </div>
  );
}
