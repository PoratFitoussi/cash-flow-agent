import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTransactions, useSync, useUpdateTransaction } from '@/features/transactions/useTransactions';
import { useCategories } from '@/features/categories/useCategories';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownIcon, ArrowUpIcon, RefreshCw, AlertCircle, ShoppingCart, Car, Home, Utensils, HeartPulse, Zap, Bus, Briefcase, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: Dashboard,
});

function Dashboard() {
  const currentDate = new Date();
  const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [period, setPeriod] = useState(currentPeriod);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const handlePeriodChange = (val: string) => {
    setPeriod(val);
    setPage(0);
  };

  const monthOptions = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    return { val, label };
  });

  const { data: transactions = [], isLoading } = useTransactions({ period });
  const { data: categories = [] } = useCategories();
  const syncMutation = useSync();
  const updateTxMutation = useUpdateTransaction();

  const incomes = transactions.filter((t: any) => t.type === 'INCOME' && t.paymentMethod !== 'CASH');
  const expenses = transactions.filter((t: any) => t.type === 'EXPENSE' || t.paymentMethod === 'CASH');

  const totalIncome = incomes.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const totalExpense = expenses.reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount)), 0);
  const netFlow = totalIncome - totalExpense;

  const uncategorizedCount = expenses.filter((t: any) => !t.categoryId).length;

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">Monitor your cash flow and approve recent transactions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Time</SelectItem>
              {monthOptions.map(opt => (
                <SelectItem key={opt.val} value={opt.val}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={() => syncMutation.mutate()} 
            disabled={syncMutation.isPending}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{syncMutation.isPending ? 'Syncing...' : 'Sync'}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{totalExpense.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+4.5% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
            <ActivityIcon className={`h-4 w-4 ${netFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{netFlow.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available runway</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4 lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                You have {transactions.length} total transactions this period.
              </CardDescription>
            </div>
            {uncategorizedCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {uncategorizedCount} Uncategorized
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {/* Mobile View: List of transactions */}
            <div className="md:hidden flex flex-col gap-3">
              {transactions.slice(page * pageSize, (page + 1) * pageSize).map((t: any) => (
                <div key={t.id} className="flex flex-col gap-2 p-3 rounded-lg border bg-card text-card-foreground">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm line-clamp-1" title={t.merchant}>{t.merchant}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(t.transactionDate)}</span>
                    </div>
                    <span className={`font-semibold whitespace-nowrap ${t.type === 'INCOME' && t.paymentMethod !== 'CASH' ? 'text-emerald-500' : ''}`}>
                      {t.type === 'INCOME' && t.paymentMethod !== 'CASH' ? '+' : '-'}₪{Math.abs(Number(t.amount)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <Badge variant={t.categoryId ? "secondary" : "outline"} className={`text-[10px] px-1.5 py-0 flex items-center ${!t.categoryId ? "text-amber-500 border-amber-500/50" : ""}`}>
                      {t.categoryId ? getCategoryIcon(t.category?.name || '') : <HelpCircle className="h-3 w-3 mr-1" />}
                      {t.category?.name || "Uncategorized"}
                    </Badge>
                    <Select 
                      value={t.cardOwner || "none"} 
                      onValueChange={(val) => {
                        updateTxMutation.mutate({ 
                          id: t.id, 
                          cardOwner: val === "none" ? null : val 
                        });
                      }}
                    >
                      <SelectTrigger className="w-[100px] h-6 text-[10px] px-2">
                        <SelectValue placeholder="Assign" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        <SelectItem value="Porat">Porat</SelectItem>
                        <SelectItem value="Liza">Liza</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(page * pageSize, (page + 1) * pageSize).map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(t.transactionDate)}
                      </TableCell>
                      <TableCell className="font-medium max-w-[150px] truncate" title={t.merchant}>
                        {t.merchant}
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.categoryId ? "secondary" : "outline"} className={`flex w-fit items-center ${!t.categoryId ? "text-amber-500 border-amber-500/50" : ""}`}>
                          {t.categoryId ? getCategoryIcon(t.category?.name || '') : <HelpCircle className="h-3 w-3 mr-1" />}
                          {t.category?.name || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={t.cardOwner || "none"} 
                          onValueChange={(val) => {
                            updateTxMutation.mutate({ 
                              id: t.id, 
                              cardOwner: val === "none" ? null : val 
                            });
                          }}
                        >
                          <SelectTrigger className="w-[110px] h-8 text-xs">
                            <SelectValue placeholder="Assign" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Unassigned</SelectItem>
                            <SelectItem value="Porat">Porat</SelectItem>
                            <SelectItem value="Liza">Liza</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className={`text-right font-medium whitespace-nowrap ${t.type === 'INCOME' && t.paymentMethod !== 'CASH' ? 'text-emerald-500' : ''}`}>
                        {t.type === 'INCOME' && t.paymentMethod !== 'CASH' ? '+' : '-'}₪{Math.abs(Number(t.amount)).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {Math.ceil(transactions.length / pageSize) > 1 && (
              <div className="flex items-center justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground min-w-[80px] text-center">
                  Page {page + 1} of {Math.ceil(transactions.length / pageSize)}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(Math.ceil(transactions.length / pageSize) - 1, p + 1))}
                  disabled={page === Math.ceil(transactions.length / pageSize) - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3 lg:col-span-2">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>
              Breakdown of your expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((cat: any) => {
                const catTotal = expenses
                  .filter((t: any) => t.categoryId === cat.id)
                  .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount)), 0);
                  
                if (catTotal === 0) return null;
                
                const percentage = totalExpense > 0 ? (catTotal / totalExpense) * 100 : 0;
                
                return (
                  <div key={cat.id} className="flex items-center">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none flex items-center">
                        {getCategoryIcon(cat.name)}
                        {cat.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 font-medium text-sm">
                      ₪{catTotal.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

function getCategoryIcon(name: string) {
  const n = name.toLowerCase();
  
  // 5 Core Categories Exact/Fuzzy Matches
  if (n === 'supermarket' || n.includes('grocer') || n.includes('market') || n.includes('food') || n.includes('סופר') || n.includes('מזון')) return <ShoppingCart className="h-3 w-3 mr-1 text-emerald-500" />;
  if (n === 'car' || n.includes('vehicle') || n.includes('gas') || n.includes('transport') || n.includes('רכב') || n.includes('דלק')) return <Car className="h-3 w-3 mr-1 text-blue-500" />;
  if (n === 'housing' || n.includes('hous') || n.includes('rent') || n.includes('mortgage') || n.includes('דיור') || n.includes('שכירות') || n.includes('בית')) return <Home className="h-3 w-3 mr-1 text-indigo-500" />;
  if (n === 'eating out' || n.includes('eating') || n.includes('din') || n.includes('restaurant') || n.includes('מסעד') || n.includes('בחוץ') || n.includes('קפה')) return <Utensils className="h-3 w-3 mr-1 text-orange-500" />;
  if (n === 'health' || n.includes('medic') || n.includes('בריאות') || n.includes('רפוא')) return <HeartPulse className="h-3 w-3 mr-1 text-rose-500" />;
  
  // Other categories
  if (n.includes('util') || n.includes('electric') || n.includes('water') || n.includes('חשמל') || n.includes('מים') || n.includes('תקשורת')) return <Zap className="h-3 w-3 mr-1 text-yellow-500" />;
  if (n.includes('travel') || n.includes('flight') || n.includes('vacation') || n.includes('חופש') || n.includes('נסיעות') || n.includes('טיסות')) return <Bus className="h-3 w-3 mr-1 text-teal-500" />;
  if (n.includes('work') || n.includes('salary') || n.includes('job') || n.includes('משכורת') || n.includes('עבודה')) return <Briefcase className="h-3 w-3 mr-1 text-emerald-600" />;
  if (n.includes('אשראי') || n.includes('credit')) return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1 text-slate-500"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
  if (n.includes('בזבוז') || n.includes('shop') || n.includes('קניות')) return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1 text-purple-500"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
  if (n.includes('בסיס') || n.includes('basic')) return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1 text-cyan-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
  return <HelpCircle className="h-3 w-3 mr-1 text-muted-foreground" />;
}
