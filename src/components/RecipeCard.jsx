import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Heart, Flame } from 'lucide-react';
import StarRating from './StarRating';
import { usersApi } from '../api/users';

// Shared heart button — centered, 44px touch target regardless of visual size.
// `size` sets the circle diameter; `iconSize` sets the SVG pixels.
function HeartBtn({ saved, onToggle, size = 36, iconSize = 15, bg = 'rgba(255,255,255,0.9)', style = {} }) {
  return (
    <button
      onClick={onToggle}
      className="heart-btn"
      style={{
        width: size, height: size,
        minWidth: size, minHeight: size,
        borderRadius: '50%',
        background: bg,
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        ...style,
      }}
    >
      <Heart
        size={iconSize}
        style={{
          fill: saved ? 'var(--color-primary)' : 'transparent',
          color: saved ? 'var(--color-primary)' : 'rgba(0,0,0,0.45)',
        }}
      />
    </button>
  );
}

export default function RecipeCard({ recipe, variant = 'portrait', onSave, saved: savedProp = false }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(savedProp);
  const [busy, setBusy] = useState(false);

  const recipeId = recipe._id || recipe.id;

  async function handleSave(e) {
    e.stopPropagation();
    if (busy) return;
    const willSave = !saved;
    setSaved(willSave);          // optimistic
    setBusy(true);
    try {
      if (willSave) await usersApi.saveRecipe(recipeId);
      else          await usersApi.unsaveRecipe(recipeId);
      onSave?.(recipeId, willSave);
    } catch {
      setSaved(!willSave);       // revert on error
    } finally {
      setBusy(false);
    }
  }

  // ── Portrait (horizontal scroll cards on Home) ─────────────────────────────
  if (variant === 'portrait') {
    return (
      <div
        onClick={() => navigate(`/recipe/${recipeId}`)}
        style={{
          width: 160, flexShrink: 0,
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      >
        {/* Image */}
        <div style={{ height: 110, position: 'relative', background: recipe.gradient || 'var(--color-surface-2)', overflow: 'hidden', flexShrink: 0 }}>
          {recipe.image && (
            <img src={recipe.image} alt={recipe.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.style.display = 'none'; }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }} />
          <HeartBtn saved={saved} onToggle={handleSave} size={28} iconSize={13}
            style={{ position: 'absolute', top: 7, right: 7 }} />
          <span style={{
            position: 'absolute', bottom: 7, left: 7,
            background: 'rgba(0,0,0,0.5)', color: '#fff',
            borderRadius: 'var(--radius-xs)', padding: '2px 7px',
            fontSize: 10, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <Clock size={10} /> {recipe.time}m
          </span>
        </div>
        {/* Body */}
        <div style={{ padding: '9px 10px 11px' }}>
          <p className="line-clamp-2" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.3, marginBottom: 5, fontFamily: 'var(--font-display)' }}>
            {recipe.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <StarRating rating={recipe.rating} size={11} />
            <span style={{ fontSize: 10, color: 'var(--color-text-3)', fontWeight: 500 }}>{recipe.rating}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── List ──────────────────────────────────────────────────────────────────
  if (variant === 'list') {
    return (
      <div
        onClick={() => navigate(`/recipe/${recipeId}`)}
        style={{
          display: 'flex',
          minHeight: 88,
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'transform 0.18s, box-shadow 0.18s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      >
        {/* Thumbnail */}
        <div style={{ width: 100, flexShrink: 0, position: 'relative', overflow: 'hidden', background: recipe.gradient || 'var(--color-surface-2)' }}>
          {recipe.image && (
            <img src={recipe.image} alt={recipe.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.style.display = 'none'; }} />
          )}
          {recipe.difficulty && (
            <span style={{
              position: 'absolute', bottom: 6, left: 6,
              background: getDifficultyColor(recipe.difficulty), color: '#fff',
              borderRadius: 'var(--radius-xs)', padding: '2px 6px',
              fontSize: 10, fontWeight: 700, lineHeight: 1.4,
            }}>
              {recipe.difficulty}
            </span>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '10px 10px 10px 12px', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <p className="line-clamp-2" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-sm)', fontWeight: 700,
              color: 'var(--color-text)', lineHeight: 1.35, marginBottom: 5,
            }}>
              {recipe.title}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Clock size={11} /> {recipe.time}m
              </span>
              {recipe.calories > 0 && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Flame size={11} /> {recipe.calories} kcal
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <StarRating rating={recipe.rating} size={12} />
              <span style={{ fontSize: 10, color: 'var(--color-text-3)', fontWeight: 500 }}>{recipe.rating}</span>
            </div>
            {/* transparent bg version for list rows */}
            <HeartBtn saved={saved} onToggle={handleSave} size={40} iconSize={17}
              bg="transparent"
              style={{ boxShadow: 'none', marginRight: -4 }} />
          </div>

          {recipe.matchScore !== undefined && (
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary)', marginTop: 3 }}>
              {Math.round(recipe.matchScore * 100)}% match
              {recipe.missing?.length > 0 && <span style={{ color: 'var(--color-warning)', marginLeft: 5 }}>{recipe.missing.length} missing</span>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Grid (default) — fills column width assigned by .recipe-grid ──────────
  return (
    <div
      onClick={() => navigate(`/recipe/${recipeId}`)}
      style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.18s, box-shadow 0.18s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    >
      {/* Image — 60% padding-top trick for consistent aspect ratio */}
      <div style={{ position: 'relative', paddingTop: '62%', background: recipe.gradient || 'var(--color-surface-2)', flexShrink: 0 }}>
        {recipe.image && (
          <img src={recipe.image} alt={recipe.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none'; }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.08) 45%, transparent 100%)' }} />

        <HeartBtn saved={saved} onToggle={handleSave} size={34} iconSize={15}
          style={{ position: 'absolute', top: 7, right: 7 }} />

        {/* Time + Difficulty badges */}
        <div style={{ position: 'absolute', bottom: 7, left: 7, display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ background: 'rgba(0,0,0,0.52)', color: '#fff', borderRadius: 'var(--radius-xs)', padding: '2px 6px', fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={9} /> {recipe.time}m
          </span>
          {recipe.difficulty && (
            <span style={{ background: getDifficultyColor(recipe.difficulty), color: '#fff', borderRadius: 'var(--radius-xs)', padding: '2px 6px', fontSize: 10, fontWeight: 700 }}>
              {recipe.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '9px 10px 11px', height: 90, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 5, overflow: 'hidden' }}>
        <p className="line-clamp-2" style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-sm)', fontWeight: 700,
          color: 'var(--color-text)', lineHeight: 1.3,
        }}>
          {recipe.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 'auto' }}>
          <StarRating rating={recipe.rating} size={11} />
          <span style={{ fontSize: 10, color: 'var(--color-text-3)', fontWeight: 500 }}>
            {recipe.rating}{recipe.reviewCount ? ` (${recipe.reviewCount})` : ''}
          </span>
        </div>
        {recipe.matchScore !== undefined && (
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary)', marginTop: 2 }}>
            {Math.round(recipe.matchScore * 100)}% match
            {recipe.missing?.length > 0 && <span style={{ color: 'var(--color-warning)', marginLeft: 5 }}>{recipe.missing.length} missing</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function getDifficultyColor(d) {
  return d === 'Easy' ? 'var(--color-accent)' : d === 'Medium' ? 'var(--color-warning)' : 'var(--color-primary)';
}
