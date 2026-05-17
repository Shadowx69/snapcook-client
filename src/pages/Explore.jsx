import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon, TrendingUp,
  Zap, Timer, Salad, Puzzle, CookingPot, Globe2, BookOpen,
} from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import Toast from '../components/Toast';
import IconTile from '../components/IconTile';
import { PageLoader } from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';
import { useCuisines } from '../hooks/useCuisine';
import { useCollections } from '../hooks/useCollections';
import { useRecipes } from '../hooks/useRecipes';
import { getCollectionIcon } from '../icons/cuisineIcon';

const quickPicks = [
  { label: 'Under 20 min', icon: Timer, tint: 'warning', params: { maxTime: 20 } },
  { label: 'Under 500 kcal', icon: Salad, tint: 'success', params: { maxCal: 500 } },
  { label: '5 ingredients', icon: Puzzle, tint: 'primary', params: { maxIngredients: 5 } },
  { label: 'One pot meals', icon: CookingPot, tint: 'accent', params: { tag: 'one-pot' } },
];

export default function Explore() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const { data: cuisines, loading: cuisinesLoading, error: cuisinesError, refetch: refetchCuisines } = useCuisines();
  const { data: collectionsData } = useCollections();
  const { data: trending, loading: trendingLoading } = useRecipes({ sort: 'reviewCount', limit: 4 });

  const isLoading = cuisinesLoading && trendingLoading;
  if (isLoading) return <PageLoader />;

  return (
    <div style={{ paddingBottom: 'calc(var(--bottom-nav-h) + 20px)' }}>

      {/* ── STICKY SEARCH + DIET FILTER ── */}
      <div style={{
        position: 'sticky', top: 60, zIndex: 10,
        background: 'var(--color-bg)',
        borderBottom: 'none',
        padding: '12px 16px 0',
      }}>
        <div
          onClick={() => navigate('/search')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', padding: '11px 16px', cursor: 'pointer', marginBottom: 12, boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.15s, border-color 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
        >
          <SearchIcon size={16} color="var(--color-text-3)" />
          <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-3)', fontFamily: 'var(--font-body)' }}>
            Search cuisines &amp; recipes…
          </span>
        </div>
      </div>

      <div style={{ padding: '20px 16px 0' }}>

        {/* ── CUISINES GRID ── */}
        <div className="animate-fadeUp" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe2 size={18} color="var(--color-primary)" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>Cuisines</h2>
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>{cuisines?.length ?? 0} cuisines</span>
          </div>
          {cuisinesError ? (
            <ErrorBanner message="Could not load cuisines." onRetry={refetchCuisines} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
              {(cuisines || []).map((c, i) => (
                <div key={c.id} onClick={() => navigate(`/cuisine/${c.id}`)} className="animate-fadeUp"
                  style={{ animationDelay: `${i * 0.04}s`, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: c.gradient, cursor: 'pointer', aspectRatio: '1 / 1', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                >
                  {c.image && <img src={c.image} alt={c.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 8px' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', fontSize: 'var(--text-xs)', lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>{c.label}</p>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 9, marginTop: 1 }}>{c.count ?? 0} recipes</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── POPULAR COLLECTIONS ── */}
        {collectionsData?.length > 0 && (
          <div className="animate-fadeUp delay-1" style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={18} color="var(--color-primary)" />
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>Collections</h2>
              </div>
            </div>
            <div className="scroll-row" style={{ gap: 10 }}>
              {collectionsData.map(col => (
                <div key={col.id} onClick={() => navigate(`/recipes?collection=${col.id}`)}
                  style={{ flexShrink: 0, width: 130, background: col.color, borderRadius: 'var(--radius-md)', padding: '16px 14px', cursor: 'pointer', border: '1px solid var(--color-border)', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                >
                  {(() => { const ColIcon = getCollectionIcon(col.id); return <ColIcon size={28} strokeWidth={2} color="#fff" style={{ marginBottom: 10 }} />; })()}
                  <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: '#fff', lineHeight: 1.3, fontFamily: 'var(--font-body)' }}>{col.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── QUICK PICKS ── */}
        <div className="animate-fadeUp delay-2" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Zap size={18} color="var(--color-primary)" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>Quick Picks</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            {quickPicks.map(p => (
              <div key={p.label} onClick={() => navigate(`/recipes?${new URLSearchParams(Object.fromEntries(Object.entries(p.params).map(([k, v]) => [k, String(v)]))).toString()}`)}
                style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: '18px 14px', cursor: 'pointer', border: '1px solid var(--color-border)', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: 'var(--shadow-sm)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                <IconTile icon={p.icon} tint={p.tint} size={48} iconSize={24} style={{ marginBottom: 10 }} />
                <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>{p.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── TRENDING THIS WEEK ── */}
        <div className="animate-fadeUp delay-3" style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <TrendingUp size={16} color="var(--color-primary)" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>Trending This Week</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!trendingLoading && (trending || []).map((r, i) => (
              <div key={r._id} className="animate-fadeUp" style={{ animationDelay: `${i * 0.05}s` }}>
                <RecipeCard recipe={r} variant="list" onSave={() => setToast('Recipe saved')} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
