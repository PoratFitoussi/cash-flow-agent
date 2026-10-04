import { createFileRoute } from '@tanstack/react-router';
import { getMockBalance } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

export const Route = createFileRoute('/balance')({
  component: BalancePage,
});

function BalancePage() {
  const balance = getMockBalance();
  
  const hasData = balance !== null && balance !== undefined;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <h1 className="text-2xl font-bold mb-6 text-foreground">מצב הע״וש</h1>
      
      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-card/50 mt-4">
          <Wallet className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2 text-foreground">אין נתונים זמינים</h2>
          <p className="text-muted-foreground">לא ניתן למשוך את יתרת העובר ושב כרגע.</p>
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              יתרה נוכחית
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-5xl font-bold tracking-tight ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              ₪{balance.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              מעודכן להיום
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
