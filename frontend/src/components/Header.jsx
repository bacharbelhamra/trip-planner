import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { IconMapPin, IconSun, IconMoon } from './icons';
import { cx, Avatar } from './ui';
import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [accountOpen, setAccountOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close dropdowns on route change
  useEffect(() => { setAccountOpen(false); setUserMenuOpen(false); }, [location.pathname]);

  const txtMuted = dark
    ? 'text-white/60 hover:text-white'
    : 'text-gray-500 hover:text-gray-900';
  const bg = dark
    ? 'bg-ink/80 backdrop-blur border-b border-white/5'
    : 'bg-white/95 backdrop-blur border-b border-gray-200';
  const wordmark = dark ? 'text-white' : 'text-primary';
  const pin      = dark ? 'text-white' : 'text-primary';

  const navLink = (label, path) => {
    const active = location.pathname === path;
    return (
      <button onClick={() => navigate(path)}
        className={cx('text-[13px] font-medium transition-colors',
          active ? (dark ? 'text-white' : 'text-gray-900') : txtMuted)}>
        {label}
      </button>
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const goAuth = (mode) => {
    setAccountOpen(false);
    navigate('/auth', { state: { mode } });
  };

  return (
    <header className={cx('sticky top-0 z-40', bg)}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button className="flex items-center gap-2" onClick={() => navigate('/')}>
          <IconMapPin size={18} className={pin} />
          <span className={cx('font-medium text-[15px] tracking-tight', wordmark)}>TripPlanner</span>
        </button>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-7">
          {navLink('Features', '/')}
          {navLink('My Trips', '/my-trips')}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={() => setDark(d => !d)}
            className={cx('h-9 w-9 rounded-lg flex items-center justify-center transition-colors',
              dark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100')}
            aria-label="Toggle dark mode">
            {dark ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>

          {user ? (
            /* Logged-in: clickable avatar with dropdown */
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label="User menu">
                <Avatar name={user.name || user.email} size={32} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-52 rounded-xl overflow-hidden shadow-xl border border-white/10 bg-[#1a1f35] z-50">
                  {/* Email */}
                  <div className="px-4 py-3">
                    <p className="text-[11px] text-white/40 mb-0.5">Signed in as</p>
                    <p className="text-[13px] text-white truncate">{user.email}</p>
                  </div>
                  {/* Divider */}
                  <div className="h-px bg-white/10" />
                  {/* Sign out */}
                  <div className="px-3 pb-3 pt-2">
                    <button
                      onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                      style={{
                        border: '1px solid rgba(239,68,68,0.6)',
                        borderRadius: '8px',
                        background: 'rgba(239,68,68,0.08)',
                        color: '#f87171',
                        padding: '8px 12px',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                        e.currentTarget.style.boxShadow = '0 0 12px rgba(239,68,68,0.25)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged-out: Account dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setAccountOpen(o => !o)}
                className={cx(
                  'flex items-center gap-1.5 h-9 px-3 rounded-lg text-[13px] font-medium transition-colors',
                  dark
                    ? 'text-white border border-white/20 hover:bg-white/10'
                    : 'text-gray-700 border border-gray-300 hover:bg-gray-100'
                )}>
                Account
                {/* chevron */}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                  className={cx('transition-transform duration-150', accountOpen && 'rotate-180')}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-1.5 w-44 rounded-xl overflow-hidden shadow-xl border border-white/10 bg-[#1a1f35] z-50">
                  {/* Header label */}
                  <div className="px-4 py-2.5 text-[11px] font-medium text-white/40 tracking-wide uppercase select-none border-b border-white/10">
                    Account
                  </div>
                  {/* Sign In */}
                  <button
                    onClick={() => goAuth('signin')}
                    className="w-full text-left px-4 py-2.5 text-[14px] text-white hover:bg-white/10 transition-colors">
                    Sign In
                  </button>
                  {/* Sign Up */}
                  <button
                    onClick={() => goAuth('signup')}
                    className="w-full text-left px-4 py-2.5 text-[14px] text-white hover:bg-white/10 transition-colors">
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
