import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, UtensilsCrossed, List, LayoutGrid } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import Toast from '../components/Toast';
import IconTile from '../components/IconTile';
import { PageLoader } from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';
import { useCuisineById, useCuisineRecipes } from '../hooks/useCuisine';
import { getCuisineIcon } from '../icons/cuisineIcon';

const sortOptions = ['Top Rated', 'Fastest', 'Fewest Calories', 'Most Popular'];
const mealFilters = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const heroSubtitle = {
  pakistani: 'Rich, bold flavours from the heart of South Asia — from smoky karahis to fragrant biryanis.',
  italian: 'Simple, quality ingredients crafted into timeless dishes — the art of Italian cooking.',
  mexican: 'Vibrant, bold flavours bursting with chillies, lime and fresh herbs.',
  chinese: 'A vast tapestry of flavours spanning regional classics from Sichuan to Cantonese.',
  thai: 'A perfect balance of sweet, spicy, sour, and salty in every bite.',
  indian: 'A symphony of spices layered into complex, deeply satisfying dishes.',
  american: 'Hearty, comforting classics from breakfast tables to backyard grills.',
  french: 'Refined techniques meet rustic charm in the world\'s most celebrated cuisine.',
  japanese: 'Precision, balance, and the philosophy of letting ingredients speak.',
  'middle-eastern': 'Ancient spice routes live in every aromatic, deeply satisfying bite.',
};

export default function CuisinePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sort, setSort] = useState('Top Rated');
  const [mealFilter, setMealFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const { data: cuisineInfo, loading: cuisineLoading, error: cuisineError } = useCuisineById(id);

  const apiParams = {
    sort: sort === 'Top Rated' ? 'rating' : sort === 'Fastest' ? 'time' : sort === 'Fewest Calories' ? 'calories' : 'reviewCount',
    ...(mealFilter !== 'All' && { category: mealFilter.toLowerCase() }),
    ...(search && { search }),
  };
  const { data: recipes, loading: recipesLoading, error: recipesError, refetch } = useCuisineRecipes(id, apiParams);

  if (cuisineLoading) return <PageLoader />;

  if (cuisineError || !cuisineInfo) {
    return (
      <div className="page animate-fadeUp" style={{ textAlign: 'center', paddingTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <IconTile icon={UtensilsCrossed} size={72} iconSize={36} tint="neutral" strokeWidth={1.75} />
        <h2 style={{ fontFamily: 'var(--font-display)', marginTop: 12 }}>Cuisine not found</h2>
        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/explore')}>
          Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 'calc(var(--bottom-nav-h) + 20px)' }}>

      {/* ── HERO HEADER ── */}
      <div style={{ background: cuisineInfo.gradient, position: 'relative', overflow: 'hidden', height: 220 }}>
        {cuisineInfo.image && (
          <img src={cuisineInfo.image} alt={cuisineInfo.label}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)' }} />
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: 16, left: 16, width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', backdropFilter: 'blur(6px)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 2 }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            {(() => { const Icon = getCuisineIcon(id); return <Icon size={40} color="#fff" strokeWidth={2} style={{ flexShrink: 0 }} />; })()}
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>
                {cuisineInfo.label} Kitchen
              </h1>
              <p style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                {cuisineInfo.count ?? (recipes?.length ?? 0)} recipes
              </p>
            </div>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
            {heroSubtitle[id] || `Discover the best ${cuisineInfo.label} recipes.`}
          </p>
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ position: 'relative' }}>
          <SearchIcon size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)', pointerEvents: 'none' }} />
          <input
            className="input input-with-icon"
            placeholder={`Search ${cuisineInfo.label} recipes…`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ borderRadius: 'var(--radius-xs)' }}
          />
        </div>
      </div>

      {/* ── MEAL FILTER ── */}
      <div className="scroll-row" style={{ padding: '12px 16px', gap: 8 }}>
        {mealFilters.map(m => (
          <button key={m} onClick={() => setMealFilter(m)} className={`pill-toggle${mealFilter === m ? ' active' : ''}`}>
            {m}
          </button>
        ))}
      </div>

      {/* ── SORT + VIEW TOGGLE ── */}
      <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="scroll-row" style={{ gap: 6, flex: 1, marginRight: 8 }}>
          {sortOptions.map(s => (
            <button key={s} onClick={() => setSort(s)} className={`pill-toggle${sort === s ? ' active' : ''}`} style={{ fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')} style={{ padding: '6px 10px', borderRadius: 'var(--radius-xs)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-2)', cursor: 'pointer', fontFamily: 'var(--font-body)', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {viewMode === 'grid' ? <><List size={13} /> List</> : <><LayoutGrid size={13} /> Grid</>}
        </button>
      </div>

      {/* ── RECIPE LIST ── */}
      <div style={{ padding: '0 16px' }}>
        {recipesLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(160px, 1fr))' : '1fr', gap: 12 }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i}>
                <div className="skeleton" style={{ height: 130, borderRadius: 'var(--radius-md)', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '75%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 12, width: '50%' }} />
              </div>
            ))}
          </div>
        ) : recipesError ? (
          <ErrorBanner message="Failed to load recipes." onRetry={refetch} />
        ) : !recipes?.length ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconTile icon={UtensilsCrossed} size={72} iconSize={36} tint="neutral" strokeWidth={1.75} /></div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>No recipes found</h3>
            <p style={{ color: 'var(--color-text-3)', fontSize: 'var(--text-sm)' }}>
              {search ? `No "${search}" recipes in this cuisine` : 'Try a different filter'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="recipe-grid">
            {recipes.map(r => <RecipeCard key={r._id} recipe={r} variant="grid" onSave={(id, isSaved) => setToast(isSaved ? 'Added to Favourites' : 'Removed from Favourites')} />)}
          </div>
        ) : (
          <div className="recipe-list">
            {recipes.map(r => <RecipeCard key={r._id} recipe={r} variant="list" onSave={(id, isSaved) => setToast(isSaved ? 'Added to Favourites' : 'Removed from Favourites')} />)}
          </div>
        )}
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
