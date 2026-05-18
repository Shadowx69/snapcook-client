import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Bookmark, Clock, Minus, Plus, CheckSquare, Square, ChevronLeft, ChevronRight, X, Timer, Check, Users, BarChart3, ChefHat, SearchX } from 'lucide-react';
import StarRating from '../components/StarRating';
import NutritionBadge from '../components/NutritionBadge';
import Toast from '../components/Toast';
import IconTile from '../components/IconTile';
import { PageLoader } from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';
import { useRecipeById } from '../hooks/useRecipes';
import { useSavedRecipes } from '../hooks/useProfile';
import { recipesApi } from '../api/recipes';
import { usersApi } from '../api/users';

const TABS = ['Ingredients', 'Instructions', 'Nutrition', 'Reviews'];



function parseDuration(timeStr) {
  if (!timeStr) return 120;
  const num = parseInt(timeStr);
  if (timeStr.toLowerCase().includes('hr') || timeStr.toLowerCase().includes('hour')) return num * 60;
  return isNaN(num) ? 120 : num * 60;
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function CookingMode({ recipe, onClose, onDone }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(parseDuration(recipe.steps[0]?.time));
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const total = recipe.steps.length;
  const step = recipe.steps[stepIdx];

  useEffect(() => {
    setTimeout(() => {
      setTimeLeft(parseDuration(step?.time));
      setRunning(false);
    }, 0);
    clearInterval(intervalRef.current);
  }, [stepIdx, step?.time]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(intervalRef.current); setRunning(false); return 0; }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function goNext() { if (stepIdx < total - 1) setStepIdx(i => i + 1); }
  function goPrev() { if (stepIdx > 0) setStepIdx(i => i - 1); }

  const progress = ((stepIdx + 1) / total) * 100;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'var(--color-bg)',
      display: 'flex', flexDirection: 'column',
      width: '100%',
    }}>
      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--color-border)', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--color-primary)', transition: 'width 0.4s ease' }} />
      </div>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'center',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        <div style={{
          width: '100%', maxWidth: 1200,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px',
        }}>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Now Cooking</p>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)', marginTop: 1 }}>{recipe.title}</p>
          </div>
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-2)' }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Step counter */}
      <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ width: '100%', maxWidth: 1200, textAlign: 'center', padding: '24px 16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            {recipe.steps.map((_, i) => (
              <div key={i} onClick={() => setStepIdx(i)} style={{
                width: i === stepIdx ? 32 : 10, height: 10, borderRadius: 5,
                background: i <= stepIdx ? 'var(--color-primary)' : 'var(--color-border)',
                transition: 'all 0.3s', cursor: 'pointer',
              }} />
            ))}
          </div>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Step {stepIdx + 1} of {total}
          </p>
        </div>
      </div>

      {/* Step content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1200 }}>
          <div style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px 24px',
            marginBottom: 24,
            boxShadow: 'var(--shadow-md)',
            textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--color-primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, marginBottom: 20,
            }}>
              {step?.step}
            </div>
            <p style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text)', lineHeight: 1.6, fontFamily: 'var(--font-display)', maxWidth: 1000 }}>
              {step?.text}
            </p>
          </div>

          {/* Timer */}
          <div style={{
            background: running ? 'rgba(200,75,49,0.06)' : 'var(--color-surface-2)',
            border: `1.5px solid ${running ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '20px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'all 0.3s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Timer size={24} color={running ? 'var(--color-primary)' : 'var(--color-text-3)'} />
              <div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-3)', fontWeight: 600 }}>Step Timer</p>
                <p style={{ fontSize: 36, fontWeight: 700, fontFamily: 'monospace', color: running ? 'var(--color-primary)' : 'var(--color-text)', lineHeight: 1, marginTop: 4 }}>
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setRunning(r => !r)}
                style={{
                  padding: '12px 24px', borderRadius: 'var(--radius-xs)',
                  background: running ? 'var(--color-surface)' : 'var(--color-primary)',
                  color: running ? 'var(--color-primary)' : '#fff',
                  border: `1.5px solid ${running ? 'var(--color-primary)' : 'transparent'}`,
                  cursor: 'pointer', fontWeight: 700, fontSize: 'var(--text-base)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {running ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={() => { setTimeLeft(parseDuration(step?.time)); setRunning(false); }}
                style={{ padding: '12px 20px', borderRadius: 'var(--radius-xs)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--color-text-2)', fontFamily: 'var(--font-body)' }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)',
        flexShrink: 0, display: 'flex', justifyContent: 'center'
      }}>
        <div style={{
          width: '100%', maxWidth: 1200,
          display: 'flex', gap: 16, padding: '16px',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        }}>
          <button
            onClick={goPrev}
            disabled={stepIdx === 0}
            style={{
              flex: 1, padding: '16px', borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
              cursor: stepIdx === 0 ? 'not-allowed' : 'pointer',
              opacity: stepIdx === 0 ? 0.4 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-2)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <ChevronLeft size={20} /> Previous
          </button>
          {stepIdx < total - 1 ? (
            <button
              onClick={goNext}
              style={{
                flex: 2, padding: '16px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary)', color: '#fff',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontSize: 'var(--text-base)', fontWeight: 700,
                fontFamily: 'var(--font-body)',
              }}
            >
              Next Step <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={onDone || onClose}
              style={{
                flex: 2, padding: '16px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-accent)', color: '#fff',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontSize: 'var(--text-base)', fontWeight: 700,
                fontFamily: 'var(--font-body)',
              }}
            >
              <Check size={20} /> Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: recipe, loading, error, refetch } = useRecipeById(id);
  const { saved: savedList, toggleSave } = useSavedRecipes();
  const isSaved = (savedList || []).some(r => r._id === id);

  const [tab, setTab] = useState('Ingredients');
  const [servings, setServings] = useState(2);
  const [checked, setChecked] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [toast, setToast] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [cookingMode, setCookingMode] = useState(false);

  useEffect(() => { if (recipe?.servings) setServings(recipe.servings); }, [recipe]);

  useEffect(() => {
    if (recipe?._id) {
      usersApi.logOpened(recipe._id).catch(() => {});
    }
  }, [recipe?._id]);

  useEffect(() => {
    if (tab === 'Reviews' && recipe?._id) {
      setReviewsLoading(true);
      recipesApi.getReviews(recipe._id)
        .then(data => setReviews(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setReviewsLoading(false));
    }
  }, [tab, recipe?._id]);

  if (loading && !recipe) return <PageLoader />;
  if (error || !recipe) {
    return (
      <div className="page animate-fadeUp" style={{ textAlign: 'center', paddingTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <IconTile icon={SearchX} size={72} iconSize={36} tint="neutral" strokeWidth={1.75} style={{ marginBottom: 12 }} />
        <h2 style={{ fontFamily: 'var(--font-display)' }}>Recipe not found</h2>
        <ErrorBanner message={error} onRetry={refetch} />
        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const scale = servings / (recipe.servings || 2);

  async function handleToggleSave() {
    await toggleSave(recipe._id, isSaved);
    setToast(isSaved ? 'Removed from Favourites' : 'Saved');
  }

  async function handleSubmitReview(rating) {
    const r = rating || userRating;
    if (!r) return;
    setUserRating(r);
    try {
      const rev = await recipesApi.submitReview(recipe._id, { rating: r, comment: reviewComment });
      setToast('Review submitted');
      setReviews(prev => [rev, ...prev]);
      setReviewComment('');
      refetch();
    } catch { setToast('Failed to submit review.'); }
  }

  async function handleCookingDone() {
    setCookingMode(false);
    try {
      await usersApi.logCooked(recipe._id);
      setToast('Recipe completed! Great job');
    } catch { /* non-critical */ }
  }

  function toggleCheck(i) {
    setChecked(c => ({ ...c, [i]: !c[i] }));
  }

  if (cookingMode) {
    return <CookingMode recipe={recipe} onClose={() => setCookingMode(false)} onDone={handleCookingDone} />;
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 100 }}>

      {/* ── TOP BAR ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        minHeight: 56,
      }}>
        <button className="btn-icon" style={{ flexShrink: 0 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700,
          flex: 1, textAlign: 'center', marginInline: 10,
          lineHeight: 1.25,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {recipe.title}
        </h2>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button className="btn-icon" onClick={() => setToast('Link copied')}>
            <Share2 size={16} />
          </button>
          <button
            className="btn-icon"
            onClick={handleToggleSave}
            style={{ background: isSaved ? 'var(--color-primary-light)' : undefined }}
          >
            <Bookmark size={16} style={{ fill: isSaved ? 'var(--color-primary)' : 'transparent', color: isSaved ? 'var(--color-primary)' : 'var(--color-text-2)' }} />
          </button>
        </div>
      </div>

      {/* ── HERO IMAGE ── */}
      <div style={{ height: 260, position: 'relative', background: recipe.gradient, overflow: 'hidden' }}>
        {recipe.image && (
          <img src={recipe.image} alt={recipe.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        )}
        {/* gradient scrim — bottom dark fade for info strip, top subtle darkening */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.45) 100%)',
        }} />
        {/* title visible on the photo */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 16px 16px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700,
            color: '#fff', lineHeight: 1.25, textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}>
            {recipe.title}
          </h1>
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            {[
              { Icon: Clock,     label: `${recipe.time} min` },
              { Icon: Users,     label: `${recipe.servings} servings` },
              { Icon: BarChart3, label: recipe.difficulty },
            ].map(m => (
              <span key={m.label} style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.92)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <m.Icon size={12} /> {m.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── INFO STRIP ── */}
      <div style={{ padding: '14px 16px 16px' }}>
        <NutritionBadge calories={recipe.calories} macros={recipe.macros} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <StarRating rating={recipe.rating} size={16} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>{recipe.rating}</span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-3)' }}>({recipe.reviewCount} reviews)</span>
        </div>

        {/* Action pills */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={handleToggleSave}>
            <Bookmark size={14} /> {isSaved ? 'Saved' : 'Save Recipe'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setToast('Link copied')}>
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--color-border)', margin: '0 16px' }} />

      {/* ── TABS ── */}
      <div style={{
        position: 'sticky', top: 56, zIndex: 40,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
      }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '13px 4px',
              fontSize: 'var(--text-xs)', fontWeight: 600,
              color: tab === t ? 'var(--color-primary)' : 'var(--color-text-3)',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: `2px solid ${tab === t ? 'var(--color-primary)' : 'transparent'}`,
              transition: 'color 0.15s, border-color 0.15s',
              fontFamily: 'var(--font-body)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div style={{ padding: '16px 16px 0', animation: 'fadeUp 0.3s ease' }}>

        {/* INGREDIENTS */}
        {tab === 'Ingredients' && (
          <div>

            {recipe.ingredients.map((ing, i) => (
              <button
                key={i}
                onClick={() => toggleCheck(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                  padding: '13px 0',
                  borderBottom: i < recipe.ingredients.length - 1 ? '1px solid var(--color-border)' : 'none',
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'var(--font-body)',
                  opacity: checked[i] ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {checked[i]
                  ? <CheckSquare size={18} color="var(--color-accent)" />
                  : <Square size={18} color="var(--color-text-3)" />
                }
                <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-text)', flex: 1, textDecoration: checked[i] ? 'line-through' : 'none' }}>
                  {ing.amount ? `${ing.amount} ` : ''}{ing.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* INSTRUCTIONS */}
        {tab === 'Instructions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recipe.steps.map((s, i) => (
              <div
                key={i}
                onClick={() => setActiveStep(i)}
                style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  background: activeStep === i ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  border: `1.5px solid ${activeStep === i ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)', padding: '14px 14px',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: activeStep === i ? 'var(--color-primary)' : 'var(--color-surface-2)',
                  color: activeStep === i ? '#fff' : 'var(--color-text-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 'var(--text-sm)', fontWeight: 700,
                }}>
                  {s.step}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text)', lineHeight: 1.6, marginBottom: 6 }}>{s.text}</p>
                  {s.time && <span className="badge badge-surface"><Clock size={10} /> {s.time}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NUTRITION */}
        {tab === 'Nutrition' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 16 }}>Per Serving</h3>

            {/* Visual macro ring (CSS only) */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{ position: 'relative', width: 160, height: 160 }}>
                <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                  {[
                    { val: recipe.macros.carbs, color: 'var(--color-warning)', offset: 0 },
                    { val: recipe.macros.protein, color: 'var(--color-accent)', offset: recipe.macros.carbs },
                    { val: recipe.macros.fat, color: 'var(--color-primary)', offset: recipe.macros.carbs + recipe.macros.protein },
                  ].map((seg, i) => {
                    const total = recipe.macros.carbs + recipe.macros.protein + recipe.macros.fat;
                    const r = 60, circ = 2 * Math.PI * r;
                    const dash = (seg.val / total) * circ;
                    const gapOffset = (seg.offset / total) * circ;
                    return (
                      <circle key={i} cx="80" cy="80" r={r}
                        fill="none" stroke={seg.color} strokeWidth="18"
                        strokeDasharray={`${dash} ${circ - dash}`}
                        strokeDashoffset={-gapOffset}
                      />
                    );
                  })}
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text)' }}>{recipe.calories}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>calories</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 24 }}>
              {[
                { label: 'Carbs', val: recipe.macros.carbs, color: 'var(--color-warning)' },
                { label: 'Protein', val: recipe.macros.protein, color: 'var(--color-accent)' },
                { label: 'Fat', val: recipe.macros.fat, color: 'var(--color-primary)' },
              ].map(m => (
                <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color }} />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-2)' }}>{m.label} {m.val}g</span>
                </div>
              ))}
            </div>

            {/* Full breakdown */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {[
                { label: 'Calories', val: `${recipe.calories} kcal` },
                { label: 'Protein', val: `${recipe.macros.protein}g` },
                { label: 'Carbohydrates', val: `${recipe.macros.carbs}g` },
                { label: 'Fat', val: `${recipe.macros.fat}g` },
                { label: 'Fiber', val: `${recipe.macros.fiber}g` },
                { label: 'Sugar', val: `${recipe.macros.sugar}g` },
                { label: 'Sodium', val: `${recipe.macros.sodium}mg` },
              ].map((row, i, arr) => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '13px 16px',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)' }}>{row.label}</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {tab === 'Reviews' && (() => {
          const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) starCounts[r.rating]++; });
          const total = reviews.length;
          return (
            <div>
              {/* Average */}
              <div style={{ textAlign: 'center', marginBottom: 24, padding: '16px', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>{recipe.rating || '—'}</div>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                  <StarRating rating={recipe.rating} size={20} />
                </div>
                <p style={{ color: 'var(--color-text-3)', fontSize: 'var(--text-sm)' }}>{recipe.reviewCount || 0} reviews</p>
                {[5,4,3,2,1].map(star => {
                  const pct = total ? Math.round((starCounts[star] / total) * 100) : 0;
                  return (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', width: 8 }}>{star}</span>
                      <div style={{ flex: 1, height: 6, background: 'var(--color-surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-warning)', borderRadius: 3, transition: 'width 0.5s' }} />
                      </div>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', width: 28 }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>

              {/* Write a review */}
              <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 20, border: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>Rate & Review</p>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <StarRating rating={userRating} size={28} interactive onRate={r => setUserRating(r)} />
                </div>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share your thoughts (optional)…"
                  rows={3}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-body)',
                    resize: 'vertical',
                    outline: 'none',
                    marginBottom: 10,
                  }}
                />
                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                  disabled={!userRating}
                  onClick={() => handleSubmitReview(userRating)}
                >
                  Submit Review
                </button>
              </div>

              {/* Review list */}
              {reviewsLoading ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-3)' }}>Loading reviews…</div>
              ) : reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-3)' }}>
                  <p style={{ fontSize: 'var(--text-sm)' }}>No reviews yet. Be the first!</p>
                </div>
              ) : reviews.map((rev, i) => {
                const name = rev.userId?.displayName || 'Anonymous';
                const dateStr = rev.createdAt
                  ? new Date(rev.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '';
                return (
                  <div key={rev._id || i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: rev.userId?.avatarColor || 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--text-sm)', flexShrink: 0 }}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{name}</span>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>{dateStr}</span>
                        </div>
                        <StarRating rating={rev.rating} size={12} />
                      </div>
                    </div>
                    {rev.comment && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)', lineHeight: 1.6 }}>{rev.comment}</p>}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* ── STICKY START COOKING ── */}
      <div style={{
        position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        padding: '0 16px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        zIndex: 50,
      }}>
        <button className="btn btn-primary btn-lg" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: 'var(--shadow-lg)' }} onClick={() => setCookingMode(true)}>
          <ChefHat size={18} /> Start Cooking
        </button>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
