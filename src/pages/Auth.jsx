import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Eye, EyeOff, Loader } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import BrandMark from '../components/BrandMark';

export default function Auth() {
  const [view, setView] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle } = useAuth();

  function afterAuth() {
    navigate('/', { replace: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (view === 'signup') {
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
      afterAuth();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setBusy(true);
      try {
        await loginWithGoogle(tokenResponse.access_token);
        afterAuth();
      } catch (err) {
        setError(err.message || 'Google sign-in failed. Please try again.');
      } finally {
        setBusy(false);
      }
    },
    onError: () => setError('Google sign-in failed. Please try again.'),
  });

  function switchView(v) {
    setView(v);
    setError('');
  }

  const titles = { login: 'Welcome back', signup: 'Create account' };
  const subtitles = {
    login: 'Sign in to your SnapCook account',
    signup: 'Join thousands of home cooks',
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--color-bg)',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* Brand */}
      <div style={{ padding: '32px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <BrandMark size={56} style={{ marginBottom: 12 }} />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4 }}>SnapCook</h1>
        <p style={{ color: 'var(--color-text-3)', fontSize: 'var(--text-sm)' }}>Snap. Cook. Enjoy.</p>
      </div>

      {/* Card */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px 24px 40px' }}>
        <div style={{ width: '100%', maxWidth: 420, background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: '28px 24px', boxShadow: 'var(--shadow-md)', animation: 'scaleIn 0.3s ease' }}>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 4, color: 'var(--color-text)' }}>
            {titles[view]}
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)', marginBottom: 24 }}>{subtitles[view]}</p>

          {error && (
            <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid #dc2626', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16, fontSize: 'var(--text-sm)', color: '#dc2626', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {view === 'signup' && (
              <div className="input-wrap">
                <User size={16} className="input-icon" />
                <input className="input input-with-icon" type="text" placeholder="Full Name" required value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}

            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input className="input input-with-icon" type="email" placeholder="Email address" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                className="input input-with-icon"
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)', display: 'flex' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={busy} style={{ width: '100%', marginTop: 8, opacity: busy ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {busy && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {view === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', fontWeight: 500 }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          </div>

          <button
            onClick={() => googleLogin()}
            disabled={busy}
            style={{
              width: '100%', padding: '12px',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--color-border)',
              background: 'var(--color-surface)',
              fontSize: 'var(--text-sm)', fontWeight: 600,
              color: 'var(--color-text)',
              cursor: busy ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'background 0.15s',
              opacity: busy ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
            onMouseEnter={e => !busy && (e.currentTarget.style.background = 'var(--color-surface-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-surface)')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-2)', marginTop: 20 }}>
            {view === 'login' && <>Don't have an account? <button onClick={() => switchView('signup')} style={{ color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'inherit' }}>Sign Up</button></>}
            {view === 'signup' && <>Already have an account? <button onClick={() => switchView('login')} style={{ color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'inherit' }}>Sign In</button></>}
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes scaleIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
