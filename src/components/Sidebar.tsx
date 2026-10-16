import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  FileText,
  Bookmark,
  Bell,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

const links = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutGrid, end: true },
  { to: '/dashboard/applications', label: 'My Applications', Icon: FileText, end: false },
  { to: '/dashboard/saved', label: 'Saved Events', Icon: Bookmark, end: false },
  { to: '/dashboard/notifications', label: 'Notifications', Icon: Bell, end: false },
  { to: '/dashboard/profile', label: 'Profile', Icon: User, end: false },
];

export function Sidebar() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-ink-100 bg-white p-4 lg:block">
      <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-ink-50 px-3 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-600 text-white">
          <Sparkles className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink-900">
            {profile?.full_name ?? 'User'}
          </p>
          <p className="text-xs capitalize text-ink-400">{profile?.role ?? 'talent'}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-accent-50 text-accent-700'
                  : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
              }`
            }
          >
            <Icon className="h-4.5 w-4.5" strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleSignOut}
        className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-600 transition-all hover:bg-error-500/10 hover:text-error-500"
      >
        <LogOut className="h-4.5 w-4.5" strokeWidth={2} />
        Logout
      </button>
    </aside>
  );
}
