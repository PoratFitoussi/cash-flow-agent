import { Link } from '@tanstack/react-router';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const hebrewMonths = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

function getAdjacentMonth(currentYear: number, currentMonth: number, offset: number) {
  const d = new Date(currentYear, currentMonth - 1 + offset, 1);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1
  };
}

function formatMonthUrl(year: number, month: number) {
  return `/home/${year}-${String(month).padStart(2, '0')}`;
}

export function MonthNavigation({ year, month }: { year: number, month: number }) {
  const prevDate = getAdjacentMonth(year, month, -1);
  const nextDate = getAdjacentMonth(year, month, 1);
  
  const monthName = hebrewMonths[month - 1];

  return (
    <div className="flex items-center justify-between bg-card border rounded-full px-4 py-2 mt-8 mb-4 max-w-sm mx-auto shadow-sm">
      {/* Right arrow for Previous month in RTL */}
      <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent h-8 w-8" asChild>
        <Link to={formatMonthUrl(prevDate.year, prevDate.month)}>
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">חודש קודם</span>
        </Link>
      </Button>
      
      <div className="font-medium text-base text-center min-w-[120px]">
        {monthName} {year}
      </div>
      
      {/* Left arrow for Next month in RTL */}
      <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent h-8 w-8" asChild>
        <Link to={formatMonthUrl(nextDate.year, nextDate.month)}>
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">חודש הבא</span>
        </Link>
      </Button>
    </div>
  );
}
