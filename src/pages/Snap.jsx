import { useState, useRef } from 'react';
import { Camera, Upload, X, ArrowRight, Plus, Sparkles, AlertCircle, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { snapApi } from '../api/snap';
import Toast from '../components/Toast';
import CameraCapture from '../components/CameraCapture';

const SNAP_STORAGE_KEY = 'snapcook_snap_history';

// Inputs must NOT be display:none — iOS Safari blocks programmatic .click() on hidden inputs.
// Position them off-screen instead so they stay interactive but invisible.
const hiddenInput = {
  position: 'absolute', top: -9999, left: -9999,
  width: 1, height: 1, overflow: 'hidden', opacity: 0,
};

function saveSnapSession(ingredients, recipeIds) {
  const now = new Date();
  const label = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' +
    now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const session = {
    id: `s_${Date.now()}`,
    label,
    ingredients: ingredients || [],
    recipeIds: recipeIds || [],
  };
  const existing = JSON.parse(localStorage.getItem(SNAP_STORAGE_KEY) || '[]');
  const updated = [session, ...existing].slice(0, 20);
  localStorage.setItem(SNAP_STORAGE_KEY, JSON.stringify(updated));
}

export default function Snap() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [manualIngredients, setManualIngredients] = useState([]);
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const galleryRef = useRef();
  const changeGalleryRef = useRef();

  function handleFile(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImage(URL.createObjectURL(file));
    }
    e.target.value = '';
  }

  function handleCameraCapture(file) {
    setImageFile(file);
    setImage(URL.createObjectURL(file));
    setCameraOpen(false);
  }

  function clearImage() {
    setImage(null);
    setImageFile(null);
  }

  function addManualIngredient() {
    const trimmed = manualInput.trim().toLowerCase();
    if (trimmed && !manualIngredients.includes(trimmed)) {
      setManualIngredients(prev => [...prev, trimmed]);
    }
    setManualInput('');
  }

  function handleManualKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addManualIngredient();
    }
  }

  const canFind = (!!image || manualIngredients.length > 0) && !loading;

  async function handleFindRecipes() {
    if (!canFind) return;
    setLoading(true);
    try {
      let data;
      if (manualIngredients.length > 0) {
        data = await snapApi.analyzeManual({ ingredients: manualIngredients });
      } else {
        const formData = new FormData();
        formData.append('image', imageFile);
        data = await snapApi.analyze(formData);
      }
      const recipeIds = (data.recipes || []).map(r => r.id || r._id);
      saveSnapSession(data.ingredients || manualIngredients, recipeIds);
      localStorage.setItem('AI_RECOMMENDATIONS', JSON.stringify(data.recipes));
      navigate('/recipes?ai=true');
    } catch (err) {
      console.error(err);
      setToast('Failed to find recipes. Check your connection and try again.');
      setLoading(false);
    }
  }

  const overlayBtn = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'rgba(28,18,8,0.65)', color: '#fff',
    padding: '7px 14px', borderRadius: 'var(--radius-xs)',
    fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
    backdropFilter: 'blur(4px)', border: 'none',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 'calc(var(--bottom-nav-h) + 16px)',
    }}>

      {/* Gallery file inputs only — camera uses getUserMedia (see CameraCapture). */}
      <input ref={galleryRef} type="file" accept="image/*" style={hiddenInput} onChange={handleFile} />
      <input ref={changeGalleryRef} type="file" accept="image/*" style={hiddenInput} onChange={handleFile} />

      {/* ── HEADER ── */}
      <div style={{ padding: '20px 16px 0' }} className="animate-fadeUp">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 4 }}>
          Snap Ingredients
        </h1>
        <p style={{ color: 'var(--color-text-2)', fontSize: 'var(--text-sm)' }}>
          Photo your ingredients or type them below to find recipes.
        </p>
      </div>

      {/* ── DROP ZONE ── */}
      <div style={{ padding: '16px 16px 0' }} className="animate-fadeUp">
        <div style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          border: `2px dashed ${image ? 'var(--color-accent)' : 'var(--color-border-strong)'}`,
          background: image ? 'transparent' : 'var(--color-surface)',
          height: 220,
          overflow: 'hidden',
          transition: 'border-color 0.2s',
        }}>
          {image ? (
            <>
              <img src={image} alt="Ingredients" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

              {/* X — delete photo */}
              <button
                type="button"
                onClick={clearImage}
                style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'rgba(28,18,8,0.65)', color: '#fff',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <X size={17} />
              </button>

              {/* Retake / Change */}
              <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button type="button" style={overlayBtn} onClick={() => setCameraOpen(true)}>
                  <Camera size={13} /> Retake
                </button>
                <button type="button" style={overlayBtn} onClick={() => changeGalleryRef.current.click()}>
                  <Upload size={13} /> Change
                </button>
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', gap: 12, padding: 24,
            }}>
              <div style={{
                width: 64, height: 64,
                background: 'var(--color-primary-light)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Camera size={28} color="var(--color-primary)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--color-text)', marginBottom: 2 }}>
                  Take a photo
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-3)' }}>
                  or upload from gallery
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setCameraOpen(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'var(--color-primary)', color: '#fff',
                    padding: '10px 18px', borderRadius: 'var(--radius-xs)',
                    fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
                    border: 'none', boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <Camera size={15} /> Camera
                </button>
                <button
                  type="button"
                  onClick={() => galleryRef.current.click()}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'var(--color-surface-2)', color: 'var(--color-text)',
                    padding: '10px 18px', borderRadius: 'var(--radius-xs)',
                    fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <Upload size={15} /> Gallery
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ADD INGREDIENTS ── */}
      <div style={{ padding: '14px 16px 0' }} className="animate-fadeUp delay-1">
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '18px 16px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--color-text)' }}>
              Add Ingredients
            </p>
            <span style={{
              fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 600,
              background: 'var(--color-primary-light)', padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
            }}>
              AI backup
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              type="text"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              onKeyDown={handleManualKeyDown}
              placeholder="e.g. tomato, chicken, garlic..."
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
              onClick={addManualIngredient}
              disabled={!manualInput.trim()}
              style={{
                width: 38, height: 38, flexShrink: 0,
                borderRadius: 'var(--radius-md)',
                background: manualInput.trim() ? 'var(--color-primary)' : 'var(--color-surface-2)',
                color: manualInput.trim() ? '#fff' : 'var(--color-text-3)',
                border: '1px solid var(--color-border)',
                cursor: manualInput.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          {manualIngredients.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {manualIngredients.map(ing => (
                <span key={ing} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                  padding: '4px 10px', borderRadius: 'var(--radius-xs)',
                  fontSize: 'var(--text-xs)', fontWeight: 600,
                }}>
                  {ing}
                  <button
                    type="button"
                    onClick={() => setManualIngredients(prev => prev.filter(i => i !== ing))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: 0, display: 'flex', lineHeight: 1 }}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={13} /> Use correct spellings only
          </p>
        </div>
      </div>

      {/* ── TIPS ── */}
      <div style={{ padding: '14px 16px 0' }} className="animate-fadeUp delay-2">
        <div style={{
          background: 'var(--color-warning-light)', border: '1px solid var(--color-warning)',
          borderRadius: 'var(--radius-md)', padding: '12px 14px',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <Lightbulb size={18} color="#7A5500" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)', lineHeight: 1.5 }}>
            <strong>Tip:</strong> Lay ingredients flat on a light surface for best AI results. Use manual entry if AI is unavailable.
          </p>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: '16px 16px 0' }} className="animate-fadeUp delay-3">
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
        {!canFind && (
          <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginTop: 8 }}>
            Add a photo or enter ingredients to get started
          </p>
        )}
      </div>

      <CameraCapture open={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={handleCameraCapture} />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
