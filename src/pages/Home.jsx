import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Clock, Star, Flame, Zap, Globe2, ClipboardList,
  UtensilsCrossed, Heart, Calendar, Sun, CloudSun, Moon,
} from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import SectionHeader from '../components/SectionHeader';
import StarRating from '../components/StarRating';
import Toast from '../components/Toast';
import IconTile from '../components/IconTile';
import { PageLoader } from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';
import { useAuth } from '../context/AuthContext';
import { useFeaturedRecipes, useTrendingRecipes, useQuickRecipes, useFavouriteCuisineRecipes } from '../hooks/useRecipes';
import { useCuisines } from '../hooks/useCuisine';
import { useCollections } from '../hooks/useCollections';
import { useProfile } from '../hooks/useProfile';
import { useTheme } from '../context/ThemeContext';
import { mealPlannerApi } from '../api/mealPlanner';
import heroBg from '../assets/gradient.webp';

const MEAL_ICON_COMPONENTS = { breakfast: Sun, lunch: CloudSun, dinner: Moon };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { prefix: 'Good', word: 'morning' };
  if (h < 17) return { prefix: 'Good', word: 'afternoon' };
  return { prefix: 'Good', word: 'evening' };
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { primaryColor } = useTheme();
  const [toast, setToast] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [featuredPaused, setFeaturedPaused] = useState(false);

  const { data: profileData } = useProfile();
  const { data: featuredList, loading: featuredLoading, error: featuredError, refetch: refetchFeatured } = useFeaturedRecipes();
  const { data: trending, loading: trendingLoading } = useTrendingRecipes();
  const { data: quick, loading: quickLoading } = useQuickRecipes();
  const { data: cuisines, loading: cuisinesLoading } = useCuisines();
  const { data: collections } = useCollections();
  const favCuisines = user?.preferences?.favCuisines || [];
  const { data: favCuisineRecipes, loading: favCuisineLoading } = useFavouriteCuisineRecipes(favCuisines);

  // Meal-days-this-week counter
  const [mealDays, setMealDays] = useState(0);
  useEffect(() => {
    mealPlannerApi.get().then(data => {
      const slots = data?.slots || data || [];
      // Count distinct days (ISO date strings) that have ≥1 meal slot
      const days = new Set();
      const arr = Array.isArray(slots) ? slots : Object.values(slots);
      arr.forEach(slot => {
        if (slot && slot.day) days.add(slot.day);
        else if (slot && slot.date) days.add(slot.date);
      });
      // Also handle object-keyed format { "Monday": { breakfast, lunch, dinner }, ... }
      if (!Array.isArray(slots)) {
        Object.entries(slots).forEach(([day, meals]) => {
          if (meals && typeof meals === 'object' && Object.values(meals).some(Boolean)) {
            days.add(day);
          }
        });
      }
      setMealDays(days.size);
    }).catch(() => { });
  }, []);

  // One featured recipe per cuisine, in seed order.
  const featuredSlides = useMemo(() => {
    if (!Array.isArray(featuredList)) return [];
    const seen = new Set();
    const out = [];
    for (const r of featuredList) {
      if (!r?.cuisine || seen.has(r.cuisine)) continue;
      seen.add(r.cuisine);
      out.push(r);
    }
    return out;
  }, [featuredList]);

  const featuredScrollRef = useRef(null);

  // Auto-advance the carousel every 3 s, unless hovered.
  useEffect(() => {
    if (featuredSlides.length < 2 || featuredPaused) return;
    const id = setInterval(() => {
      setFeaturedIndex(i => {
        const nextIndex = (i + 1) % featuredSlides.length;
        if (featuredScrollRef.current) {
          featuredScrollRef.current.scrollTo({
            left: nextIndex * featuredScrollRef.current.clientWidth,
            behavior: 'smooth'
          });
        }
        return nextIndex;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [featuredSlides.length, featuredPaused]);

  // Clamp index if the slide list shrinks (e.g. on refetch).
  useEffect(() => {
    if (featuredIndex >= featuredSlides.length && featuredSlides.length > 0) {
      setFeaturedIndex(0);
      if (featuredScrollRef.current) {
        featuredScrollRef.current.scrollTo({ left: 0, behavior: 'auto' });
      }
    }
  }, [featuredSlides.length, featuredIndex]);

  const handleFeaturedScroll = (e) => {
    const el = e.target;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== featuredIndex) {
      setFeaturedIndex(index);
    }
  };

  const displayName = user?.displayName?.split(' ')[0] || 'Chef';
  const stats = profileData?.stats;
  const todayPlan = profileData?.todayPlan || {};

  if (featuredLoading && trendingLoading) return <PageLoader />;

  return (
    <div style={{ paddingBottom: 'calc(var(--bottom-nav-h) + 20px)', background: 'var(--color-bg)' }}>

      {/* ── A. GREETING HEADER ── */}
      <div className="animate-fadeUp" style={{ padding: '20px 16px 4px' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-3)', fontWeight: 500, marginBottom: 2 }}>
          {getGreeting().prefix}{' '}
          <span style={{ color: primaryColor, fontWeight: 700 }}>{getGreeting().word}</span>,
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2 }}>
          {displayName}!
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)', marginTop: 2 }}>What are you cooking today?</p>
      </div>

      {/* ── B. HERO SNAP BANNER ── */}
      <div className="animate-fadeUp delay-1" style={{ margin: '16px 16px 0', position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-lg)', backgroundColor: '#8A2E1A', backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', padding: '24px 20px 24px', minHeight: 150, cursor: 'pointer' }}
        onClick={() => navigate('/snap')}
      >
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 4 }}>Got ingredients?</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: '#fff', fontWeight: 700, marginBottom: 16, lineHeight: 1.2, whiteSpace: 'pre-line' }}>
          {'Snap & Cook\nin seconds'}
        </h2>
        <button
          onClick={e => { e.stopPropagation(); navigate('/snap'); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: 'var(--color-primary)', padding: '10px 20px', borderRadius: 'var(--radius-xs)', fontSize: 'var(--text-sm)', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
        >
          <Camera size={16} /> Snap Now
        </button>
      </div>

      <div className="animate-fadeUp delay-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, margin: '20px 16px 10px' }}>
        {[
          { icon: UtensilsCrossed, tint: 'var(--color-primary)', value: stats?.recipiesTried ?? 0, label: 'Tried', action: () => navigate('/profile') },
          { icon: Heart, tint: 'var(--color-success)', value: stats?.savedRecipes ?? 0, label: 'Saved', action: () => navigate('/profile') },
          { icon: Calendar, tint: 'var(--color-warning)', value: `${mealDays}/7`, label: 'Meal days', action: () => navigate('/meal-planner') },
        ].map(stat => (
          <div key={stat.label} onClick={stat.action}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.15s', padding: '8px 0' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
          >
            <stat.icon size={22} color={stat.tint} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', marginTop: 4, fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── E. FEATURED RECIPE (carousel — one per cuisine) ── */}
      <div className="animate-fadeUp delay-3" style={{ margin: '20px 16px 0' }}>
        <SectionHeader title="Featured" icon={Star} />
        {featuredError ? (
          <ErrorBanner message="Couldn't load featured recipe." onRetry={refetchFeatured} />
        ) : featuredSlides.length > 0 ? (
          <>
            <div
              style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', position: 'relative' }}
              onMouseEnter={() => setFeaturedPaused(true)}
              onMouseLeave={() => setFeaturedPaused(false)}
              onTouchStart={() => setFeaturedPaused(true)}
              onTouchEnd={() => setFeaturedPaused(false)}
            >
              <div
                ref={featuredScrollRef}
                onScroll={handleFeaturedScroll}
                style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
              >
                <style>{`::-webkit-scrollbar { display: none; }`}</style>
                {featuredSlides.map(r => (
                  <div
                    key={r._id}
                    onClick={() => navigate(`/recipe/${r._id}`)}
                    style={{ flex: '0 0 100%', scrollSnapAlign: 'start', background: r.gradient, position: 'relative', cursor: 'pointer', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
                  >
                    {r.image && (
                      <img src={r.image} alt={r.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                    )}
                    <div style={{ position: 'relative', background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.1) 70%, transparent 100%)', padding: '20px 16px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                        <span className="badge badge-warning"><Clock size={10} /> {r.time} min</span>
                        <span className="badge badge-primary">{r.difficulty}</span>
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: '#fff', fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>{r.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <StarRating rating={r.rating} size={14} />
                          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--text-sm)' }}>{r.rating} ({r.reviewCount})</span>
                        </div>
                        <button onClick={e => { e.stopPropagation(); navigate(`/recipe/${r._id}`); }} style={{ background: '#fff', color: 'var(--color-primary)', padding: '8px 16px', borderRadius: 'var(--radius-xs)', fontSize: 'var(--text-sm)', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                          Cook Now →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {featuredSlides.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
                {featuredSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setFeaturedIndex(i);
                      if (featuredScrollRef.current) {
                        featuredScrollRef.current.scrollTo({
                          left: i * featuredScrollRef.current.clientWidth,
                          behavior: 'smooth'
                        });
                      }
                    }}
                    aria-label={`Go to slide ${i + 1}`}
                    style={{ width: i === featuredIndex ? 20 : 6, height: 6, borderRadius: 3, border: 'none', padding: 0, cursor: 'pointer', background: i === featuredIndex ? 'var(--color-primary)' : 'var(--color-border)', transition: 'width 0.3s, background 0.3s' }}
                  />
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* ── E2. YOUR FAVOURITE CUISINES — only renders when the user has picked some in /settings/preferences and at least one recipe exists for them. ── */}
      {favCuisines.length > 0 && !favCuisineLoading && favCuisineRecipes?.length > 0 && (
        <div className="animate-fadeUp delay-3" style={{ marginTop: 28, paddingLeft: 16 }}>
          <div style={{ paddingRight: 16 }}>
            <SectionHeader title="Your Favourite Cuisines" icon={Heart} linkTo="/explore" />
          </div>
          <div className="scroll-row" style={{ paddingRight: 16 }}>
            {favCuisineRecipes.map(r => (
              <RecipeCard key={r._id} recipe={r} variant="portrait" onSave={(id, isSaved) => setToast(isSaved ? 'Added to Favourites' : 'Removed from Favourites')} />
            ))}
          </div>
        </div>
      )}

      {/* ── F. TRENDING THIS WEEK ── */}
      {!trendingLoading && trending?.length > 0 && (
        <div className="animate-fadeUp delay-3" style={{ marginTop: 28, paddingLeft: 16 }}>
          <div style={{ paddingRight: 16 }}>
            <SectionHeader title="Trending" icon={Flame} linkTo="/recipes" />
          </div>
          <div className="scroll-row" style={{ paddingRight: 16 }}>
            {trending.map(r => (
              <RecipeCard key={r._id} recipe={r} variant="portrait" onSave={(id, isSaved) => setToast(isSaved ? 'Added to Favourites' : 'Removed from Favourites')} />
            ))}
          </div>
        </div>
      )}

      {/* ── G. QUICK & EASY ── */}
      {!quickLoading && quick?.length > 0 && (
        <div className="animate-fadeUp delay-4" style={{ marginTop: 28, paddingLeft: 16 }}>
          <div style={{ paddingRight: 16 }}>
            <SectionHeader title="Under 30 Min" icon={Zap} linkTo="/recipes" />
          </div>
          <div className="scroll-row" style={{ paddingRight: 16 }}>
            {quick.map(r => (
              <RecipeCard key={r._id} recipe={r} variant="portrait" onSave={(id, isSaved) => setToast(isSaved ? 'Added to Favourites' : 'Removed from Favourites')} />
            ))}
          </div>
        </div>
      )}

      {/* ── H. EXPLORE CUISINES ── */}
      {!cuisinesLoading && cuisines?.length > 0 && (
        <div className="animate-fadeUp delay-5" style={{ margin: '28px 16px 0' }}>
          <SectionHeader title="Explore Cuisines" icon={Globe2} linkTo="/explore" />
          {/* Pakistani featured row */}
          {(() => {
            const pk = cuisines.find(c => c.id === 'pakistani');
            return pk ? (
              <div
                onClick={() => navigate('/cuisine/pakistani')}
                style={{ borderRadius: 'var(--radius-md)', background: pk.gradient || 'linear-gradient(135deg,#1A5C28,#4AAA5C)', marginBottom: 10, cursor: 'pointer', minHeight: 90, boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                {pk.image && <img src={pk.image} alt="Pakistani" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 100%)' }} />
                <div style={{ position: 'relative', padding: '16px 18px', flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', fontSize: 'var(--text-md)', marginBottom: 2, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>Pakistani Kitchen</p>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'var(--text-xs)' }}>Biryani, Karahi, Nihari &amp; more · {pk.count} recipes</p>
                </div>
                <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 'var(--radius-xs)', padding: '4px 10px', fontSize: 'var(--text-xs)', fontWeight: 600, backdropFilter: 'blur(4px)' }}>NEW</span>
              </div>
            ) : null;
          })()}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
            {cuisines.filter(c => c.id !== 'pakistani').slice(0, 4).map(c => (
              <div key={c.id} onClick={() => navigate(`/cuisine/${c.id}`)} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', background: c.gradient, cursor: 'pointer', minHeight: 88, boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s', position: 'relative' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                {c.image && <img src={c.image} alt={c.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', fontSize: 'var(--text-sm)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{c.label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10 }}>{c.count} recipes</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/explore')} style={{ marginTop: 10, width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-2)', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-surface)'}
          >
            See all cuisines →
          </button>
        </div>
      )}

      {/* ── I. TODAY'S MEAL PLAN ── */}
      {todayPlan && Object.keys(todayPlan).length > 0 && (
        <div className="animate-fadeUp delay-5" style={{ margin: '28px 16px 0' }}>
          <SectionHeader title="Today's Plan" icon={ClipboardList} linkTo="/meal-planner" linkLabel="Edit Plan" />
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            {['breakfast', 'lunch', 'dinner'].map((meal, i) => {
              const recipe = todayPlan[meal];
              const MealIcon = MEAL_ICON_COMPONENTS[meal];
              return (
                <div key={meal} onClick={() => recipe ? navigate(`/recipe/${recipe._id}`) : navigate('/meal-planner')}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: i < 2 ? '1px solid var(--color-border)' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <IconTile icon={MealIcon} size={32} iconSize={16} tint="warning" />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 2 }}>{meal}</p>
                    {recipe
                      ? <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>{recipe.title}</p>
                      : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-3)', fontStyle: 'italic' }}>Not planned yet — tap to add</p>
                    }
                  </div>
                  {recipe && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>{recipe.calories} kcal</span>}
                  {!recipe && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>+ Add</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
