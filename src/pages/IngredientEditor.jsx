import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Plus, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { snapApi } from '../api/snap';
import Toast from '../components/Toast';

const SNAP_STORAGE_KEY = 'snapcook_snap_history';

function saveSnapSession(ingredients, recipeIds) {
  const now = new Date();
  const label =
    now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
    ', ' +
    now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const session = {
    id: `s_${Date.now()}`,
    label,
    ingredients: ingredients || [],
    recipeIds: recipeIds || [],
  };
  const existing = JSON.parse(localStorage.getItem(SNAP_STORAGE_KEY) || '[]');
  localStorage.setItem(SNAP_STORAGE_KEY, JSON.stringify([session, ...existing].slice(0, 20)));
}

export default function IngredientEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const state = location.state;
    if (state?.ingredients && Array.isArray(state.ingredients)) {
      setIngredients(state.ingredients);
      setReady(true);
    } else {
      navigate('/snap', { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function addIngredient() {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients(prev => [...prev, trimmed]);
    }
    setInput('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  }

  async function handleFindRecipes() {
    if (ingredients.length === 0 || loading) return;
    setLoading(true);
    try {
      const data = await snapApi.analyzeManual({ ingredients });
      const recipeIds = (data.recipes || []).map(r => r.id || r._id);
      saveSnapSession(data.ingredients || ingredients, recipeIds);
      localStorage.setItem('AI_RECOMMENDATIONS', JSON.stringify(data.recipes));
      navigate('/recipes?ai=true');
    } catch (err) {
      console.error(err);
      setToast(err.message || 'Failed to find recipes. Try again.');
      setLoading(false);
    }
  }

  if (!ready) return null;

  const canFind = ingredients.length > 0 && !loading;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 32,
    }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 16px 0' }} className="animate-fadeUp">
        <button
          type="button"
          onClick={() => navigate('/snap')}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ArrowLeft size={18} color="var(--color-text)" />
        </button>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, margin: 0 }}>
            Detected Ingredients
          </h1>
          <p style={{ color: 'var(--color-text-2)', fontSize: 'var(--text-sm)', margin: 0 }}>
            Review, add, or remove before searching
          </p>
        </div>
      </div>

      {/* ── INGREDIENTS LIST ── */}
      <div style={{ padding: '16px 16px 0' }} className="animate-fadeUp">
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>
            {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''} detected
          </p>

          {ingredients.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ingredients.map(ing => (
                <span key={ing} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                  padding: '6px 12px', borderRadius: 'var(--radius-xs)',
                  fontSize: 'var(--text-sm)', fontWeight: 600,
                }}>
                  {ing}
                  <button
                    type="button"
                    onClick={() => setIngredients(prev => prev.filter(i => i !== ing))}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--color-primary)', padding: 0,
                      display: 'flex', lineHeight: 1,
                    }}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-3)', fontStyle: 'italic' }}>
              No ingredients left. Add some below.
            </p>
          )}
        </div>
      </div>

      {/* ── ADD INGREDIENT ── */}
      <div style={{ padding: '12px 16px 0' }} className="animate-fadeUp delay-1">
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 10 }}>
            Add more ingredients
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. onion, rice, garlic..."
              style={{
                flex: 1, padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-2)',
                color: 'var(--color-text)',
                fontSize: 'var(--text-sm)', outline: 'none',
                fontFamily: 'var(--font-body)',
              }}
            />
            <button
              type="button"
              onClick={addIngredient}
              disabled={!input.trim()}
              style={{
                width: 38, height: 38, flexShrink: 0,
                borderRadius: 'var(--radius-md)',
                background: input.trim() ? 'var(--color-primary)' : 'var(--color-surface-2)',
                color: input.trim() ? '#fff' : 'var(--color-text-3)',
                border: '1px solid var(--color-border)',
                cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
            >
              <Plus size={16} />
            </button>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <AlertCircle size={12} /> Press Enter or tap + to add
          </p>
        </div>
      </div>

      {/* ── FIND RECIPES CTA ── */}
      <div style={{ padding: '16px 16px 0' }} className="animate-fadeUp delay-2">
        <button
          type="button"
          disabled={!canFind}
          onClick={handleFindRecipes}
          className="btn btn-primary btn-lg"
          style={{
            width: '100%',
            boxShadow: canFind ? 'var(--shadow-lg)' : 'none',
            opacity: canFind ? 1 : 0.5,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Sparkles size={18} />
          {loading ? 'Finding Recipes...' : 'Find Recipes'}
          {!loading && <ArrowRight size={18} />}
        </button>
        {ingredients.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginTop: 8 }}>
            Add at least one ingredient to continue
          </p>
        )}
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
