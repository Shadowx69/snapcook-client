import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronDown, Send, BookOpen, Bug, Lightbulb, Star } from 'lucide-react';
import Toast from '../../components/Toast';
import IconTile from '../../components/IconTile';

const FAQS = [
  {
    q: 'How does the ingredient snap feature work?',
    a: 'Take a photo of your ingredients and SnapCook uses AI to identify them, then matches you with recipes you can actually make. The more ingredients visible in the photo, the better the suggestions.',
  },
  {
    q: 'Can I enter ingredients manually without a photo?',
    a: 'Yes. On the Snap screen, switch to Manual mode and type your ingredients one by one. SnapCook will search the same recipe database and return matching results.',
  },
  {
    q: 'How do I save a recipe?',
    a: 'Open any recipe and tap the bookmark icon in the top-right corner. Saved recipes appear in your Profile under the Saved tab and are available even when offline.',
  },
  {
    q: 'How do I track my cooking streak?',
    a: 'Complete a recipe using Cooking Mode and tap "Done" at the end. Each day you complete at least one recipe counts toward your streak. Cooking the same recipe twice in one day only counts as one day.',
  },
  {
    q: 'How do I change my dietary preferences or allergies?',
    a: 'Go to Settings → Preferences. Select your diet type (e.g. Vegetarian, Vegan), add any allergies, and choose your favourite cuisines. These filter your recipe recommendations across the whole app.',
  },
  {
    q: 'How do I use the Meal Planner?',
    a: 'Go to the Plan tab and tap any day slot (Breakfast, Lunch, or Dinner). You can search for a recipe or let SnapCook auto-generate a week of meals based on your preferences.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Go to Settings → Danger Zone → Delete Account. Tap once to see the confirmation, then tap again to confirm. Your account and all associated data are deleted immediately and cannot be recovered.',
  },
  {
    q: 'Why are some recipes not matching my snap?',
    a: 'Recipe matching is based on ingredients you have vs. what a recipe needs. If you only have 1 or 2 ingredients, results may be limited. Try adding more ingredients or use the search bar to find recipes by name.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. We only store what is necessary to run the app — your email, display name, saved recipes, and activity. We never sell your data. See our Privacy Policy in Settings for full details.',
  },
];

const CATEGORIES = ['General', 'Account', 'Recipes', 'Technical', 'Other'];

export default function Support() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ category: 'General', subject: '', message: '' });
  const [toast, setToast] = useState(null);

  function handleSend() {
    if (!form.subject.trim() || !form.message.trim()) {
      setToast('Please fill in the subject and message.');
      return;
    }
    setToast('Message sent! We\'ll get back to you as soon as possible.');
    setForm(f => ({ ...f, subject: '', message: '' }));
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 40 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
        <button onClick={() => navigate(-1)} style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-2)', flexShrink: 0 }}>
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700 }}>Help & Support</h1>
      </div>

      <div style={{ padding: '20px 16px 0' }}>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 24 }}>
          {[
            { icon: BookOpen,  tint: 'primary', label: 'User Guide',        sub: 'How-to articles' },
            { icon: Bug,       tint: 'warning', label: 'Report a Bug',      sub: 'Something broken?' },
            { icon: Lightbulb, tint: 'accent',  label: 'Suggest a Feature', sub: 'Your ideas matter' },
            { icon: Star,      tint: 'warning', label: 'Rate the App',      sub: 'Leave a review' },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => setToast(`Use the contact form below to ${item.label === 'Rate the App' ? 'share your rating' : item.label.toLowerCase()}.`)}
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px 14px', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}
            >
              <IconTile icon={item.icon} tint={item.tint} size={40} iconSize={20} style={{ marginBottom: 10 }} />
              <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text)', marginBottom: 2 }}>{item.label}</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>{item.sub}</p>
            </button>
          ))}
        </div>

        {/* FAQs */}
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
          Frequently Asked Questions
        </p>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 24 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)' }}
              >
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', flex: 1 }}>{faq.q}</span>
                {openFaq === i ? <ChevronDown size={16} color="var(--color-primary)" /> : <ChevronRight size={16} color="var(--color-text-3)" />}
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 16px 14px', animation: 'fadeUp 0.2s ease' }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)', lineHeight: 1.6 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact form */}
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
          Contact Support
        </p>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '20px 16px', boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Category</label>
            <div className="scroll-row" style={{ gap: 6 }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))} className={`pill-toggle${form.category === c ? ' active' : ''}`} style={{ fontSize: 'var(--text-xs)', flexShrink: 0 }}>{c}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Subject</label>
            <input
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="Brief description of your issue"
              style={{ width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 'var(--text-base)', fontFamily: 'var(--font-body)', color: 'var(--color-text)', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Message</label>
            <textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Describe your issue in detail…"
              rows={4}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 'var(--text-base)', fontFamily: 'var(--font-body)', color: 'var(--color-text)', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>
          <button onClick={handleSend} className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Send size={15} /> Send Message
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', lineHeight: 1.6 }}>
          You can also email us at{' '}
          <a href="mailto:support@snapcook.app" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>support@snapcook.app</a>
          {' '}· We typically reply within 24 hours.
        </p>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
