import React from 'react';
import { ShoppingCart, Car, Home, Utensils, HeartPulse, HelpCircle } from 'lucide-react';

export type Expense = {
  expense_id: string;
  merchant: string;
  price: number;
  currency: string;
  date: string;
  user_that_purchase: string;
  category: string;
  payment_method?: string;
  notes?: string;
};

interface ExpensesItemProps {
  expense: Expense;
}

const ExpensesItem: React.FC<ExpensesItemProps> = ({ expense }) => {
  // Helper to pick an icon based on category
  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c === 'supermarket' || c.includes('grocer') || c.includes('market') || c.includes('food')) return <ShoppingCart size={20} />;
    if (c === 'car' || c.includes('vehicle') || c.includes('gas') || c.includes('transport')) return <Car size={20} />;
    if (c === 'housing' || c.includes('hous') || c.includes('rent') || c.includes('mortgage')) return <Home size={20} />;
    if (c === 'eating out' || c.includes('eat') || c.includes('din') || c.includes('restaurant')) return <Utensils size={20} />;
    if (c === 'health' || c.includes('medic')) return <HeartPulse size={20} />;
    return <HelpCircle size={20} />;
  };

  return (
    <div className="flex items-center justify-between p-4 mb-3 rounded-2xl bg-dark-card/60 border border-white/5 backdrop-blur-md hover:bg-white/5 transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary">
          {getCategoryIcon(expense.category)}
        </div>
        <div className="flex flex-col">
          <span className="text-base font-semibold text-text-primary">{expense.merchant}</span>
          <span className="text-xs font-medium text-text-secondary flex items-center gap-2">
            <span>{new Date(expense.date).toLocaleDateString()}</span>
            <span className="w-1 h-1 rounded-full bg-text-secondary"></span>
            <span>{expense.category}</span>
          </span>
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <span className="text-base font-bold text-text-primary">
          {expense.currency === 'ILS' ? '₪' : expense.currency === 'USD' ? '$' : expense.currency} {expense.price.toFixed(2)}
        </span>
        <span className="text-xs text-text-secondary">by {expense.user_that_purchase}</span>
      </div>
    </div>
  );
};

export default ExpensesItem;
