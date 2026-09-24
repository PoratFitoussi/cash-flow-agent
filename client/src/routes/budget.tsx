import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTransactions, useRunway } from '@/features/transactions/useTransactions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pie, PieChart, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const Route = createFileRoute('/budget')({
  component: BudgetPage,
});

function BudgetPage() {
  const currentDate = new Date();
  const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [period, setPeriod] = useState(currentPeriod);

  const monthOptions = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    return { val, label };
  });

  const { data: transactions = [], isLoading } = useTransactions({ period });
  const { data: runway } = useRunway();

  // Compute days left in the selected month
  const [yearStr, monthStr] = period.split('-');
  const selectedYear = parseInt(yearStr, 10);
  const selectedMonth = parseInt(monthStr, 10) - 1;
  const isCurrentMonth = currentDate.getFullYear() === selectedYear && currentDate.getMonth() === selectedMonth;
  
  let daysLeft = 0;
  if (isCurrentMonth) {
    const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    daysLeft = lastDayOfMonth - currentDate.getDate();
  }

  // ----------------------------------------------------
  // Level 1: Core Household Baseline
  // ----------------------------------------------------
  const targetIncome = 27000;
  
  const primarySavings = 15000;
  const kindergarten = 3600;
  const rent = 3000;
  const travelBudget = 1500;
  const totalCoreCommitted = primarySavings + kindergarten + rent + travelBudget;
  const targetBuffer = targetIncome - totalCoreCommitted; // 3900

  // ----------------------------------------------------
  // Level 2: The 3,900 Buffer Sub-Budget
  // ----------------------------------------------------
  const gasFuel = 1000;
  const health = 400;
  const arnona = 330;
  const publicTransport = 330;
  const electricity = 200;
  const vaadBayit = 120;
  const homeInternet = 80;
  const phones = 65;
  const totalBufferNeeds = gasFuel + health + arnona + publicTransport + electricity + vaadBayit + homeInternet + phones; // 2525
  const leftoverPocketMoney = targetBuffer - totalBufferNeeds; // 1375

  // ----------------------------------------------------
  // Actual Spending vs Pocket Money
  // ----------------------------------------------------
  // Find transactions that hit the flexible pocket money.
  // This excludes anything explicitly mapped to the core or sub-budget needs.
  // (In a real scenario, we'd map this via category IDs or tags, but we'll approximate for the UI).
  const excludedKeywords = ['rent', 'kindergarten', 'gas', 'fuel', 'health', 'arnona', 'transport', 'train', 'bus', 'electricity', 'vaad', 'internet', 'phone', 'cellcom', 'partner', 'investment'];
  
  const actualFlexibleExpenses = transactions.filter((t: any) => {
    if (t.type !== 'EXPENSE') return false;
    const m = (t.merchant || '').toLowerCase();
    return !excludedKeywords.some(keyword => m.includes(keyword));
  });
  
  const spentPocketMoney = actualFlexibleExpenses.reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount)), 0);
  const remainingPocketMoney = leftoverPocketMoney - spentPocketMoney;

  // Pie Chart Data
  const bufferChartData = [
    { name: "Pocket Money", value: leftoverPocketMoney, fill: "var(--color-pocket)" },
    { name: "Gas / Fuel", value: gasFuel, fill: "var(--color-gas)" },
    { name: "Health Expenses", value: health, fill: "var(--color-health)" },
    { name: "Property Tax", value: arnona, fill: "var(--color-arnona)" },
    { name: "Public Transport", value: publicTransport, fill: "var(--color-transport)" },
    { name: "Electricity", value: electricity, fill: "var(--color-electricity)" },
    { name: "House Committee", value: vaadBayit, fill: "var(--color-vaad)" },
    { name: "Home Internet", value: homeInternet, fill: "var(--color-internet)" },
    { name: "Phones Internet", value: phones, fill: "var(--color-phones)" },
  ];

  const bufferChartConfig = {
    pocket: { label: "Pocket Money", color: "#60a5fa" }, // vibrant blue
    gas: { label: "Gas / Fuel", color: "#fcd34d" }, // bright yellow
    health: { label: "Health Expenses", color: "#f472b6" }, // bright pink
    arnona: { label: "Property Tax", color: "#fbcfe8" }, // light pink
    transport: { label: "Public Transport", color: "#bfdbfe" }, // light blue
    electricity: { label: "Electricity", color: "#fef3c7" }, // cream
    vaad: { label: "House Committee", color: "#f97316" }, // orange
    internet: { label: "Home Internet", color: "#9ca3af" }, // grey
    phones: { label: "Phones", color: "#4ade80" }, // green
  } satisfies ChartConfig;

  // Progress Bar Logic (Tracking the 1,375 Pocket Money)
  const progressPercent = leftoverPocketMoney > 0 ? Math.min((spentPocketMoney / leftoverPocketMoney) * 100, 100) : 100;
  
  const getProgressColor = () => {
    if (progressPercent >= 100) return 'from-rose-500 via-rose-400 to-rose-300';
    if (progressPercent >= 85) return 'from-amber-500 via-amber-400 to-amber-300';
    return 'from-emerald-500 via-emerald-400 to-emerald-300';
  };

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flexible Pocket Money</h1>
          <p className="text-muted-foreground">Tracking your ₪1,375 ultimate flexible living cash.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(opt => (
                <SelectItem key={opt.val} value={opt.val}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Runway Widget */}
      {runway && (
        <div className="flex items-center gap-4 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg w-fit text-sm font-medium">
          <span className="flex items-center gap-2">
            🚀 <span>Runway: <strong>{runway.runwayDays} days</strong></span>
          </span>
          <span className="opacity-50">|</span>
          <span>Burn Rate: ₪{Math.round(runway.dailyBurnRate).toLocaleString()}/day</span>
        </div>
      )}

      {/* Main Pocket Money Card */}
      <Card className="overflow-hidden border-0 ring-1 ring-white/10 bg-gradient-to-br from-card to-card/50 shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-muted-foreground">Leftover Pocket Money (Weekly: ₪{(leftoverPocketMoney/4).toFixed(0)})</CardTitle>
          <div className="text-5xl font-extrabold tracking-tight mt-2 text-foreground flex items-center gap-4">
            ₪{leftoverPocketMoney.toLocaleString()}
            {isLoading && <span className="text-sm text-muted-foreground animate-pulse font-normal">(loading...)</span>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end mb-3 text-sm">
            <div className="flex gap-4">
              <span className="font-semibold text-rose-400">₪{spentPocketMoney.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} spent</span>
              <span className={`font-semibold ${remainingPocketMoney < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                ₪{remainingPocketMoney.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining
              </span>
            </div>
            <span className="text-muted-foreground font-medium">{daysLeft} days left</span>
          </div>
          
          <div className="h-4 w-full bg-secondary/50 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-1000 ease-out relative`}
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Breakdown Layer 1 - Top Level Math */}
        <Card>
          <CardHeader>
            <CardTitle>Top-Level Cash Flow</CardTitle>
            <CardDescription>Based on ₪27,000 baseline income</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📈</span>
                  <div className="flex flex-col">
                    <span className="font-medium">Primary Savings</span>
                    <span className="text-xs text-muted-foreground">Core 55.6% savings goal.</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-emerald-400">
                  <span className="font-medium">−₪{primarySavings.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-xl">👶</span>
                  <div className="flex flex-col">
                    <span className="font-medium">Kindergarten</span>
                    <span className="text-xs text-muted-foreground">Child education.</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-rose-400">
                  <span className="font-medium">−₪{kindergarten.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🏠</span>
                  <div className="flex flex-col">
                    <span className="font-medium">Rent</span>
                    <span className="text-xs text-muted-foreground">Fixed housing cost.</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-rose-400">
                  <span className="font-medium">−₪{rent.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-xl">✈️</span>
                  <div className="flex flex-col">
                    <span className="font-medium">Travel Budget</span>
                    <span className="text-xs text-muted-foreground">Dedicated travel fund.</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-emerald-400">
                  <span className="font-medium">−₪{travelBudget.toLocaleString()}</span>
                </div>
              </div>
              <div className="h-px bg-border my-2"></div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30 border border-primary/20">
                <div className="flex items-center gap-3">
                  <span className="text-xl">💡</span>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">Leftover Buffer</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-primary">
                  <span className="font-bold text-lg">₪{targetBuffer.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown Layer 2 - The 3,900 Buffer */}
        <Card>
          <CardHeader>
            <CardTitle>The ₪3,900 Buffer Breakdown</CardTitle>
            <CardDescription>Complete Breakdown of the 3,900 Monthly Buffer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 group">
                <span>⛽ Gas / Fuel</span>
                <span className="text-rose-400">−₪{gasFuel.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 group">
                <span>🏥 Health Expenses</span>
                <span className="text-rose-400">−₪{health.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 group">
                <span>🏛️ Property Tax (Arnona)</span>
                <span className="text-rose-400">−₪{arnona.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 group">
                <span>🚌 Public Transport</span>
                <span className="text-rose-400">−₪{publicTransport.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 group">
                <span>⚡ Electricity</span>
                <span className="text-rose-400">−₪{electricity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 group">
                <span>🏢 House Committee</span>
                <span className="text-rose-400">−₪{vaadBayit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 group">
                <span>🌐 Home Internet</span>
                <span className="text-rose-400">−₪{homeInternet.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 group">
                <span>📱 Phones Internet</span>
                <span className="text-rose-400">−₪{phones.toLocaleString()}</span>
              </div>
              
              <div className="h-px bg-border my-2"></div>
              <div className="flex justify-between items-center p-2 font-bold text-base bg-primary/10 rounded-lg text-primary">
                <span>✨ Pocket Money</span>
                <span>₪{leftoverPocketMoney.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Width Pie Chart Card */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Complete Breakdown of the 3,900 Monthly Buffer</CardTitle>
          <CardDescription>Visual representation of your fixed utility vs flexible spending allocations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center pb-4">
            <ChartContainer config={bufferChartConfig} className="w-full max-w-2xl aspect-square max-h-[500px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <ChartLegend
                  content={<ChartLegendContent />}
                  verticalAlign="top"
                  className="flex-wrap gap-4 text-sm mb-8 pb-4"
                />
                <Pie
                  data={bufferChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={160}
                  strokeWidth={2}
                  stroke="var(--background)"
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
                    if (percent < 0.05) return null;
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    
                    let shortName = name;
                    if (name === "Pocket Money") shortName = "Pocket $";
                    if (name === "Gas / Fuel") shortName = "Gas";
                    
                    return (
                      <text x={x} y={y} fill="#111" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold tracking-tight">
                        <tspan x={x} dy="-0.5em">{shortName}</tspan>
                        <tspan x={x} dy="1.2em">₪{value.toLocaleString()} ({(percent * 100).toFixed(1)}%)</tspan>
                      </text>
                    );
                  }}
                />
              </PieChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
