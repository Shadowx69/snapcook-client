import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Compass, Camera, Calendar, User, Loader } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import BrandMark from './components/BrandMark';
import './App.css';

// Page imports (all at top — fixes hot-reload import order issues)
import Home from './pages/Home';
import Snap from './pages/Snap';
import Search from './pages/Search';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import MealPlanner from './pages/MealPlanner';
import Explore from './pages/Explore';
import CuisinePage from './pages/CuisinePage';
import EditProfile from './pages/settings/EditProfile';
import ChangePassword from './pages/settings/ChangePassword';
import Preferences from './pages/settings/Preferences';
import PrivacyPolicy from './pages/settings/PrivacyPolicy';
import Support from './pages/settings/Support';
import IngredientEditor from './pages/IngredientEditor';

// Paths that don't require authentication
const PUBLIC_PATHS = ['/auth'];
// Paths that hide the top nav bar
const HIDE_TOP_NAV = ['/auth', '/onboarding', '/recipe/', '/cuisine/', '/search', '/settings/', '/snap/ingredients'];
// Paths that hide the bottom nav bar
const HIDE_NAV = ['/auth', '/onboarding', '/recipe/', '/cuisine/', '/settings/', '/snap/ingredients'];

// ── Error Boundary (class component — React requirement) ──────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('SnapCook render error:', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 16, background: 'var(--color-bg)', padding: 24,
        }}>
          <BrandMark size={56} />
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', textAlign: 'center', margin: 0 }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--color-text-2)', textAlign: 'center', fontSize: 'var(--text-sm)', margin: 0 }}>
            Please refresh or go back to the home page.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
            style={{
              padding: '10px 28px', background: 'var(--color-primary)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-xs)', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-base)',
            }}
          >
            Go Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Scroll to top on every route change ──────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// ── Top navigation bar ────────────────────────────────────────────────────────
function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (HIDE_TOP_NAV.some(p => location.pathname.startsWith(p))) return null;

  return (
    <nav className="top-nav">
      <div className="top-nav-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
        <BrandMark size={26} /> SnapCook
      </div>
    </nav>
  );
}

function BottomNav() {
  const location = useLocation();
  if (HIDE_NAV.some(p => location.pathname.startsWith(p))) return null;

  return (
    <nav className="bottom-nav">
      <div className="sidebar-brand" style={{ padding: '0 10px 32px', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
        <BrandMark size={32} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-primary)' }}>SnapCook</span>
      </div>
      <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <HomeIcon size={22} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/explore" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <Compass size={22} />
        <span>Explore</span>
      </NavLink>
      <NavLink to="/snap" className={({ isActive }) => `nav-item nav-snap${isActive ? ' active' : ''}`}>
        <Camera size={22} />
        <span className="nav-snap-text">Snap Ingredients</span>
      </NavLink>
      <NavLink to="/meal-planner" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <Calendar size={22} />
        <span>Plan</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <User size={22} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}

// ── Auth guard — redirects unauthenticated users, handles onboarding ──────────
function AuthGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  const isPublic = PUBLIC_PATHS.some(p => location.pathname.startsWith(p));
  const needsOnboarding =
    user &&
    location.pathname !== '/onboarding' &&
    !user.onboarded;

  // Trigger navigation side-effects
  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) { navigate('/auth', { replace: true }); return; }
    if (user && isPublic) { navigate('/', { replace: true }); return; }
    if (needsOnboarding) { navigate('/onboarding', { replace: true }); }
  }, [user, loading, isPublic, needsOnboarding, navigate]);

  // Show spinner while auth is initialising
  if (loading) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)', flexDirection: 'column', gap: 16,
      }}>
        <BrandMark size={48} />
        <Loader size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Return null (blank) instead of the wrong page while redirect is in-flight.
  // This prevents protected pages from briefly rendering without a user,
  // which would cause API errors and potential white-screen crashes.
  if (!user && !isPublic) return null;
  if (user && isPublic) return null;
  if (needsOnboarding) return null;

  return children;
}

// ── Layout Wrapper ─────────────────────────────────────────────────────────────
function Layout({ children }) {
  const location = useLocation();
  const hideNav = HIDE_NAV.some(p => location.pathname.startsWith(p));

  return (
    <div className={`app-wrapper ${hideNav ? 'no-sidebar' : ''}`}>
      <ScrollToTop />
      <AuthGuard>
        <TopNav />
        <main className="main-content">
          {children}
        </main>
        <BottomNav />
      </AuthGuard>
    </div>
  );
}

// ── Root app ──────────────────────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
          <Router>
            <ErrorBoundary>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/snap" element={<Snap />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/recipes" element={<Recipes />} />
                  <Route path="/recipe/:id" element={<RecipeDetail />} />
                  <Route path="/cuisine/:id" element={<CuisinePage />} />
                  <Route path="/meal-planner" element={<MealPlanner />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/edit-profile" element={<EditProfile />} />
                  <Route path="/settings/change-password" element={<ChangePassword />} />
                  <Route path="/settings/preferences" element={<Preferences />} />
                  <Route path="/settings/privacy" element={<PrivacyPolicy />} />
                  <Route path="/settings/support" element={<Support />} />
                  <Route path="/snap/ingredients" element={<IngredientEditor />} />
                </Routes>
              </Layout>
            </ErrorBoundary>
          </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
