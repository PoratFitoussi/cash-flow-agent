import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { MonthlySummary } from '@/components/MonthlySummary';
import { MonthNavigation } from '@/components/MonthNavigation';
import { AggregateCards } from '@/components/AggregateCards';
import { AddCategoryModal } from '@/components/AddCategoryModal';
import { Plus } from 'lucide-react';
import { mockMoneyItems, MoneyItem } from '@/lib/mockData';

export const Route = createFileRoute('/home/$period')({
  component: MonthlyOverview,
});

function MonthlyOverview() {
  const { period } = Route.useParams();
  const [year, month] = period.split('-');
  
  const currentPeriod = period;
  
  // Calculate previous period string for comparison
  const d = new Date(Number(year), Number(month) - 1 - 1, 1);
  const prevPeriod = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  const [items, setItems] = useState<MoneyItem[]>([]);
  const [prevItems, setPrevItems] = useState<MoneyItem[]>([]);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  useEffect(() => {
    // In a real app, this would be a data fetch.
    setItems(mockMoneyItems.filter(i => i.month === currentPeriod));
    setPrevItems(mockMoneyItems.filter(i => i.month === prevPeriod));
  }, [currentPeriod, prevPeriod]);

  const handleUpdateItem = (updatedItem: MoneyItem) => {
    setItems(currentItems => currentItems.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    // Here we would also dispatch a mutation to save the update to the backend
  };

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
              items={items.filter(i => i.type === "expense" && i.name.includes("חיסכון"))} 
              onUpdateItem={handleUpdateItem}
              actualLabel="יצא"
              expectedLabel="צפוי לצאת"
              colorTheme="orange"
              singleAccordionLabel="פירוט חודשי"
            />

            <AggregateCards 
              title="הוצאות קבועות" 
              items={items.filter(i => i.type === "expense" && !i.name.includes("חיסכון"))} 
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
              <span className="font-bold text-xl text-[#6571ff]">
                הוספת קטגוריה למעקב
              </span>
              <div className="absolute right-4 bg-[#6571ff] rounded-full p-1 text-white shadow-sm group-hover:scale-105 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
            </button>
          </div>
        </>
      )}

      <div className="mt-auto">
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
