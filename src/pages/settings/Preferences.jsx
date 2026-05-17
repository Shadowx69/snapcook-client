import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, X, Salad, Beef, Leaf,
  UtensilsCrossed, AlertTriangle, Globe2,
  WheatOff, Activity, Bone
} from 'lucide-react';
import Toast from '../../components/Toast';
import IconTile from '../../components/IconTile';
import { usePreferences } from '../../hooks/useProfile';
import { useAuth } from '../../context/AuthContext';

const DIETS = [
  { id: 'none', label: 'No Restrictions', icon: UtensilsCrossed },
  { id: 'vegan', label: 'Vegan', icon: Leaf },
  { id: 'keto', label: 'Keto', icon: Beef },
  { id: 'gluten-free', label: 'Gluten-Free', icon: WheatOff },
  { id: 'low-carb', label: 'Low Carb', icon: Activity },
  { id: 'paleo', label: 'Paleo', icon: Bone },
];

const CUISINES_PREF = ['Pakistani', 'Italian', 'Mexican', 'Chinese', 'Indian', 'American', 'French', 'Japanese', 'Thai', 'Middle Eastern'];

export default function Preferences() {
  const navigate = useNavigate();
  const { preferences, savePreferences, saving } = usePreferences();
  const { refreshUser } = useAuth();
  const [diet, setDiet] = useState('none');
  const [allergies, setAllergies] = useState([]);
  const [favCuisines, setFavCuisines] = useState([]);
  const [toast, setToast] = useState(null);

  // Populate form from loaded preferences
  useEffect(() => {
    if (preferences) {
      setDiet(preferences.diet || 'none');
      setAllergies(preferences.allergies || []);
      setFavCuisines(preferences.favCuisines || []);
    }
  }, [preferences]);

  function toggleAllergy(a) {
    setAllergies(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  }
  function toggleCuisine(c) {
    setFavCuisines(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }

  async function handleSave() {
    try {
      await savePreferences({ diet, allergies, favCuisines });
    } catch (err) {
      console.error('Save error:', err);
      setToast(err?.message || 'Failed to save. Try again.');
      return;
    }
    // The save itself succeeded — a stale-user refresh failure should not surface as a save error.
    try { await refreshUser(); } catch (err) { console.warn('refreshUser after save failed:', err); }
    setToast('Preferences saved');
    setTimeout(() => navigate('/settings'), 1000);
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 40 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <button onClick={() => navigate(-1)} style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-2)' }}>
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700 }}>Preferences</h1>
        <button onClick={handleSave} disabled={saving} style={{ padding: '8px 18px', borderRadius: 'var(--radius-xs)', background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-body)', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div style={{ padding: '20px 16px 0' }}>

        {/* Diet */}
        <SectionCard title="Dietary Preference" icon={Salad}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            {DIETS.map(d => (
              <button key={d.id} onClick={() => setDiet(d.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: `1.5px solid ${diet === d.id ? 'var(--color-primary)' : 'var(--color-border)'}`, background: diet === d.id ? 'var(--color-primary-light)' : 'var(--color-surface)', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}>
                <IconTile icon={d.icon} tint={diet === d.id ? 'primary' : 'neutral'} size={32} iconSize={16} />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: diet === d.id ? 600 : 400, color: diet === d.id ? 'var(--color-primary)' : 'var(--color-text)' }}>{d.label}</span>
                {diet === d.id && <Check size={14} color="var(--color-primary)" style={{ marginLeft: 'auto' }} />}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Allergies */}
        <SectionCard title="Allergies & Intolerances" icon={AlertTriangle}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {allergies.map(a => (
              <span key={a} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 'var(--radius-xs)', background: 'rgba(214,64,69,0.1)', color: 'var(--color-error)', fontSize: 'var(--text-sm)', fontWeight: 500, fontFamily: 'var(--font-body)' }}>
                {a}
                <button onClick={() => toggleAllergy(a)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={14} /></button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Type an ingredient and press Enter"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const val = e.target.value.trim();
                if (val && !allergies.includes(val)) {
                  setAllergies([...allergies, val]);
                  e.target.value = '';
                }
              }
            }}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)', outline: 'none' }}
          />
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginTop: 10 }}>Recipes containing these ingredients will be hidden.</p>
        </SectionCard>

        {/* Favourite Cuisines */}
        <SectionCard title="Favourite Cuisines" icon={Globe2}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CUISINES_PREF.map(c => (
              <button key={c} onClick={() => toggleCuisine(c)} style={{ padding: '8px 14px', borderRadius: 'var(--radius-xs)', border: `1.5px solid ${favCuisines.includes(c) ? 'var(--color-primary)' : 'var(--color-border)'}`, background: favCuisines.includes(c) ? 'var(--color-primary-light)' : 'var(--color-surface)', color: favCuisines.includes(c) ? 'var(--color-primary)' : 'var(--color-text-2)', fontSize: 'var(--text-sm)', fontWeight: favCuisines.includes(c) ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}>
                {c}
              </button>
            ))}
          </div>
        </SectionCard>

      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '18px 16px', marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        {Icon && <Icon size={16} color="var(--color-primary)" />}
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)' }}>{title}</p>
      </div>
      {children}
    </div>
  );
}
