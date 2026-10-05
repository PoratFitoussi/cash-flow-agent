import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { MonthlySummary } from '@/components/MonthlySummary';
import { MonthNavigation } from '@/components/MonthNavigation';
import { AggregateCards } from '@/components/AggregateCards';
import { AddCategoryModal } from '@/components/AddCategoryModal';
import { Plus } from 'lucide-react';
import { useTransactions } from '@/features/transactions/useTransactions';
import { useCategories } from '@/features/categories/useCategories';
import { useAllBudgets } from '@/features/budget/useBudget';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/home/$period')({
  component: MonthlyOverview,
});

export type MoneyItem = {
  id: string;
  month: string;
  type: "income" | "expense";
  category: string;
  name: string;
  expectedAmount: number;
  actualAmount: number;
  icon?: string;
};

function MonthlyOverview() {
  const { period } = Route.useParams();
  const [year, month] = period.split('-');
  
  const currentPeriod = period;
  
  // Calculate previous period string for comparison
  const d = new Date(Number(year), Number(month) - 1 - 1, 1);
  const prevPeriod = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  // Fetch real data
  const { data: categories = [], isLoading: catLoading } = useCategories();
  const { data: currentTransactions = [], isLoading: currLoading } = useTransactions({ period: currentPeriod });
  const { data: prevTransactions = [], isLoading: prevLoading } = useTransactions({ period: prevPeriod });
  const { data: currentBudgets = [], isLoading: currBudgetsLoading } = useAllBudgets(currentPeriod);
  const { data: prevBudgets = [], isLoading: prevBudgetsLoading } = useAllBudgets(prevPeriod);

  const isLoading = catLoading || currLoading || prevLoading || currBudgetsLoading || prevBudgetsLoading;

  // Transform raw data into MoneyItem array for the UI components
  const transformData = (txns: any[], budgets: any[], targetPeriod: string) => {
    const results: MoneyItem[] = [];
    const catMap = new Map(categories.map((c: any) => [c.id, c]));

    // 1. Handle Expenses (Grouped by Category and matched with budgets)
    const expenseTxns = txns.filter(t => t.type === 'EXPENSE');
    const spentByCategory: Record<string, number> = {};
    
    expenseTxns.forEach(t => {
      const cid = t.categoryId || 'uncategorized';
      spentByCategory[cid] = (spentByCategory[cid] || 0) + Math.abs(Number(t.amount));
    });

    budgets.forEach(b => {
      if (!b.categoryId) return; // skip global budget
      const cat = catMap.get(b.categoryId);
      const actual = spentByCategory[b.categoryId] || 0;
      const expected = Number(b.userDefinedLimit || 0);
      
      results.push({
        id: b.categoryId,
        month: targetPeriod,
        type: 'expense',
        category: b.categoryId,
        name: cat?.name || 'Unknown',
        expectedAmount: expected,
        actualAmount: actual,
        icon: cat?.icon
      });
      delete spentByCategory[b.categoryId]; // Mark as processed
    });

    // Handle categories that had expenses but no budget defined
    Object.keys(spentByCategory).forEach(cid => {
      const cat = catMap.get(cid);
      results.push({
        id: cid,
        month: targetPeriod,
        type: 'expense',
        category: cid,
        name: cat?.name || (cid === 'uncategorized' ? 'לא מקוטלג' : 'Unknown'),
        expectedAmount: 0,
        actualAmount: spentByCategory[cid],
        icon: cat?.icon
      });
    });

    // 2. Handle Incomes
    const incomeTxns = txns.filter(t => t.type === 'INCOME');
    const earnedByCategory: Record<string, number> = {};
    
    incomeTxns.forEach(t => {
      const cid = t.categoryId || t.merchant || 'uncategorized';
      earnedByCategory[cid] = (earnedByCategory[cid] || 0) + Math.abs(Number(t.amount));
    });

    Object.keys(earnedByCategory).forEach(cid => {
      const cat = catMap.get(cid);
      const name = cat?.name || (cid === 'uncategorized' ? 'הכנסה' : cid);
      results.push({
        id: `inc_${cid}`,
        month: targetPeriod,
        type: 'income',
        category: cid,
        name: name,
        expectedAmount: earnedByCategory[cid], // Assuming expected = actual for income for now
        actualAmount: earnedByCategory[cid],
        icon: cat?.icon
      });
    });

    return results;
  };

  const items = transformData(currentTransactions, currentBudgets, currentPeriod);
  const prevItems = transformData(prevTransactions, prevBudgets, prevPeriod);

  const handleUpdateItem = (updatedItem: MoneyItem) => {
    // Here we would dispatch a mutation to save budget limit updates to the backend
    console.log("Update requested for", updatedItem);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-300 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#6571ff] mb-4" />
        <h2 className="text-xl font-bold text-muted-foreground">טוען נתונים...</h2>
      </div>
    );
  }

  const hasData = items.length > 0;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <h1 className="text-2xl font-bold mb-6 text-foreground">סקירה חודשית</h1>
      
      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-card/50 mt-4">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-xl font-semibold mb-2 text-foreground">אין נתונים לחודש זה</h2>
          <p className="text-muted-foreground">לא נמצאו תנועות כספיות לחודש {month}/{year}.</p>
        </div>
      ) : (
        <>
          <MonthlySummary items={items} prevItems={prevItems} month={Number(month)} />
          
          <div className="mt-6">
            <AggregateCards 
              title="הכנסות" 
              items={items.filter(i => i.type === "income")} 
              onUpdateItem={handleUpdateItem}
              actualLabel="נכנס"
              expectedLabel="צפוי להיכנס"
              colorTheme="emerald"
            />
            
            <AggregateCards 
              title="הפקדות לחיסכון" 
              items={items.filter(i => i.type === "expense" && (i.name.includes("חיסכון") || i.name.includes("השקעות")))} 
              onUpdateItem={handleUpdateItem}
              actualLabel="יצא"
              expectedLabel="צפוי לצאת"
              colorTheme="orange"
              singleAccordionLabel="פירוט חודשי"
            />

            <AggregateCards 
              title="הוצאות קבועות" 
              items={items.filter(i => i.type === "expense" && !(i.name.includes("חיסכון") || i.name.includes("השקעות")))} 
              onUpdateItem={handleUpdateItem}
              actualLabel="יצא"
              expectedLabel="צפוי לצאת"
              colorTheme="pink"
              singleAccordionLabel="פירוט חודשי"
            />
            
            <button 
              onClick={() => setIsAddCategoryOpen(true)}
              className="w-full mt-4 flex items-center justify-center p-4 border-2 border-dashed border-[#6571ff]/40 rounded-3xl hover:bg-[#6571ff]/5 transition-colors group relative"
            >
              <span className="font-extrabold text-xl text-indigo-600">
                הוספת קטגוריה למעקב
              </span>
              <div className="absolute right-4 bg-[#6571ff] rounded-full p-1 text-white shadow-sm group-hover:scale-105 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
            </button>
          </div>
        </>
      )}

      <div className="mt-auto pt-6">
        <MonthNavigation year={Number(year)} month={Number(month)} />
      </div>

      <AddCategoryModal 
        isOpen={isAddCategoryOpen} 
        onClose={() => setIsAddCategoryOpen(false)} 
        monthName={month} 
      />
    </div>
  );
}
