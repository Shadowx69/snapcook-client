import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Heart, Flame } from 'lucide-react';
import StarRating from './StarRating';

function ImgBox({ src, gradient, height, children }) {
  const [err, setErr] = useState(false);
  return (
    <div style={{
      height, position: 'relative', overflow: 'hidden', flexShrink: 0,
      background: gradient || 'var(--color-surface-2)',
    }}>
      {src && !err ? (
        <img
          src={src} alt="" onError={() => setErr(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : null}
      {/* dark scrim so text on top stays readable */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />
      {children}
    </div>
  );
}

export default function RecipeCard({ recipe, variant = 'portrait', onSave, saved: savedProp = false }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(savedProp);

  function handleSave(e) {
    e.stopPropagation();
    setSaved(s => !s);
    onSave?.(recipe.id, !saved);
  }

  if (variant === 'portrait') {
    return (
      <div
        onClick={() => navigate(`/recipe/${recipe._id || recipe.id}`)}
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
        <ImgBox src={recipe.image} gradient={recipe.gradient} height={110}>
          <button
            onClick={handleSave}
            style={{
              position: 'absolute', top: 8, right: 8,
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(255,255,255,0.85)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: saved ? 'heartPop 0.35s ease' : '',
            }}
          >
            <Heart size={14} style={{ fill: saved ? 'var(--color-primary)' : 'transparent', color: saved ? 'var(--color-primary)' : 'var(--color-text-3)' }} />
          </button>
          <span style={{
            position: 'absolute', bottom: 8, left: 8,
            background: 'rgba(0,0,0,0.5)', color: '#fff',
            borderRadius: 'var(--radius-xs)', padding: '2px 7px',
            fontSize: 'var(--text-xs)', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <Clock size={10} /> {recipe.time}m
          </span>
        </ImgBox>
        <div style={{ padding: '10px 10px 12px' }}>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.3, marginBottom: 6, fontFamily: 'var(--font-display)' }}>
            {recipe.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <StarRating rating={recipe.rating} size={11} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', fontWeight: 500 }}>{recipe.rating}</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div
        onClick={() => navigate(`/recipe/${recipe._id || recipe.id}`)}
        style={{
          display: 'flex', gap: 0,
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
      >
        <div style={{ width: 100, flexShrink: 0, position: 'relative', overflow: 'hidden', background: recipe.gradient || 'var(--color-surface-2)' }}>
          {recipe.image ? (
            <img src={recipe.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.style.display = 'none'; }} />
          ) : null}
        </div>
        <div style={{ padding: '12px 12px 12px 12px', flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 4, color: 'var(--color-text)' }}>
            {recipe.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock size={11} /> {recipe.time}m
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Flame size={11} /> {recipe.calories} kcal
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <StarRating rating={recipe.rating} size={12} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>{recipe.rating}</span>
            </div>
            <button onClick={handleSave} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <Heart size={16} style={{ fill: saved ? 'var(--color-primary)' : 'transparent', color: saved ? 'var(--color-primary)' : 'var(--color-text-3)' }} />
            </button>
          </div>
          {recipe.matchScore !== undefined && (
            <div style={{ marginTop: 6, fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-primary)' }}>
              AI Match: {Math.round(recipe.matchScore * 100)}%
              {recipe.missing?.length > 0 && <span style={{ color: 'var(--color-warning)', marginLeft: 6 }}>({recipe.missing.length} missing)</span>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div
      onClick={() => navigate(`/recipe/${recipe._id || recipe.id}`)}
      style={{
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
      <ImgBox src={recipe.image} gradient={recipe.gradient} height={120}>
        <button onClick={handleSave} style={{
          position: 'absolute', top: 8, right: 8,
          width: 30, height: 30, borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Heart size={15} style={{ fill: saved ? 'var(--color-primary)' : 'transparent', color: saved ? 'var(--color-primary)' : 'var(--color-text-3)' }} />
        </button>
        <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 4 }}>
          <span className="badge badge-surface" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none' }}>
            <Clock size={10} /> {recipe.time}m
          </span>
          <span className="badge" style={{ background: getDifficultyColor(recipe.difficulty), color: '#fff' }}>
            {recipe.difficulty}
          </span>
        </div>
      </ImgBox>
      <div style={{ padding: '10px 12px 12px' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 6, lineHeight: 1.3 }}>
          {recipe.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <StarRating rating={recipe.rating} size={12} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', fontWeight: 500 }}>{recipe.rating} ({recipe.reviewCount})</span>
        </div>
        {recipe.matchScore !== undefined && (
          <div style={{ marginTop: 8, fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-primary)' }}>
            AI Match: {Math.round(recipe.matchScore * 100)}%
            {recipe.missing?.length > 0 && <span style={{ color: 'var(--color-warning)', marginLeft: 6 }}>({recipe.missing.length} missing)</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function getDifficultyColor(d) {
  return d === 'Easy' ? 'var(--color-accent)' : d === 'Medium' ? 'var(--color-warning)' : 'var(--color-primary)';
}
