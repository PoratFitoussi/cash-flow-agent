import React from 'react';

interface AggregateCardsProps {
  showOutflow: boolean;
  showIncome: boolean;
  isSingleCard: boolean;
  totalOutflow: number;
  totalIncome: number;
  outflowLimit?: number;
  categoryName?: string;
}

export function AggregateCards({ showOutflow, showIncome, isSingleCard, totalOutflow, totalIncome, outflowLimit, categoryName }: AggregateCardsProps) {
  return (
    <div className={`grid ${isSingleCard ? 'grid-cols-1' : 'grid-cols-2'} gap-4 mb-6`}>
      {showOutflow && (
        <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800/50 backdrop-blur-sm shadow-sm">
          <div className="flex justify-between items-start mb-1">
             <span className="text-sm text-slate-300 font-medium">
               {categoryName ? `הוצאות (${categoryName})` : 'הוצאות'}
             </span>
             {outflowLimit !== undefined && (
               <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/50" dir="rtl">
                 תקציב: ₪{outflowLimit.toLocaleString()}
               </span>
             )}
          </div>
          <div className={`text-3xl font-bold ${isSingleCard ? 'text-center text-4xl py-4' : ''} text-rose-400`} dir="ltr">
            ₪{totalOutflow.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
        </div>
      )}
      
      {showIncome && (
        <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800/50 backdrop-blur-sm shadow-sm">
          <span className="text-sm text-slate-300 font-medium block mb-1">הכנסות</span>
          <div className={`text-3xl font-bold ${isSingleCard ? 'text-center text-4xl py-4' : ''} text-emerald-400`} dir="ltr">
            ₪{totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
        </div>
      )}
    </div>
  );
}
