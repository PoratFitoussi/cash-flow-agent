import { Link } from '@tanstack/react-router';
import { Activity, Wallet } from 'lucide-react';

export function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-l bg-card fixed right-0 top-0 h-screen z-40 pt-16">
        <nav className="flex flex-col gap-2 p-4">
          <SidebarLinks />
        </nav>
      </aside>

      {/* Mobile Bottom/Drawer Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full border-t bg-background flex justify-around items-center h-16 z-50 pb-[env(safe-area-inset-bottom)]">
        <SidebarLinks mobile />
      </nav>
    </>
  );
}

function SidebarLinks({ mobile = false }: { mobile?: boolean }) {
  const linkClass = mobile
    ? "flex flex-col items-center gap-1 text-muted-foreground [&.active]:text-primary"
    : "flex items-center gap-3 px-4 py-3 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors [&.active]:bg-primary/10 [&.active]:text-primary [&.active]:font-medium";

  return (
    <>
      <Link to="/home" className={linkClass}>
        <Activity className="h-5 w-5" />
        <span className={mobile ? "text-[10px] font-medium" : "text-sm"}>תזרים חודשי</span>
      </Link>
      <Link to="/balance" className={linkClass}>
        <Wallet className="h-5 w-5" />
        <span className={mobile ? "text-[10px] font-medium" : "text-sm"}>מצב הע״וש</span>
      </Link>
    </>
  );
}
