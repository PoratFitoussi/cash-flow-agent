import { MoneyItem } from "@/lib/mockData";
import { Share2, ChevronLeft, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const hebrewMonths = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

export function MonthlySummary({ items, month }: { items: MoneyItem[], prevItems: MoneyItem[], month?: number }) {
  const incomes = items.filter(i => i.type === "income");
  const expenses = items.filter(i => i.type === "expense");

  const actualIncome = incomes.reduce((sum, item) => sum + item.actualAmount, 0);
  const actualExpense = expenses.reduce((sum, item) => sum + item.actualAmount, 0);

  const netActual = actualIncome - actualExpense;
  const isNegative = netActual < 0;
  
  const monthName = month ? hebrewMonths[month - 1] : "החודש";
  
  // Title matches the image depending on whether it's positive or negative
  const titleText = isNegative 
    ? `${monthName} הסתיים בתזרים שלילי` 
    : `${monthName} הסתיים בתזרים חיובי`;

  // Number formatting: in the image it looks like the number is massive and colored.
  const absNet = Math.abs(netActual).toLocaleString();

  return (
    <div className="mb-6 mx-auto w-full max-w-sm rounded-3xl bg-card border shadow-sm overflow-hidden flex flex-col">
      {/* Top Section */}
      <div className="p-6 pb-8 relative text-center">
        <Button variant="ghost" size="icon" className="absolute top-4 left-4 text-foreground hover:bg-muted/50 rounded-full h-8 w-8">
          <Share2 className="h-4 w-4" />
          <span className="sr-only">שתף</span>
        </Button>

        <h2 className="text-xl font-bold mt-4 mb-4 text-foreground">
          {titleText}
        </h2>

        <div 
          className={`flex items-center justify-center text-7xl font-semibold tracking-tighter ${
            isNegative ? "text-rose-500" : "text-emerald-500"
          }`}
          dir="ltr"
        >
          <span className="text-5xl mr-2 mt-2">₪</span>
          {isNegative && <span className="mr-1">-</span>}
          {absNet}
        </div>
      </div>

      <div className="border-t w-full" />

      {/* Middle Section */}
      <div className="p-6 flex flex-col gap-3">
        <div className="flex justify-between items-center text-lg">
          <span className="text-foreground">סה״כ הכנסות</span>
          <span className="font-medium text-foreground dir-ltr" dir="ltr">
            + {actualIncome.toLocaleString()} ₪
          </span>
        </div>
        <div className="flex justify-between items-center text-lg">
          <span className="text-foreground">סה״כ הוצאות</span>
          <span className="font-medium text-rose-500 dir-ltr" dir="ltr">
            - {actualExpense.toLocaleString()} ₪
          </span>
        </div>
      </div>

      <div className="border-t w-full" />

      {/* Bottom Section */}
      <button className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors w-full group">
        <div className="flex items-center gap-3">
          <div className="bg-foreground text-background rounded-md p-1.5 flex items-center justify-center">
            <TrendingUp className="h-4 w-4" strokeWidth={3} />
          </div>
          <span className="text-xl font-medium text-foreground">
            ההשפעה על ההתקדמות שלי
          </span>
        </div>
        <ChevronLeft className="h-6 w-6 text-foreground font-bold group-hover:-translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
