import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Sidebar } from '@/components/Sidebar';

export const Route = createRootRoute({
  component: AppShell,
});

function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      <Sidebar />
      <main className="flex-1 md:mr-64 pb-20 md:pb-0 px-4 py-6">
        <div className="container mx-auto max-w-4xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
