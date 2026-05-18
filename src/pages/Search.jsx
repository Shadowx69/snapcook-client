import { useState, useEffect, useRef, useCallback } from 'react';
import { Search as SearchIcon, X, Clock, ChevronRight, ArrowUpRight, ArrowLeft, List, LayoutGrid, SearchX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import IconTile from '../components/IconTile';
import Toast from '../components/Toast';
import Spinner from '../components/Spinner';
import { useRecipeSearch } from '../hooks/useRecipes';
import { useCuisines } from '../hooks/useCuisine';
import { getCuisineIcon } from '../icons/cuisineIcon';

const STORAGE_KEY = 'snapcook_recent_searches';
const MAX_RECENT = 8;

const trendingTags = [
  { label: '#QuickMeals',  query: 'quick' },
  { label: '#HighProtein', query: 'protein' },
  { label: '#Comfort',     query: 'comfort' },
  { label: '#Vegan',       query: 'vegan' },
  { label: '#Pakistani',   query: 'pakistani' },
  { label: '#Pasta',       query: 'pasta' },
  { label: '#Biryani',     query: 'biryani' },
  { label: '#Budget',      query: 'budget' },
];

const sortOptions = [
  { id: 'relevant', label: 'Best Match' },
  { id: 'rating',   label: 'Top Rated' },
  { id: 'time',     label: 'Fastest' },
  { id: 'calories', label: 'Fewest Cal' },
];

const categoryChips = [
  { id: 'all',       label: 'All' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch',     label: 'Lunch' },
  { id: 'dinner',    label: 'Dinner' },
  { id: 'snacks',    label: 'Snacks' },
  { id: 'desserts',  label: 'Desserts' },
];

function loadRecent() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveRecent(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function Search() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sort, setSort] = useState('relevant');
  const [category, setCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [recentSearches, setRecentSearches] = useState(loadRecent);
  const [toast, setToast] = useState(null);

  const { results, loading: searchLoading, search } = useRecipeSearch();
  const { data: cuisines } = useCuisines();

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery) {
      const filters = {
        sort,
        ...(category !== 'all' && { category }),
      };
      search(debouncedQuery, filters);
    }
  }, [debouncedQuery, sort, category, search]);

  const commitSearch = useCallback((q) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const next = [trimmed, ...prev.filter(s => s !== trimmed)].slice(0, MAX_RECENT);
      saveRecent(next);
      return next;
    });
  }, []);

  function applyQuery(q) {
    setQuery(q);
    commitSearch(q);
    inputRef.current?.blur();
  }

  function removeRecent(item) {
    setRecentSearches(prev => {
      const next = prev.filter(s => s !== item);
      saveRecent(next);
      return next;
    });
  }

  function clearAllRecent() {
    setRecentSearches([]);
    saveRecent([]);
  }

  const isSearching = query.length > 0;
  const hasResults = results.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: 'calc(var(--bottom-nav-h) + 20px)' }}>

      {/* ── STICKY HEADER + SEARCH BAR ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}>
          <button onClick={() => navigate(-1)} style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-2)' }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ position: 'relative', flex: 1 }}>
            <SearchIcon size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)', pointerEvents: 'none' }} />
            <input
              ref={inputRef}
              className="input input-with-icon"
              type="text"
              placeholder="Search recipes, cuisines, ingredients…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && commitSearch(query)}
              style={{ borderRadius: 'var(--radius-xs)', paddingRight: query ? 44 : 16 }}
            />
            {query ? (
              <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
                <X size={16} />
              </button>
            ) : null}
          </div>
        </div>

        {isSearching && (hasResults || searchLoading) && (
          <div className="scroll-row" style={{ padding: '0 16px 10px', gap: 6 }}>
            {categoryChips.map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)} className={`pill-toggle${category === c.id ? ' active' : ''}`} style={{ fontSize: 'var(--text-xs)' }}>
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── NO QUERY — SUGGESTIONS VIEW ── */}
      {!isSearching && (
        <div style={{ padding: '16px 16px 0' }}>
          {recentSearches.length > 0 && (
            <div className="animate-fadeUp" style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} color="var(--color-text-3)" />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent</span>
                </div>
                <button onClick={clearAllRecent} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  Clear all
                </button>
              </div>
              <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                {recentSearches.map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', borderBottom: i < recentSearches.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <button onClick={() => applyQuery(s)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', fontSize: 'var(--text-base)', textAlign: 'left', fontFamily: 'var(--font-body)' }}>
                      <Clock size={13} color="var(--color-text-3)" style={{ flexShrink: 0 }} />
                      <span style={{ flex: 1 }}>{s}</span>
                      <ArrowUpRight size={13} color="var(--color-text-3)" style={{ flexShrink: 0 }} />
                    </button>
                    <button onClick={() => removeRecent(s)} style={{ padding: '13px 14px 13px 0', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)', display: 'flex' }} aria-label={`Remove ${s}`}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cuisines?.length > 0 && (
            <div className="animate-fadeUp delay-1" style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Browse by Cuisine</span>
                <button onClick={() => navigate('/explore')} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 2 }}>
                  See all <ChevronRight size={12} />
                </button>
              </div>
              <div className="scroll-row" style={{ gap: 10 }}>
                {cuisines.slice(0, 6).map(c => (
                  <div key={c.id} onClick={() => navigate(`/cuisine/${c.id}`)} style={{ flexShrink: 0, width: 90, height: 90, borderRadius: 'var(--radius-md)', background: c.gradient, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s', overflow: 'hidden', position: 'relative' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = ''}
                  >
                    {c.image && <img src={c.image} alt={c.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
                    {(() => { const Icon = getCuisineIcon(c.id); return <Icon size={24} color="#fff" strokeWidth={2} style={{ position: 'relative' }} />; })()}
                    <span style={{ position: 'relative', fontSize: 10, fontWeight: 600, color: '#fff', textAlign: 'center' }}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SEARCH RESULTS ── */}
      {isSearching && (
        <div style={{ padding: '16px 16px 0' }}>
          {hasResults ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {searchLoading
                    ? <><Spinner size={14} /> Searching…</>
                    : <>{results.length} result{results.length !== 1 ? 's' : ''}</>}
                </span>
                <button onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')} style={{ padding: '6px 10px', borderRadius: 'var(--radius-xs)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-2)', cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {viewMode === 'grid' ? <><List size={13} /> List</> : <><LayoutGrid size={13} /> Grid</>}
                </button>
              </div>
              <div className="scroll-row" style={{ marginBottom: 16, gap: 6 }}>
                {sortOptions.map(s => (
                  <button key={s.id} onClick={() => setSort(s.id)} className={`pill-toggle${sort === s.id ? ' active' : ''}`} style={{ fontSize: 'var(--text-xs)' }}>
                    {s.label}
                  </button>
                ))}
              </div>
              <div style={{ opacity: searchLoading ? 0.55 : 1, transition: 'opacity 0.2s' }}>
                {viewMode === 'grid' ? (
                  <div className="recipe-grid">
                    {results.map((r, i) => <div key={r._id || i} className="animate-fadeUp" style={{ animationDelay: `${i * 0.04}s` }}><RecipeCard recipe={r} variant="grid" onSave={(id, isSaved) => setToast(isSaved ? 'Added to Favourites' : 'Removed from Favourites')} /></div>)}
                  </div>
                ) : (
                  <div className="recipe-list">
                    {results.map((r, i) => <div key={r._id || i} className="animate-fadeUp" style={{ animationDelay: `${i * 0.04}s` }}><RecipeCard recipe={r} variant="list" onSave={(id, isSaved) => setToast(isSaved ? 'Added to Favourites' : 'Removed from Favourites')} /></div>)}
                  </div>
                )}
              </div>
            </>
          ) : searchLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '56px 0' }}>
              <Spinner size={28} />
            </div>
          ) : (
            <div className="empty-state animate-fadeUp">
              <div className="empty-state-icon"><IconTile icon={SearchX} size={72} iconSize={36} tint="neutral" strokeWidth={1.75} /></div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>
                No results for &ldquo;{query}&rdquo;
              </h3>
              <p style={{ color: 'var(--color-text-3)', fontSize: 'var(--text-sm)', marginBottom: 16 }}>
                Try a different ingredient, dish name, or cuisine
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {trendingTags.slice(0, 4).map(tag => (
                  <button key={tag.label} onClick={() => applyQuery(tag.query)} className="btn btn-secondary btn-sm">{tag.label}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
