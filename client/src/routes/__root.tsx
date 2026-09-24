import { createRootRoute, Outlet, Link } from '@tanstack/react-router';
import { Activity, LayoutDashboard, Settings, PieChart } from 'lucide-react';

export const Route = createRootRoute({
  component: AppShell,
});

function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans pb-16 md:pb-0">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-lg">
              <Activity className="h-5 w-5 text-primary" />
              <span>CashFlow</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link to="/" className="transition-colors hover:text-foreground/80 text-foreground/60 [&.active]:text-foreground">
                Dashboard
              </Link>
              <Link to="/transactions" className="transition-colors hover:text-foreground/80 text-foreground/60 [&.active]:text-foreground">
                Transactions
              </Link>
              <Link to="/budget" className="transition-colors hover:text-foreground/80 text-foreground/60 [&.active]:text-foreground">
                Budget
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full border-t bg-background flex justify-around items-center h-16 z-50 pb-[env(safe-area-inset-bottom)]">
        <Link to="/" className="flex flex-col items-center gap-1 text-muted-foreground [&.active]:text-primary">
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/transactions" className="flex flex-col items-center gap-1 text-muted-foreground [&.active]:text-primary">
          <Activity className="h-5 w-5" />
          <span className="text-[10px] font-medium">Txns</span>
        </Link>
        <Link to="/budget" className="flex flex-col items-center gap-1 text-muted-foreground [&.active]:text-primary">
          <PieChart className="h-5 w-5" />
          <span className="text-[10px] font-medium">Budget</span>
        </Link>
      </nav>
    </div>
  );
}
