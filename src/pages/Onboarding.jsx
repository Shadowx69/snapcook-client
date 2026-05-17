import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Camera, BookOpen, Calendar, ArrowRight, Check,
  UtensilsCrossed, Sprout, Beef, Wheat,
} from 'lucide-react';
import { usersApi } from '../api/users';
import OnboardingDecor from '../components/OnboardingDecor';

const slides = [
  {
    icon: Camera,
    title: 'Snap Your Ingredients',
    subtitle: 'Point your camera at any ingredient and let SnapCook do the magic.',
    bg: 'linear-gradient(160deg, #C84B31 0%, #E8845A 100%)',
  },
  {
    icon: BookOpen,
    title: 'Get Instant Recipes',
    subtitle: 'Receive personalised recipe suggestions with step-by-step guidance tailored to your diet.',
    bg: 'linear-gradient(160deg, #4A7C59 0%, #6AAD7E 100%)',
  },
  {
    icon: Calendar,
    title: 'Plan Your Whole Week',
    subtitle: 'Schedule meals, track nutrition, and keep your week delicious and organised.',
    bg: 'linear-gradient(160deg, #5A7FA8 0%, #7AAAD8 100%)',
    hasDietPicker: true,
  },
];

const dietOptions = [
  { id: 'none',        label: 'No Restrictions', icon: UtensilsCrossed },
  { id: 'vegan',       label: 'Vegan',           icon: Sprout },
  { id: 'keto',        label: 'Keto',            icon: Beef },
  { id: 'gluten-free', label: 'Gluten Free',     icon: Wheat },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [current, setCurrent] = useState(0);
  const [diet, setDiet] = useState('none');
  const slide = slides[current];
  const isLast = current === slides.length - 1;

  async function finish() {
    try {
      await usersApi.updatePreferences({ diet });
      await usersApi.updateMe({ onboarded: true });
      await refreshUser();
    } catch (err) {
      console.error("Failed to save onboarding data:", err);
    }
    navigate('/', { replace: true });
  }


  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
      background: slide.bg,
      display: 'flex', flexDirection: 'column',
      transition: 'background 0.5s ease',
      overflowY: 'auto',
    }}>
      {/* Abstract geometric decoration */}
      <OnboardingDecor />

      {/* Skip */}
      <button
        onClick={finish}
        style={{
          position: 'absolute', top: 20, right: 20,
          color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.15)',
          border: 'none', borderRadius: 'var(--radius-xs)',
          padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'var(--font-body)',
          backdropFilter: 'blur(8px)',
        }}
      >
        Skip
      </button>

      {/* Content — natural height so it doesn't fight with bottom bar */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        padding: '64px 24px 16px',
        animation: 'fadeUp 0.5s ease',
      }}>
        {/* Hero icon */}
        <slide.icon size={72} color="#fff" strokeWidth={1.5} style={{ marginBottom: 14, flexShrink: 0 }} />

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          fontWeight: 700, color: '#fff',
          textAlign: 'center', lineHeight: 1.2,
          marginBottom: 8,
        }}>
          {slide.title}
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.82)',
          fontSize: 'var(--text-md)',
          textAlign: 'center', lineHeight: 1.6,
          maxWidth: 320, marginBottom: 16,
        }}>
          {slide.subtitle}
        </p>

        {/* Diet picker on last slide */}
        {slide.hasDietPicker && (
          <div style={{ width: '100%', maxWidth: 320 }}>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 12, textAlign: 'center', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Your diet preference
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {dietOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setDiet(opt.id)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: `2px solid ${diet === opt.id ? '#fff' : 'rgba(255,255,255,0.3)'}`,
                    background: diet === opt.id ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: 'var(--text-sm)', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'all 0.2s',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <opt.icon size={22} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Spacer: pushes bottom bar down on tall screens; collapses on small ones */}
      <div style={{ flex: 1, minHeight: 12 }} />

      {/* Bottom controls — always reachable at end of scroll */}
      <div style={{
        flexShrink: 0,
        padding: '12px 24px 28px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === current ? '#fff' : 'rgba(255,255,255,0.35)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={() => isLast ? finish() : setCurrent(c => c + 1)}
          style={{
            width: '100%', maxWidth: 320,
            padding: '16px 28px',
            borderRadius: 'var(--radius-xs)',
            background: '#fff',
            color: 'var(--color-primary)',
            fontSize: 'var(--text-md)', fontWeight: 700,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'var(--font-body)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.22)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)'; }}
        >
          {isLast ? 'Get Started' : 'Next'}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
