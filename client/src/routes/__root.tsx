import { createRootRoute, Outlet, Link } from '@tanstack/react-router';
import { Home, Banknote, Settings, PieChart } from 'lucide-react';
import { OTPModal } from '@/components/OTPModal';

export const Route = createRootRoute({
  component: () => (
    <div className="w-full min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
      <OTPModal />
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <Outlet />
      </main>
      
      {/* Mobile-first bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 p-4 pb-6 flex justify-around items-center z-50" dir="rtl">
        <Link to="/" className="[&.active]:text-sky-400 text-slate-400 flex flex-col items-center gap-1 transition-colors [&.active_svg]:fill-current">
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">לוח בקרה</span>
        </Link>
        <Link to="/cash" className="[&.active]:text-sky-400 text-slate-400 flex flex-col items-center gap-1 transition-colors [&.active_svg]:fill-current">
          <Banknote className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">מזומן</span>
        </Link>
        <Link to="/categories" className="[&.active]:text-sky-400 text-slate-400 flex flex-col items-center gap-1 transition-colors [&.active_svg]:fill-current">
          <PieChart className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">תקציבים</span>
        </Link>
        <Link to="/settings" className="[&.active]:text-sky-400 text-slate-400 flex flex-col items-center gap-1 transition-colors [&.active_svg]:fill-current">
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">הגדרות</span>
        </Link>
      </nav>
    </div>
  ),
});
