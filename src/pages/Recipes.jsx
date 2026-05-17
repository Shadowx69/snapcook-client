import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, List, LayoutGrid, SearchX } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import Toast from '../components/Toast';
import IconTile from '../components/IconTile';
import { PageLoader } from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';
import { useRecipes } from '../hooks/useRecipes';
import { usersApi } from '../api/users';

const sortOptions = [
  { id: 'rating', label: 'Top Rated' },
  { id: 'time', label: 'Fastest' },
  { id: 'calories', label: 'Fewest Cal' },
  { id: 'relevant', label: 'Best Match' },
];

const filterOptions = [
  { id: 'highProtein', label: 'High Protein' },
  { id: 'lowCarb', label: 'Low Carb' },
  { id: 'lowFat', label: 'Low Fat' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
];

export default function Recipes() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAi = searchParams.get('ai');
  const cuisineParam = searchParams.get('cuisine');
  const categoryParam = searchParams.get('category');
  const collectionParam = searchParams.get('collection');
  const collectionTitle = searchParams.get('title');
  const maxTimeParam = searchParams.get('maxTime');
  const maxCalParam = searchParams.get('maxCal');
  const tagParam = searchParams.get('tag');
  const maxIngredientsParam = searchParams.get('maxIngredients');

  const [viewMode, setViewMode] = useState('grid');
  const [sort, setSort] = useState('rating');
  const [activeFilters, setActiveFilters] = useState([]);
  const [toast, setToast] = useState(null);
  const [aiRecipes, setAiRecipes] = useState(null);

  const toggleFilter = (fId) => {
    setActiveFilters(prev => prev.includes(fId) ? prev.filter(id => id !== fId) : [...prev, fId]);
  };

  useEffect(() => {
    if (isAi) {
      try {
        const stored = localStorage.getItem('AI_RECOMMENDATIONS');
        if (stored) setAiRecipes(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, [isAi]);

  const apiParams = {
    sort,
    ...(cuisineParam && { cuisine: cuisineParam }),
    ...(categoryParam && { category: categoryParam }),
    ...(collectionParam && { collection: collectionParam }),
    ...(maxTimeParam && { maxTime: maxTimeParam }),
    ...(maxCalParam && { maxCal: maxCalParam }),
    ...(tagParam && { tag: tagParam }),
    ...(maxIngredientsParam && { maxIngredients: maxIngredientsParam }),
  };

  if (activeFilters.includes('highProtein')) apiParams.minProtein = 20;
  if (activeFilters.includes('lowCarb')) apiParams.maxCarb = 20;
  if (activeFilters.includes('lowFat')) apiParams.maxFat = 15;
  if (activeFilters.includes('vegan')) apiParams.diet = 'vegan';
  else if (activeFilters.includes('vegetarian')) apiParams.diet = 'vegetarian';

  const { data: recipes, loading, error, refetch } = useRecipes(isAi ? null : apiParams);

  // Client-side sort for AI recommendation results
  const sortedAiRecipes = useMemo(() => {
    if (!aiRecipes) return null;
    let arr = [...aiRecipes];

    if (activeFilters.includes('highProtein')) arr = arr.filter(r => (r.macros?.protein || r.nutrition?.protein || 0) >= 20);
    if (activeFilters.includes('lowCarb')) arr = arr.filter(r => (r.macros?.carbs || r.nutrition?.carbs || 0) <= 20);
    if (activeFilters.includes('lowFat')) arr = arr.filter(r => (r.macros?.fat || r.nutrition?.fat || 0) <= 15);
    if (activeFilters.includes('vegan')) arr = arr.filter(r => (r.category || []).some(c => c.toLowerCase() === 'vegan') || (r.tags || []).some(t => t.toLowerCase() === 'vegan'));
    if (activeFilters.includes('vegetarian')) arr = arr.filter(r => (r.category || []).some(c => c.toLowerCase() === 'vegetarian') || (r.tags || []).some(t => t.toLowerCase() === 'vegetarian'));

    if (sort === 'rating') return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sort === 'time') return arr.sort((a, b) => (a.time ?? 999) - (b.time ?? 999));
    if (sort === 'calories') return arr.sort((a, b) => (a.calories ?? 999) - (b.calories ?? 999));
    // 'relevant' — keep original order (already sorted by matchScore from the API)
    return arr;
  }, [aiRecipes, sort, activeFilters]);

  const displayRecipes = isAi ? sortedAiRecipes : recipes;

  const pageTitle = isAi ? 'Found For You'
    : cuisineParam ? `${cuisineParam.charAt(0).toUpperCase() + cuisineParam.slice(1)} Recipes`
      : categoryParam ? `${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)} Recipes`
        : collectionParam ? (collectionTitle || collectionParam.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
          : maxTimeParam ? `Under ${maxTimeParam} Min`
            : maxCalParam ? `Under ${maxCalParam} Calories`
              : maxIngredientsParam ? `${maxIngredientsParam} Ingredients or Less`
                : tagParam ? tagParam.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Recipes'
                  : 'All Recipes';

  if (loading && !isAi) return <PageLoader />;

  return (
    <div className="page animate-fadeUp">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button className="btn-icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700 }}>{pageTitle}</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)' }}>
            {displayRecipes ? `${displayRecipes.length} recipe${displayRecipes.length !== 1 ? 's' : ''} found` : ''}
          </p>
        </div>
      </div>

      {error && <ErrorBanner message="Couldn't load recipes." onRetry={refetch} />}

      {/* Controls */}
      {!error && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)', fontWeight: 500 }}>
              {displayRecipes?.length ?? 0} results
            </span>
            <button onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')} style={{ padding: '6px 12px', borderRadius: 'var(--radius-xs)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-2)', cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {viewMode === 'grid' ? <><List size={13} /> List</> : <><LayoutGrid size={13} /> Grid</>}
            </button>
          </div>

          <div className="scroll-row" style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', fontWeight: 600, marginRight: 8, whiteSpace: 'nowrap' }}>Sort by:</span>
            {sortOptions.map(s => (
              <button key={s.id} onClick={() => setSort(s.id)} className={`pill-toggle${sort === s.id ? ' active' : ''}`} style={{ fontSize: 'var(--text-xs)' }}>
                {s.label}
              </button>
            ))}
          </div>

          <div className="scroll-row" style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', fontWeight: 600, marginRight: 8, whiteSpace: 'nowrap' }}>Filter:</span>
            {filterOptions.map(f => (
              <button key={f.id} onClick={() => toggleFilter(f.id)} className={`pill-toggle${activeFilters.includes(f.id) ? ' active' : ''}`} style={{ fontSize: 'var(--text-xs)' }}>
                {f.label}
              </button>
            ))}
          </div>

          {viewMode === 'grid' ? (
            <div className="recipe-grid">
              {(displayRecipes || []).map(r => (
                <AiClickWrapper key={r._id || r.id} recipeId={r._id || r.id} enabled={isAi}>
                  <RecipeCard recipe={r} variant="grid" onSave={(id, isSaved) => setToast(isSaved ? 'Added to Favourites' : 'Removed from Favourites')} />
                </AiClickWrapper>
              ))}
            </div>
          ) : (
            <div className="recipe-list">
              {(displayRecipes || []).map(r => (
                <AiClickWrapper key={r._id || r.id} recipeId={r._id || r.id} enabled={isAi}>
                  <RecipeCard recipe={r} variant="list" onSave={(id, isSaved) => setToast(isSaved ? 'Added to Favourites' : 'Removed from Favourites')} />
                </AiClickWrapper>
              ))}
            </div>
          )}

          {(!displayRecipes || displayRecipes.length === 0) && !loading && (
            <div className="empty-state">
              <div className="empty-state-icon"><IconTile icon={SearchX} size={72} iconSize={36} tint="neutral" strokeWidth={1.75} /></div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)' }}>No recipes found</h3>
              <p style={{ color: 'var(--color-text-3)', fontSize: 'var(--text-sm)' }}>Try adjusting your filters</p>
            </div>
          )}
        </>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

// Wraps an AI-result RecipeCard so a click logs an 'opened' Activity before
// RecipeCard's own onClick navigates away. Bubbling lets us catch the click
// without altering RecipeCard's API. Fetch fires synchronously, so the
// request hits the server even though this component unmounts on navigate.
function AiClickWrapper({ recipeId, enabled, children }) {
  if (!enabled || !recipeId) return children;
  return (
    <div onClick={() => { usersApi.logOpened(recipeId).catch(() => {}); }}>
      {children}
    </div>
  );
}
