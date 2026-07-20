import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  BookOpen,
  Target,
  FileText,
  CalendarClock,
  Flame,
  BarChart2,
  Settings,
  LogOut,
  Zap,
  User,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/focus',       icon: Timer,           label: 'Focus Timer' },
  { to: '/planner',     icon: CheckSquare,     label: 'Planner'     },
  { to: '/courses',     icon: BookOpen,        label: 'Courses'     },
  { to: '/goals',       icon: Target,          label: 'Goals'       },
  { to: '/notes',       icon: FileText,        label: 'Notes'       },
  { to: '/deadlines',   icon: CalendarClock,   label: 'Deadlines'   },
  { to: '/consistency', icon: Flame,           label: 'Consistency' },
  { to: '/analytics',   icon: BarChart2,       label: 'Analytics'   },
];

const bottomItems = [
  { to: '/profile',  icon: User,     label: 'Profile'  },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const avatarColors = [
  'from-violet-500 to-indigo-500',
  'from-cyan-500 to-blue-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
];

const getAvatarColor = (name = '') => {
  const idx = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
};

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

const THEME_OPTIONS = [
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'system', icon: Monitor, label: 'System' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <aside className="
      hidden md:flex flex-col
      w-60 shrink-0 h-screen sticky top-0
      bg-sidebar backdrop-blur-xl
      border-r border-border
      px-3 py-5 overflow-y-auto
    ">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow-sm">
          <Zap size={16} className="text-white" />
        </div>
        <span className="text-lg font-bold text-gradient">StudyOS</span>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
          Main Menu
        </p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Theme Switcher */}
      <div className="px-2 mb-3">
        <p className="px-1 mb-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
          Theme
        </p>
        <div className="flex gap-1 p-1 bg-surface-secondary rounded-xl border border-border">
          {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                theme === value
                  ? 'bg-primary-500/20 text-primary-400 shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title={label}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom section */}
      <div className="space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
          Account
        </p>
        {bottomItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} className="shrink-0" />
            {label}
          </NavLink>
        ))}

        <button
          onClick={logout}
          className="nav-link w-full text-left hover:bg-danger/10 hover:text-danger group"
        >
          <LogOut size={18} className="shrink-0 group-hover:text-danger" />
          Logout
        </button>
      </div>

      {/* User card */}
      <div className="mt-3 pt-3 border-t border-border">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(user?.name)} flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-glow-sm`}>
            {getInitials(user?.name)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-text-primary truncate">{user?.name}</p>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
          </div>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
