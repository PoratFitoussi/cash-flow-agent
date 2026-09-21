import React from 'react';

interface BudgetProgressProps {
  totalOutflow: number;
  budgetLimit: number;
  categoryOutflow?: number;
  title?: string;
  isSubBudget?: boolean;
  onClick?: () => void;
}

export function BudgetProgress({ totalOutflow, budgetLimit, categoryOutflow, title = "תקציב חודשי", isSubBudget, onClick }: BudgetProgressProps) {
  const displayOutflow = categoryOutflow !== undefined ? categoryOutflow : totalOutflow;
  const progress = budgetLimit > 0 ? (displayOutflow / budgetLimit) * 100 : 0;
  
  return (
    <div 
      onClick={onClick}
      className={`bg-slate-900/60 p-5 rounded-3xl border border-slate-800/50 backdrop-blur-sm shadow-sm ${onClick ? 'cursor-pointer hover:bg-slate-900/80 transition-colors' : ''} ${isSubBudget ? 'mb-4 py-4 px-5 bg-slate-900/80 border-sky-900/50' : 'mb-8'}`}
    >
      <div className="flex justify-between items-center mb-4">
        <span className={`font-medium ${isSubBudget ? 'text-sky-300 text-sm' : 'text-slate-300'}`}>{title}</span>
        <div className="flex flex-col text-left" dir="ltr">
          <span className="text-sm font-semibold text-slate-200">
            {displayOutflow.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-slate-500 font-normal">/ {budgetLimit > 0 ? budgetLimit.toLocaleString() : '---'}</span>
          </span>
          {budgetLimit > 0 && displayOutflow > budgetLimit && (
            <span className="text-[10px] text-red-400 font-medium mt-0.5 text-right" dir="rtl">
              חריגה של ₪{(displayOutflow - budgetLimit).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </span>
          )}
        </div>
      </div>
      <div className="h-3 w-full bg-slate-800/50 rounded-full overflow-hidden shadow-inner flex" dir="ltr">
        {categoryOutflow !== undefined && budgetLimit > 0 ? (
          <div 
            className={`h-full transition-all duration-700 ${progress > 100 ? 'bg-red-400' : 'bg-sky-400'}`}
            style={{ width: `${Math.min((categoryOutflow / budgetLimit) * 100, 100)}%` }}
          />
        ) : (
          <div 
            className={`h-full transition-all duration-700 rounded-full ${progress > 100 ? 'bg-red-500' : 'bg-sky-500'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        )}
      </div>
    </div>
  );
}
