import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Zap, Trash2, Search as SearchIcon, Sun, CloudSun, Moon, Star, CalendarPlus } from 'lucide-react';
import Toast from '../components/Toast';
import IconTile from '../components/IconTile';
import { PageLoader } from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';
import { useMealPlanner } from '../hooks/useMealPlanner';
import { useRecipes } from '../hooks/useRecipes';
import { getCuisineIcon } from '../icons/cuisineIcon';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS = ['breakfast', 'lunch', 'dinner'];
const MEAL_ICON_COMPONENTS = { breakfast: Sun, lunch: CloudSun, dinner: Moon };
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

const CATEGORY_FILTERS = [
  { id: 'all',       label: 'All' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch',     label: 'Lunch' },
  { id: 'dinner',    label: 'Dinner' },
  { id: 'snacks',    label: 'Snacks' },
];

export default function MealPlanner() {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState('Mon');
  const [showPicker, setShowPicker] = useState(null); // { day, meal }
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('all');
  const [toast, setToast] = useState(null);
  const searchRef = useRef();

  const { plan, loading, error, saving, updateSlot, removeSlot, savePlan, refetch } = useMealPlanner();
  const { data: allRecipes } = useRecipes({ sort: 'rating', limit: 100 });

  // Focus search input when picker opens
  useEffect(() => {
    if (showPicker) {
      setTimeout(() => searchRef.current?.focus(), 80);
    }
  }, [showPicker]);

  function openPicker(day, meal) {
    setShowPicker({ day, meal });
    setPickerSearch('');
    setPickerCategory('all');
  }

  async function removeRecipe(day, meal) {
    try {
      await removeSlot(day, meal);
    } catch { setToast('Failed to remove meal'); }
  }

  async function addRecipe(day, meal, recipe) {
    try {
      await updateSlot(day, meal, recipe._id);
      setShowPicker(null);
      setToast(`${recipe.title} added to ${MEAL_LABELS[meal]}`);
    } catch { setToast('Failed to add meal'); }
  }

  async function generateWeek() {
    if (!allRecipes?.length) return;
    const newPlan = {};
    DAYS.forEach((day, di) => {
      const breakfastRecipes = allRecipes.filter(r => (r.category || []).includes('breakfast'));
      const lunchRecipes = allRecipes.filter(r => (r.category || []).includes('lunch'));
      const dinnerRecipes = allRecipes.filter(r => (r.category || []).includes('dinner'));
      newPlan[day] = {
        breakfast: breakfastRecipes[di % Math.max(breakfastRecipes.length, 1)]?._id,
        lunch:     lunchRecipes[di % Math.max(lunchRecipes.length, 1)]?._id,
        dinner:    dinnerRecipes[di % Math.max(dinnerRecipes.length, 1)]?._id,
      };
    });
    try {
      await savePlan(newPlan);
      setToast('Week plan generated');
    } catch { setToast('Failed to save plan'); }
  }

  async function clearDay() {
    const newPlan = {};
    DAYS.forEach(day => {
      newPlan[day] = day === activeDay ? {} : { ...plan[day] };
    });
    try {
      await savePlan(newPlan);
      setToast(`${activeDay} cleared`);
    } catch { setToast('Failed to clear day'); }
  }

  const dayPlan = plan[activeDay] || { breakfast: null, lunch: null, dinner: null };

  // Weekly stats
  let totalMeals = 0, totalCalories = 0;
  DAYS.forEach(d => {
    MEALS.forEach(m => {
      if (plan[d]?.[m]) { totalMeals++; totalCalories += plan[d][m].calories || 0; }
    });
  });

  // Picker filtering
  const pickerRecipes = (allRecipes || []).filter(r => {
    const matchesSearch = !pickerSearch.trim() ||
      r.title.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      (r.cuisine || '').toLowerCase().includes(pickerSearch.toLowerCase()) ||
      (r.tags || []).some(t => t.includes(pickerSearch.toLowerCase()));
    const matchesCategory = pickerCategory === 'all' || (r.category || []).includes(pickerCategory);
    return matchesSearch && matchesCategory;
  }).sort((a, b) => b.rating - a.rating);

  if (loading) return <PageLoader />;
  if (error) return <ErrorBanner message="Couldn't load your meal plan." onRetry={refetch} />;

  return (
    <div style={{ paddingBottom: 'calc(var(--bottom-nav-h) + 20px)' }}>

      {/* ── HEADER ── */}
      <div style={{ padding: '16px 16px 0' }} className="animate-fadeUp">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
            Meal Planner
          </h1>
          <button onClick={generateWeek} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} /> Auto-Generate
          </button>
        </div>
        <p style={{ color: 'var(--color-text-2)', fontSize: 'var(--text-sm)', marginBottom: 16 }}>
          Plan your meals for the week
        </p>

        {/* Weekly stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 20 }}>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-primary)' }}>{totalMeals}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>Meals planned</div>
          </div>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-accent)' }}>{Math.round(totalCalories / (totalMeals || 1))}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>Avg kcal/meal</div>
          </div>
        </div>

        {/* Day tabs */}
        <div className="scroll-row" style={{ marginBottom: 20, gap: 6 }}>
          {DAYS.map(day => {
            const planned = MEALS.filter(m => plan[day]?.[m]).length;
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                style={{
                  flexShrink: 0,
                  padding: planned > 0 ? '6px 10px 6px 14px' : '8px 14px',
                  borderRadius: 'var(--radius-xs)',
                  border: `1.5px solid ${activeDay === day ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: activeDay === day ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: activeDay === day ? '#fff' : 'var(--color-text-2)',
                  fontSize: 'var(--text-sm)', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {day}
                {planned > 0 && (
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: activeDay === day ? 'rgba(255,255,255,0.3)' : 'var(--color-accent)',
                    color: '#fff',
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {planned}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MEAL SLOTS ── */}
      <div style={{ padding: '0 16px' }} className="animate-fadeUp delay-1">
        {MEALS.some(m => dayPlan[m]) && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <button
              onClick={clearDay}
              disabled={saving}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 'var(--radius-xs)',
                background: 'transparent',
                border: '1.5px solid var(--color-border)',
                color: 'var(--color-text-3)',
                fontSize: 'var(--text-xs)', fontWeight: 600,
                cursor: saving ? 'default' : 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'border-color 0.15s, color 0.15s, background 0.15s',
                opacity: saving ? 0.5 : 1,
              }}
              onMouseEnter={e => {
                if (saving) return;
                e.currentTarget.style.borderColor = 'var(--color-error, #e53e3e)';
                e.currentTarget.style.color = 'var(--color-error, #e53e3e)';
                e.currentTarget.style.background = 'rgba(229,62,62,0.06)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.color = 'var(--color-text-3)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Trash2 size={13} />
              Clear {activeDay}
            </button>
          </div>
        )}
        {MEALS.map(meal => {
          const recipe = dayPlan[meal];
          const MealIcon = MEAL_ICON_COMPONENTS[meal];
          return (
            <div key={meal} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <MealIcon size={15} color="var(--color-primary)" />
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-3)' }}>
                  {MEAL_LABELS[meal]}
                </span>
              </div>

              {recipe ? (
                <div
                  onClick={() => navigate(`/recipe/${recipe._id || recipe.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: 'var(--radius-sm)',
                    background: recipe.gradient, flexShrink: 0,
                    overflow: 'hidden', position: 'relative',
                  }}>
                    {recipe.image
                      ? <img src={recipe.image} alt={recipe.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display = 'none'; }} />
                      : (() => { const C = getCuisineIcon(recipe.cuisine); return <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-2)' }}><C size={26} strokeWidth={1.75} /></div>; })()
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {recipe.title}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {recipe.time} min · {recipe.calories} kcal · <Star size={11} fill="var(--color-warning)" color="var(--color-warning)" /> {recipe.rating}
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); removeRecipe(activeDay, meal); }}
                    style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
                  >
                    <X size={14} color="var(--color-text-3)" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openPicker(activeDay, meal)}
                  style={{
                    width: '100%', padding: '20px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px dashed var(--color-border-strong)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-3)',
                    fontSize: 'var(--text-sm)', fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'border-color 0.15s, color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-primary-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-3)'; e.currentTarget.style.background = 'var(--color-surface)'; }}
                >
                  <Plus size={16} />
                  Add {MEAL_LABELS[meal]}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── RECIPE PICKER MODAL ── */}
      {showPicker && (
        <div
          className="modal-overlay"
          onClick={() => setShowPicker(null)}
          style={{ zIndex: 200 }}
        >
          <div
            className="modal-sheet"
            onClick={e => e.stopPropagation()}
            style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Handle */}
            <div className="modal-handle" />

            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexShrink: 0 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                {(() => { const I = MEAL_ICON_COMPONENTS[showPicker.meal]; return <I size={18} color="var(--color-primary)" />; })()}
                Add {MEAL_LABELS[showPicker.meal]}
              </h3>
              <button
                onClick={() => setShowPicker(null)}
                style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={15} color="var(--color-text-2)" />
              </button>
            </div>

            {/* Search input */}
            <div style={{ position: 'relative', marginBottom: 10, flexShrink: 0 }}>
              <SearchIcon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)', pointerEvents: 'none' }} />
              <input
                ref={searchRef}
                className="input input-with-icon"
                type="text"
                placeholder="Search recipes, cuisine, ingredients…"
                value={pickerSearch}
                onChange={e => setPickerSearch(e.target.value)}
                style={{ borderRadius: 'var(--radius-xs)', fontSize: 'var(--text-sm)', paddingRight: pickerSearch ? 36 : 12 }}
              />
              {pickerSearch && (
                <button
                  onClick={() => setPickerSearch('')}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)', display: 'flex' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category filter pills */}
            <div className="scroll-row" style={{ gap: 6, marginBottom: 12, flexShrink: 0 }}>
              {CATEGORY_FILTERS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setPickerCategory(c.id)}
                  className={`pill-toggle${pickerCategory === c.id ? ' active' : ''}`}
                  style={{ fontSize: 'var(--text-xs)', flexShrink: 0 }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Result count */}
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginBottom: 10, flexShrink: 0 }}>
              {pickerRecipes.length} {pickerRecipes.length === 1 ? 'recipe' : 'recipes'}
              {pickerSearch ? ` for "${pickerSearch}"` : ''}
            </p>

            {/* Scrollable recipe list */}
            <div style={{ overflowY: 'auto', flex: 1, marginRight: -4, paddingRight: 4 }}>
              {pickerRecipes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-3)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <IconTile icon={CalendarPlus} size={56} iconSize={28} tint="neutral" strokeWidth={1.75} style={{ marginBottom: 10 }} />
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>No recipes found</p>
                  <button
                    onClick={() => { setPickerSearch(''); setPickerCategory('all'); }}
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: 12 }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pickerRecipes.map(r => (
                    <button
                      key={r.id}
                      onClick={() => addRecipe(showPicker.day, showPicker.meal, r)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 12px',
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                        textAlign: 'left', width: '100%',
                        transition: 'background 0.15s, border-color 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary-light)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                    >
                      {/* Photo thumbnail */}
                      <div style={{
                        width: 48, height: 48, borderRadius: 'var(--radius-xs)',
                        background: r.gradient, flexShrink: 0,
                        overflow: 'hidden', position: 'relative',
                      }}>
                        {r.image
                          ? <img src={r.image} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display = 'none'; }} />
                          : (() => { const C = getCuisineIcon(r.cuisine); return <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-2)' }}><C size={22} strokeWidth={1.75} /></div>; })()
                        }
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.title}
                        </p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginTop: 2 }}>
                          {r.time} min · {r.calories} kcal · {r.difficulty}
                        </p>
                      </div>

                      {/* Rating + category badge */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-warning)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <Star size={11} fill="var(--color-warning)" color="var(--color-warning)" /> {r.rating}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 600, textTransform: 'capitalize',
                          color: 'var(--color-text-3)',
                          background: 'var(--color-surface-2)',
                          padding: '2px 7px', borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--color-border)',
                        }}>
                          {Array.isArray(r.category) ? r.category[0] : r.category}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
