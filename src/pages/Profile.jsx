import { LogOut, Settings, Flame, UtensilsCrossed, Heart, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import RecipeCard from '../components/RecipeCard';
import StarRating from '../components/StarRating';
import IconTile from '../components/IconTile';
import { PageLoader } from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';
import { useProfile, useActivity, useSavedRecipes } from '../hooks/useProfile';

const TABS = ['Activity', 'Favourites', 'History'];

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('Activity');

  const { data: profileData, loading: profileLoading, error: profileError } = useProfile();
  const { data: activityData, loading: activityLoading } = useActivity();
  const { saved: savedRecipes, loading: savedLoading, toggleSave } = useSavedRecipes();

  const displayName = user?.displayName || 'SnapCook User';
  const displayEmail = user?.email || '';
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const stats = profileData?.stats;

  async function handleLogout() {
    try {
      await logout();
      navigate('/auth', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  if (profileLoading) return <PageLoader />;

  return (
    <div style={{ paddingBottom: 'calc(var(--bottom-nav-h) + 20px)', background: 'var(--color-bg)' }}>

      {/* ── PROFILE HEADER ── */}
      <div className="animate-fadeUp" style={{ background: 'var(--color-surface)', padding: '24px 16px 0', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ 
              width: 72, height: 72, borderRadius: '50%', 
              background: user?.avatarImg ? 'transparent' : (user?.avatarColor || 'linear-gradient(135deg, var(--color-primary), var(--color-accent-2))'), 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: 28, fontWeight: 700, color: '#fff', 
              boxShadow: 'var(--shadow-md)', border: '3px solid var(--color-surface)',
              overflow: 'hidden'
            }}>
              {user?.avatarImg ? (
                <img src={user.avatarImg} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                avatarInitial
              )}
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2 }}>{displayName}</h1>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-3)', marginTop: 2 }}>{displayEmail}</p>
              <button onClick={() => navigate('/settings/edit-profile')} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'var(--font-body)' }}>
                Edit Profile
              </button>
            </div>
          </div>
          <button className="btn-icon" onClick={() => navigate('/settings')}>
            <Settings size={18} />
          </button>
        </div>

        {/* Stats row */}
        {profileError ? (
          <ErrorBanner message="Could not load profile stats." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, marginBottom: 16 }}>
            {[
              { value: stats?.recipiesTried ?? 0, label: 'Tried' },
              { value: stats?.savedRecipes ?? 0, label: 'Favourites' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '10px 4px' }}>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text)' }}>{s.value}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Streak section */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Streak</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
            <IconTile icon={Flame} tint="warning" size={44} iconSize={22} />
            <div>
              <p style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>
                {stats?.streak ?? 0} {(stats?.streak ?? 0) === 1 ? 'Day' : 'Days'}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginTop: 4 }}>
                {(stats?.streak ?? 0) === 0
                  ? 'Cook a recipe today to start your streak.'
                  : "You're on a cooking roll! Keep it up."}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderTop: '1px solid var(--color-border)', marginTop: 4, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: '1 0 auto', padding: '12px 12px', fontSize: 'var(--text-sm)', fontWeight: 600, color: tab === t ? 'var(--color-primary)' : 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer', borderBottom: `2px solid ${tab === t ? 'var(--color-primary)' : 'transparent'}`, transition: 'all 0.15s', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div style={{ padding: '16px', animation: 'fadeUp 0.3s ease' }}>

        {/* ACTIVITY */}
        {tab === 'Activity' && (
          activityLoading ? <PageLoader /> :
          !activityData?.length ? (
            <div className="empty-state">
              <div className="empty-state-icon"><IconTile icon={UtensilsCrossed} size={72} iconSize={36} tint="primary" strokeWidth={1.75} /></div>
              <p style={{ color: 'var(--color-text-3)', fontSize: 'var(--text-sm)' }}>No activity yet. Start cooking!</p>
            </div>
          ) : (
            <div>
              {activityData.map((item, i) => (
                <div key={item._id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: i < activityData.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <IconTile icon={item.action === 'Cooked' ? UtensilsCrossed : Heart} tint={item.action === 'Cooked' ? 'primary' : 'accent'} size={40} iconSize={18} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 2 }}>
                      {item.action} <span style={{ color: 'var(--color-primary)' }}>{item.recipe}</span>
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>{item.date}</p>
                      {item.rating && <StarRating rating={item.rating} size={10} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* FAVOURITES */}
        {tab === 'Favourites' && (
          savedLoading ? <PageLoader /> :
          !savedRecipes?.length ? (
            <div className="empty-state">
              <div className="empty-state-icon"><IconTile icon={Heart} size={72} iconSize={36} tint="accent" strokeWidth={1.75} /></div>
              <p style={{ color: 'var(--color-text-3)', fontSize: 'var(--text-sm)' }}>No favourites yet. Save recipes to find them here.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {savedRecipes.map(r => (
                <RecipeCard key={r._id} recipe={r} saved onSave={() => toggleSave(r._id, true)} />
              ))}
            </div>
          )
        )}

        {/* HISTORY — both fully-cooked and Find-Recipes opens */}
        {tab === 'History' && (() => {
          const historyItems = activityData?.filter(a => a.action === 'Cooked' || a.action === 'Opened') || [];
          if (activityLoading) return <PageLoader />;
          if (!historyItems.length) {
            return (
              <div className="empty-state">
                <div className="empty-state-icon"><IconTile icon={BookOpen} size={72} iconSize={36} tint="neutral" strokeWidth={1.75} /></div>
                <p style={{ color: 'var(--color-text-3)', fontSize: 'var(--text-sm)' }}>No cooking history yet.</p>
              </div>
            );
          }
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {historyItems.map((item, i) => {
                const isCooked = item.action === 'Cooked';
                return (
                  <div key={item._id || i} onClick={() => item.recipeId && navigate(`/recipe/${item.recipeId}`)} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow-sm)', cursor: item.recipeId ? 'pointer' : 'default' }}>
                    <IconTile icon={isCooked ? UtensilsCrossed : BookOpen} tint={isCooked ? 'primary' : 'neutral'} size={40} iconSize={20} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text)', marginBottom: 2 }}>{item.recipe}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>
                        {isCooked ? 'Cooked' : 'Viewed'} · {item.date}
                      </p>
                    </div>
                    {item.rating && <StarRating rating={item.rating} size={13} />}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* ── LOGOUT ── */}
      <div style={{ padding: '8px 16px 0' }}>
        <div style={{ height: 1, background: 'var(--color-border)', marginBottom: 16 }} />
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', padding: '8px 0' }}>
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </div>
  );
}
