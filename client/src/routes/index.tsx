import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Wallet, RefreshCw, ChevronLeft, ChevronRight, Edit2, Check, X, SlidersHorizontal, Search } from 'lucide-react';
import { BudgetModal } from '@/components/BudgetModal';
import { BudgetProgress } from '@/components/BudgetProgress';
import { AggregateCards } from '@/components/AggregateCards';

export const Route = createFileRoute('/')({
  component: Dashboard,
});

function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMerchantName, setEditMerchantName] = useState("");
  const [editOwner, setEditOwner] = useState("");
  const [budgetLimit, setBudgetLimit] = useState<number>(10000);
  const [categoryBudgets, setCategoryBudgets] = useState<any[]>([]);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [minAmount, setMinAmount] = useState<number>(0);
  const [filterOwner, setFilterOwner] = useState('All');
  const [filterIsFixed, setFilterIsFixed] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState('EXPENSE');
  const [filterCategory, setFilterCategory] = useState('All');
  const [categories, setCategories] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAPI('/categories').then(res => setCategories(res.data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadData = () => {
    const params = new URLSearchParams();
    if (filterOwner !== 'All') params.append('owner', filterOwner);
    if (filterIsFixed !== 'All') params.append('isFixed', filterIsFixed);
    if (filterStatus !== 'All') params.append('status', filterStatus);
    if (debouncedSearch) params.append('search', debouncedSearch);

    // Fetch without category/type filter so we can compute global budgets
    fetchAPI(`/transactions?${params.toString()}`).then(res => setData(res.data || [])).catch(console.error);

    fetchAPI(`/transactions?${params.toString()}`).then(res => setData(res.data || [])).catch(console.error);
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
      
      const allRes = await fetchAPI(`/budget/${period}/all`);
      if (allRes.data) {
        setCategoryBudgets(allRes.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterOwner, filterIsFixed, filterStatus, filterCategory, filterType, debouncedSearch]);

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

  const saveTransaction = async (id: string) => {
    try {
      await fetchAPI(`/transactions/${id}/merchant`, {
        method: 'PATCH',
        body: JSON.stringify({ merchant: editMerchantName })
      });
      await fetchAPI(`/transactions/${id}/owner`, {
        method: 'PATCH',
        body: JSON.stringify({ cardOwner: editOwner || null })
      });
      
      const tx = data.find(t => t.id === id);
      if (tx) {
        setData(data.map(t => t.id === id ? { ...t, merchant: editMerchantName, cardOwner: editOwner || null } : t));
        setEditingId(null);
      }
    } catch (e) {
      console.error("Failed to update transaction", e);
    }
  };

  // Filter data by selected month and amount
  const monthData = data.filter(t => {
    const d = new Date(t.transactionDate);
    const matchesMonth = d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    const matchesAmount = Math.abs(Number(t.amount)) >= minAmount;
    return matchesMonth && matchesAmount;
  });

  const globalOutflow = monthData
    .filter(t => Number(t.amount) < 0 || t.paymentMethod === 'CASH')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  const computedType = filterOwner !== 'All' ? 'EXPENSE' : filterType;

  // Filtered by category and type (what we show in the list)
  const filteredData = monthData.filter(t => {
    if (filterCategory !== 'All' && t.categoryId !== filterCategory) return false;
    if (computedType !== 'All' && t.type !== computedType) return false;
    return true;
  });

  // Compute real aggregates from filtered data
  const totalOutflow = filteredData
    .filter(t => Number(t.amount) < 0 || t.paymentMethod === 'CASH')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    
  const totalIncome = filteredData
    .filter(t => Number(t.amount) > 0 && t.paymentMethod !== 'CASH')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const categorySelected = filterCategory !== 'All';
  const selectedCategoryName = categorySelected ? categories.find(c => c.id === filterCategory)?.name : undefined;
  
  const categoryLimit = categorySelected && categoryBudgets.length > 0
    ? Number(categoryBudgets.find(b => b.categoryId === filterCategory)?.userDefinedLimit || 0)
    : undefined;
    
  const periodLabel = currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  
  const getProgressColor = (p: number) => {
    if (p < 75) return 'bg-emerald-500';
    if (p < 100) return 'bg-amber-400';
    return 'bg-red-500';
  };

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const showOutflow = computedType !== 'INCOME' && selectedCategoryName !== 'משכורת';
  const showIncome = computedType !== 'EXPENSE' && (filterCategory === 'All' || totalIncome > 0 || computedType === 'INCOME');
  const isSingleCard = showOutflow !== showIncome;

  const hasActiveFilters = filterType !== 'All' || filterOwner !== 'All' || filterIsFixed !== 'All' || filterStatus !== 'All' || filterCategory !== 'All' || searchQuery !== '';

  const clearFilters = () => {
    setFilterType('All');
    setFilterOwner('All');
    setFilterIsFixed('All');
    setFilterStatus('All');
    setFilterCategory('All');
    setSearchQuery('');
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
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors active:scale-95 text-sm font-medium text-slate-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-sky-400' : ''}`} />
            <span className="hidden sm:inline">סנכרון</span>
          </button>
        </div>
      </header>

      {/* Floating Filter Button */}
      <button 
        onClick={() => setShowFilters(true)} 
        className="fixed bottom-24 left-6 z-30 p-4 rounded-full bg-slate-800 border border-slate-700 text-slate-300 shadow-xl shadow-black/50 hover:bg-slate-700 hover:text-slate-100 transition-all active:scale-95 flex items-center justify-center"
      >
        <SlidersHorizontal className="w-6 h-6"/>
        {hasActiveFilters && (
          <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-sky-500 border-2 border-slate-900 rounded-full"></div>
        )}
      </button>

      {/* Filter Sidebar */}
      {showFilters && (
        <div 
          className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col h-[100dvh] animate-in slide-in-from-right duration-300 pointer-events-auto"
          dir="rtl"
        >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between pt-6 px-6 mb-6 shrink-0">
              <h2 className="text-lg font-bold text-slate-200">סינון עסקאות</h2>
              <button 
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-950/50 rounded-2xl p-2 mb-6 mx-6 border border-slate-800/50 shrink-0">
              <Search className="w-5 h-5 text-slate-500 ml-2" />
              <input 
                type="text" 
                placeholder="חיפוש עסקאות..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-2 py-1.5 text-sm text-slate-200 placeholder-slate-500 outline-none"
              />
            </div>
            
            {/* Scrollable Content */}
            <div className="flex flex-col gap-6 flex-1 overflow-y-auto px-6 pb-6 min-h-0">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-400">בעלים</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'הכל', value: 'All' },
                    { label: 'Porat', value: 'Porat' },
                    { label: 'Liza', value: 'Liza' }
                  ].map(opt => {
                    const isActive = filterOwner === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setFilterOwner(opt.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-sky-500 text-white shadow-sm' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-400">תדירות</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'הכל', value: 'All' },
                    { label: 'קבוע', value: 'true' },
                    { label: 'משתנה', value: 'false' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setFilterIsFixed(opt.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterIsFixed === opt.value ? 'bg-sky-500 text-white shadow-sm' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-400">קטגוריה</label>
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-sky-500 transition-colors cursor-pointer"
                >
                  <option value="All">כל הקטגוריות</option>
                  <option value="Uncategorized">ללא קטגוריה</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Sidebar Footer */}
            {hasActiveFilters ? (
              <div className="shrink-0 bg-slate-900 border-t border-slate-800/50 p-6 pb-24">
                 <button
                   onClick={clearFilters}
                   className="w-full px-4 py-3 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 text-sm font-medium transition-colors"
                 >
                   נקה סינון
                 </button>
              </div>
            ) : (
              <div className="shrink-0 pb-24" />
            )}
          </div>
      )}

      {/* Aggregate Cards */}
      <AggregateCards 
        showOutflow={showOutflow} 
        showIncome={showIncome} 
        isSingleCard={isSingleCard} 
        totalOutflow={totalOutflow} 
        totalIncome={totalIncome}
        outflowLimit={categoryLimit}
        categoryName={selectedCategoryName}
      />

      {/* Main Budget Progress */}
      {selectedCategoryName !== 'משכורת' && (
        <BudgetProgress 
          totalOutflow={globalOutflow} 
          budgetLimit={budgetLimit} 
          categoryOutflow={categorySelected ? totalOutflow : undefined}
          onClick={() => setIsBudgetModalOpen(true)} 
        />
      )}

      {/* Transaction Feed Tabs or Sub Budget */}
      {categorySelected ? (
        <BudgetProgress 
          title={`תקציב ${selectedCategoryName}`}
          totalOutflow={totalOutflow} 
          budgetLimit={categoryLimit || 0}
          isSubBudget={true}
        />
      ) : (
        <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800/50 backdrop-blur-sm shadow-sm mb-4" dir="rtl">
          <button
            onClick={() => setFilterType(computedType === 'EXPENSE' ? 'All' : 'EXPENSE')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${computedType === 'EXPENSE' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            הוצאות
          </button>
          <button
            onClick={() => setFilterType(computedType === 'INCOME' ? 'All' : 'INCOME')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${computedType === 'INCOME' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            הכנסות
          </button>
        </div>
      )}

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredData.map((t) => (
          <div 
            key={t.id} 
            onClick={() => {
              if (editingId !== t.id) {
                setEditingId(t.id);
                setEditMerchantName(t.merchant);
                setEditOwner(t.cardOwner || '');
              }
            }}
            className={`flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800/50 shadow-sm hover:border-slate-700 transition-colors group ${editingId !== t.id ? 'cursor-pointer' : ''}`}
          >
            {/* Right side (start of RTL) */}
            <div className="flex items-center gap-3 w-full overflow-hidden">
              {t.category?.icon ? (
                <span className="text-3xl shrink-0 leading-none">{t.category.icon}</span>
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                   <span className="text-slate-500 text-sm">?</span>
                </div>
              )}
              <div className="flex flex-col flex-1 min-w-0">
                {editingId === t.id ? (
                  <input 
                    type="text" 
                    value={editMerchantName} 
                    onChange={e => setEditMerchantName(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveTransaction(t.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="bg-slate-900/80 border border-slate-700/80 rounded-md px-2 py-0.5 text-[15px] font-medium text-slate-200 w-full outline-none focus:border-sky-500/70 focus:ring-1 focus:ring-sky-500/40 text-right mb-0.5"
                    autoFocus
                  />
                ) : (
                  <span className="font-medium text-[15px] text-slate-200 truncate">{t.merchant}</span>
                )}
                <span className="text-[10px] text-slate-500 mt-0.5">{formatDate(t.transactionDate)}</span>
              </div>
            </div>
            
            {/* Left side (end of RTL) */}
            <div className="flex items-center gap-3 shrink-0" dir="ltr">
              {editingId === t.id ? (
                  <>
                    <span className={`font-semibold text-[15px] w-16 md:w-20 text-left shrink-0 ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ₪{Math.abs(Number(t.amount)).toFixed(2)}
                    </span>
                    <select
                      value={editOwner}
                      onChange={(e) => setEditOwner(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className="bg-slate-800/80 border border-slate-700/80 rounded-md px-1.5 py-1 text-[11px] font-medium text-slate-300 outline-none cursor-pointer text-center h-7"
                    >
                      <option value="">-</option>
                      <option value="Porat">Porat</option>
                      <option value="Liza">Liza</option>
                    </select>
                    <div className="flex items-center gap-1.5 ml-1" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => saveTransaction(t.id)} 
                        className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all border border-emerald-500/20"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditingId(null)} 
                        className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-all border border-slate-700/50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </>
              ) : (
                  <>
                    <span className={`font-semibold text-[15px] w-20 text-left shrink-0 ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ₪{Math.abs(Number(t.amount)).toFixed(2)}
                    </span>
                    {t.cardOwner && (
                      <span className="text-[10px] font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 shrink-0">
                        {t.cardOwner}
                      </span>
                    )}
                  </>
              )}
            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            לא נמצאו עסקאות עבור מסננים אלו.
          </div>
        )}
      </div>

      <BudgetModal 
        isOpen={isBudgetModalOpen} 
        onClose={() => setIsBudgetModalOpen(false)} 
        currentBudget={budgetLimit} 
        onSave={handleSaveBudget}
        period={currentMonth.toLocaleString('he-IL', { month: 'short', year: 'numeric' })}
      />
    </div>
  );
}
