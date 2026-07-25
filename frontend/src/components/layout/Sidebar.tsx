import { NavLink } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Body Composition', href: '/body-composition', icon: '🏋️' },
  { name: 'Workouts', href: '/workouts', icon: '💪' },
  { name: 'Nutrition', href: '/nutrition', icon: '🥗' },
  { name: 'Products', href: '/products', icon: '🛒' },
  { name: 'Profile', href: '/profile', icon: '👤' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-surface-800/80 bg-surface-950/95 backdrop-blur-xl transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="flex h-16 items-center gap-3 border-b border-surface-800/80 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white shadow-lg shadow-brand-600/20">
          P
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-surface-100 animate-fade-in">
            Physiq<span className="text-brand-400">O</span>
          </span>
        )}
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              isActive ? 'nav-link-active' : 'nav-link'
            }
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && (
              <span className="animate-slide-in">{item.name}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Collapse toggle ──────────────────────────────── */}
      <div className="border-t border-surface-800/80 p-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-xl p-2 text-surface-500 transition-colors hover:bg-surface-800 hover:text-surface-300"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`h-5 w-5 transition-transform duration-300 ${
              collapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
