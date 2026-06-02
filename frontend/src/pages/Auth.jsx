import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  signInWithPopup, signOut, GoogleAuthProvider,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';
import { IconMapPin, IconArrowLeft, IconSun, IconMoon, IconGoogle } from '../components/icons';
import { cx } from '../components/ui';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/my-trips';
  const { user, login, skipAuthStateChange } = useAuth();

  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);
  useEffect(() => { if (user) navigate(from, { replace: true }); }, [user]);

  const handleGoogleLogin = async () => {
    try {
      setGLoading(true);
      setError('');

      if (mode === 'signup') {
        skipAuthStateChange.current = true;
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        const token = await result.user.getIdToken();

        const resp = await apiClient.post('/auth/firebase-login', {
          firebase_token: token,
          check_only: true,
        });

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
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password must be at least 6 characters.',
      };
      setError(map[err.code] || err.message || 'Authentication failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink relative overflow-hidden flex items-center justify-center px-6">
      <div className="absolute inset-0 hero-grid opacity-40" />
      <div className="absolute inset-0 hero-radial opacity-70" />

      <button onClick={() => setDark(d => !d)}
        className="absolute top-5 right-5 h-9 w-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors z-10"
        aria-label="Toggle dark mode">
        {dark ? <IconSun size={16} /> : <IconMoon size={16} />}
      </button>

      <button onClick={() => navigate('/')}
        className="absolute top-5 left-5 inline-flex items-center gap-1.5 text-white/70 hover:text-white text-[13px] z-10">
        <IconArrowLeft size={14} /> Back to home
      </button>

      <div className="relative w-full max-w-[380px]">
        <div className="bg-white rounded-2xl p-8 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <IconMapPin size={28} className="text-primary" />
            <span className="text-[22px] font-medium tracking-tight text-gray-900">TripPlanner</span>
          </div>

          {/* Mode tabs */}
          <div className="flex items-center gap-1 mt-4 mb-5 p-1 bg-gray-100 rounded-xl">
            {['signin', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                className={cx('flex-1 h-8 rounded-lg text-[13px] font-medium transition-colors',
                  mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                {m === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <button onClick={handleGoogleLogin} disabled={gLoading}
            className="w-full h-11 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 text-[14px] text-gray-900 font-medium disabled:opacity-50">
            <IconGoogle size={18} />
            {gLoading ? 'Loading…' : `Continue with Google`}
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <div className="text-[11px] text-gray-400 tracking-wider uppercase">or</div>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-2.5">
            <input type="email" placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-[14px]" />
            <input type="password" placeholder="Password" value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-[14px]" />
            {error && <p className="text-[12px] text-red-500">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white text-[14px] font-medium transition-colors disabled:opacity-50">
              {loading ? 'Loading…' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-[11px] text-gray-400 text-center leading-relaxed">
            By continuing, you agree to our <a href="#" className="text-primary-dark hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-primary-dark hover:underline">Privacy Policy</a>.
          </p>
        </div>

        <div className="mt-5 text-center text-[12px] text-white/50">
          {mode === 'signup' ? 'Already have an account? ' : 'New here? '}
          <button onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); }}
            className="text-white/70 underline hover:text-white">
            {mode === 'signup' ? 'Sign in' : 'Create one'}
          </button>
        </div>
      </div>
    </div>
  );
}
