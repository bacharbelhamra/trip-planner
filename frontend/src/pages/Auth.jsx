import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  signInWithPopup, signOut, GoogleAuthProvider,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';
import { IconMapPin, IconSun, IconMoon, IconGoogle } from '../components/icons';
import { cx } from '../components/ui';

const REVIEWS = [
  { initials: 'SK', name: 'Sarah K.',  role: 'Solo traveler',    text: '"TripPlanner helped me plan my dream trip to Japan in minutes. The itinerary was spot on!"' },
  { initials: 'MR', name: 'Marc R.',   role: 'Weekend explorer', text: '"I planned a 7-day Rome trip in under 2 minutes. Every hotel and restaurant recommendation was perfect."' },
  { initials: 'AL', name: 'Amina L.',  role: 'Digital nomad',    text: '"The map view is a game changer. I could see every stop plotted before I even left home."' },
  { initials: 'JT', name: 'James T.',  role: 'Family traveler',  text: '"Our family trip to Barcelona was stress-free thanks to TripPlanner. The AI nailed the budget too."' },
  { initials: 'PC', name: 'Priya C.',  role: 'Frequent flyer',   text: '"Compared it to a travel agent and the itinerary was honestly better. Highly recommend!"' },
];

function ReviewCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState('left');

  useEffect(() => {
    const timer = setInterval(() => go('left'), 4000);
    return () => clearInterval(timer);
  }, [current]);

  const go = (dir) => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(c => dir === 'left'
        ? (c + 1) % REVIEWS.length
        : (c - 1 + REVIEWS.length) % REVIEWS.length
      );
      setAnimating(false);
    }, 280);
  };

  const goTo = (i) => {
    if (i === current || animating) return;
    go(i > current ? 'left' : 'right');
  };

  const r = REVIEWS[current];

  return (
    <div className="w-full">
      {/* Card */}
      <div
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5"
        style={{
          transition: 'opacity 0.28s ease, transform 0.28s ease',
          opacity: animating ? 0 : 1,
          transform: animating
            ? `translateX(${direction === 'left' ? '-20px' : '20px'})`
            : 'translateX(0)',
        }}>
        <p className="text-[13px] text-white/80 leading-relaxed min-h-[44px]">
          {r.text}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-[12px] font-semibold select-none shrink-0">
            {r.initials}
          </div>
          <div>
            <div className="text-[13px] text-white font-medium leading-tight">{r.name}</div>
            <div className="text-[11px] text-white/40 mt-0.5">{r.role}</div>
          </div>
        </div>
      </div>

      {/* Dots — below the card, centered */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {REVIEWS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === current ? 18 : 7,
              height: 7,
              borderRadius: 999,
              background: i === current ? '#534AB7' : 'rgba(255,255,255,0.18)',
              transition: 'all 0.25s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/my-trips';
  const { user, login, skipAuthStateChange } = useAuth();

  const [mode, setMode] = useState(location.state?.mode || 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  useEffect(() => { if (user) navigate(from, { replace: true }); }, [user]);

  const switchMode = (m) => { setMode(m); setError(''); };

  const handleGoogleLogin = async () => {
    try {
      setGLoading(true);
      setError('');
      if (mode === 'signup') {
        skipAuthStateChange.current = true;
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        const token = await result.user.getIdToken();
        const resp = await apiClient.post('/auth/firebase-login', { firebase_token: token, check_only: true });
        if (resp.data.user_exists) {
          await signOut(auth);
          skipAuthStateChange.current = false;
          setError('An account with this email already exists. Please sign in instead.');
          setMode('signin');
          setGLoading(false);
          return;
        }
        skipAuthStateChange.current = false;
        await login(result.user);
      } else {
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        await login(result.user);
      }
    } catch (err) {
      skipAuthStateChange.current = false;
      setError(err.message || 'Google sign-in failed');
      setGLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    setError('');
    try {
      let firebaseUser;
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUser = cred.user;
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        firebaseUser = cred.user;
      }
      await login(firebaseUser);
    } catch (err) {
      const map = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/user-not-found':       'No account found with this email.',
        'auth/wrong-password':       'Incorrect password.',
        'auth/invalid-email':        'Invalid email address.',
        'auth/weak-password':        'Password must be at least 6 characters.',
      };
      setError(map[err.code] || err.message || 'Authentication failed.');
      setLoading(false);
    }
  };

  const isSignIn = mode === 'signin';

  const t = dark ? {
    outer:     '#0A0F1E',
    right:     '#0D1122',
    toggle:    'text-white/50 hover:text-white hover:bg-white/10',
    heading:   'text-white',
    sub:       'text-white/45',
    label:     'text-white/70',
    input:     'text-white placeholder:text-white/25 bg-white/5 border-white/10 focus:border-primary/70 focus:ring-primary/40',
    hr:        'bg-white/10',
    orText:    'text-white/30',
    gBtn:      'bg-white/5 hover:bg-white/10 border-white/10 text-white',
    switchP:   'text-white/40',
    switchBtn: 'text-primary hover:text-primary-light',
    terms:     'text-white/25',
    termsA:    'hover:text-white/50 underline',
  } : {
    outer:     '#F0F2FB',
    right:     '#FFFFFF',
    toggle:    'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
    heading:   'text-gray-900',
    sub:       'text-gray-500',
    label:     'text-gray-700',
    input:     'text-gray-900 placeholder:text-gray-400 bg-white border-gray-300 focus:border-primary focus:ring-primary/30',
    hr:        'bg-gray-200',
    orText:    'text-gray-400',
    gBtn:      'bg-white hover:bg-gray-50 border-gray-300 text-gray-700',
    switchP:   'text-gray-500',
    switchBtn: 'text-primary hover:text-primary-dark',
    terms:     'text-gray-400',
    termsA:    'hover:text-gray-600 underline',
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0F1E' }}>

      {/* ── LEFT PANEL — always dark ── */}
      <div className="hidden lg:flex flex-col w-1/2 relative overflow-hidden p-10" style={{ background: '#0A0F1E' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 60% 20%, rgba(83,74,183,0.28) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 hero-grid opacity-30 pointer-events-none" />

        <button onClick={() => navigate('/')} className="relative flex items-center gap-2 w-fit">
          <IconMapPin size={18} className="text-primary" />
          <span className="text-white text-[15px] font-medium tracking-tight">TripPlanner</span>
        </button>

        <div className="relative flex-1 flex flex-col justify-center max-w-[380px]">
          <h1 className="text-[44px] leading-[1.1] tracking-tight">
            <span className="text-white font-extrabold">Plan smarter.</span>
            <br />
            <span className="text-white/60 font-light">Travel better.</span>
          </h1>
          <p className="mt-4 text-[14px] text-white/45 leading-relaxed max-w-[320px]">
            Describe your trip in plain words and get a full day-by-day itinerary — hotels,
            restaurants, and an interactive map — in seconds.
          </p>
        </div>

        <ReviewCarousel />
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 lg:w-1/2 flex flex-col relative transition-colors duration-300"
        style={{ background: t.right }}>

        {/* dark mode toggle */}
        <div className="flex justify-end p-5">
          <button onClick={() => setDark(d => !d)}
            className={cx('h-9 w-9 rounded-lg flex items-center justify-center transition-colors', t.toggle)}
            aria-label="Toggle dark mode">
            {dark ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-8 py-10">
          <div className="w-full max-w-[360px]">

            {/* Heading */}
            <h2 className={cx('text-[26px] font-semibold tracking-tight', t.heading)}>
              {isSignIn ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className={cx('mt-1.5 text-[13px]', t.sub)}>
              {isSignIn
                ? 'Enter your email to sign in to your account.'
                : 'Fill in your details to get started.'}
            </p>

            {/* Email + password form */}
            <form onSubmit={handleEmailSubmit} className="mt-7 space-y-4">
              <div>
                <label className={cx('block text-[12px] font-medium mb-1.5', t.label)}>Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={cx('w-full h-11 px-3 rounded-lg text-[14px] border focus:outline-none focus:ring-1 transition-colors', t.input)}
                />
              </div>
              <div>
                <label className={cx('block text-[12px] font-medium mb-1.5', t.label)}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={cx('w-full h-11 px-3 rounded-lg text-[14px] border focus:outline-none focus:ring-1 transition-colors', t.input)}
                />
              </div>

              {error && <p className="text-[12px] text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-primary hover:bg-primary-dark text-white text-[14px] font-semibold transition-colors disabled:opacity-50">
                {loading ? 'Loading…' : isSignIn ? 'Sign In with Email' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className={cx('flex-1 h-px', t.hr)} />
              <span className={cx('text-[11px] tracking-widest uppercase', t.orText)}>or continue with</span>
              <div className={cx('flex-1 h-px', t.hr)} />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={gLoading}
              className={cx('w-full h-11 rounded-lg border text-[14px] font-medium flex items-center justify-center gap-3 transition-colors disabled:opacity-50', t.gBtn)}>
              <IconGoogle size={18} />
              {gLoading ? 'Loading…' : 'Continue with Google'}
            </button>

            {/* Switch mode */}
            <p className={cx('mt-6 text-center text-[13px]', t.switchP)}>
              {isSignIn ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => switchMode(isSignIn ? 'signup' : 'signin')}
                className={cx('font-medium transition-colors', t.switchBtn)}>
                {isSignIn ? 'Sign up' : 'Sign in'}
              </button>
            </p>

            {/* Terms */}
            <p className={cx('mt-3 text-center text-[11px] leading-relaxed', t.terms)}>
              By continuing, you agree to our{' '}
              <a href="#" className={t.termsA}>Terms</a> and{' '}
              <a href="#" className={t.termsA}>Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
