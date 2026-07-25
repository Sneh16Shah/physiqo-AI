import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { NotificationBell } from '../../features/notifications/NotificationBell';

/**
 * Top-level application shell.
 * Provides the sidebar navigation and a scrollable main content area.
 */
export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-950">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

      {/* Main content — offset by sidebar width */}
      <main
        className={`flex-1 transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? 'ml-[72px]' : 'ml-64'
        }`}
      >
        <header className="h-16 border-b border-surface-800/80 bg-surface-950/95 backdrop-blur-xl flex items-center justify-end px-6 sticky top-0 z-30">
          <NotificationBell />
        </header>
        <div className="mx-auto max-w-7xl px-6 py-8 w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
