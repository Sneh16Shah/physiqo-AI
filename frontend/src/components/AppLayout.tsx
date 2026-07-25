import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { NotificationBell } from '../features/notifications/NotificationBell';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { logout, user } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Body Comp', path: '/body-composition' },
    { name: 'Workouts', path: '/workouts' },
    { name: 'Nutrition', path: '/nutrition' },
    { name: 'Products', path: '/products' },
  ];

  return (
    <div className="flex h-screen bg-surface-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-900 border-r border-surface-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-brand-500">PhysiqO</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`block px-4 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:bg-surface-800 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-surface-800">
          <Link
            to="/profile"
            className="flex items-center space-x-3 mb-4 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <div className="w-8 h-8 bg-surface-800 rounded-full flex items-center justify-center">
              {user?.name?.[0] || 'U'}
            </div>
            <span className="truncate">{user?.name || 'Profile'}</span>
          </Link>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 text-red-500 hover:bg-surface-800 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="h-16 border-b border-surface-800 bg-surface-950/95 backdrop-blur-xl flex items-center justify-end px-6 sticky top-0 z-30 shrink-0">
          <NotificationBell />
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
