import { createRootRoute, Outlet, Link } from '@tanstack/react-router';
import { Home, Banknote, CreditCard } from 'lucide-react';
import { OTPModal } from '@/components/OTPModal';

export const Route = createRootRoute({
  component: () => (
    <div className="w-full min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
      <OTPModal />
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <Outlet />
      </main>
      
      {/* Mobile-first bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 p-4 pb-6 flex justify-around items-center z-50">
        <Link to="/" className="[&.active]:text-blue-400 text-slate-400 flex flex-col items-center gap-1 transition-colors">
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Dashboard</span>
        </Link>
        <Link to="/swipe" className="[&.active]:text-pink-500 text-slate-400 flex flex-col items-center gap-1 transition-colors">
          <CreditCard className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Swipe</span>
        </Link>
        <Link to="/cash" className="[&.active]:text-emerald-400 text-slate-400 flex flex-col items-center gap-1 transition-colors">
          <Banknote className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Cash</span>
        </Link>
      </nav>
    </div>
  ),
});
