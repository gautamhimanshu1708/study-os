import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Timer, CheckSquare, Flame, User } from 'lucide-react';

const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Home'    },
  { to: '/focus',       icon: Timer,           label: 'Focus'   },
  { to: '/planner',     icon: CheckSquare,     label: 'Planner' },
  { to: '/consistency', icon: Flame,           label: 'Streak'  },
  { to: '/profile',     icon: User,            label: 'Profile' },
];

const BottomNav = () => {
  return (
    <nav className="
      md:hidden fixed bottom-0 inset-x-0 z-50
      bg-surface-primary/95 backdrop-blur-xl
      border-t border-border
      flex items-center justify-around
      px-2 py-2 safe-area-pb
    ">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `
            flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl
            text-[10px] font-medium transition-all duration-200
            ${isActive
              ? 'text-primary-400 bg-primary-500/10'
              : 'text-text-muted hover:text-text-secondary'
            }
          `}
        >
          {({ isActive }) => (
            <>
              <Icon
                size={20}
                className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
              />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
