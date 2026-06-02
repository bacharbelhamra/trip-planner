import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { IconMapPin, IconSun, IconMoon } from './icons';
import { cx, Button, Avatar } from './ui';
import { useState, useEffect } from 'react';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const isDark = location.pathname === '/' || location.pathname === '/auth';
  const route = location.pathname.replace('/', '') || 'home';

  const txtMuted = isDark
    ? 'text-white/60 hover:text-white'
    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100';
  const bg = isDark
    ? 'bg-ink/80 backdrop-blur border-b border-white/5'
    : 'bg-white/80 dark:bg-ink/80 backdrop-blur border-b border-gray-200 dark:border-white/5';
  const wordmark = isDark ? 'text-white' : 'text-primary';
  const pin      = isDark ? 'text-white' : 'text-primary';

  const navLink = (label, path) => {
    const active = location.pathname === path;
    return (
      <button onClick={() => navigate(path)}
        className={cx('text-[13px] font-medium transition-colors',
          active ? (isDark ? 'text-white' : 'text-gray-900 dark:text-white') : txtMuted)}>
        {label}
      </button>
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className={cx('sticky top-0 z-40', bg)}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button className="flex items-center gap-2" onClick={() => navigate('/')}>
          <IconMapPin size={18} className={pin} />
          <span className={cx('font-medium text-[15px] tracking-tight', wordmark)}>TripPlanner</span>
        </button>

        <nav className="hidden md:flex items-center gap-7">
          {navLink('Features', '/')}
          {navLink('My Trips', '/my-trips')}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark(d => !d)}
            className={cx('h-9 w-9 rounded-lg flex items-center justify-center transition-colors',
              isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10')}
            aria-label="Toggle dark mode">
            {dark ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <Avatar name={user.name || user.email} size={32} />
              <button onClick={handleLogout}
                className={cx('text-[13px]', isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-700')}>
                Sign out
              </button>
            </div>
          ) : (
            <Button variant={isDark ? 'outlineWhite' : 'outline'} size="sm" onClick={() => navigate('/auth')}>
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
