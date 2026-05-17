import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const SECTIONS = [
  { title: 'Information We Collect', body: 'We collect information you provide directly to us, such as your name, email address, and profile photo when you create an account. We also collect usage data including recipes you view, save, and cook.' },
  { title: 'How We Use Your Information', body: 'We use the information we collect to provide, personalise, and improve our services. This includes generating recipe recommendations, personalising your meal plans, and sending you relevant notifications.' },
  { title: 'Data Sharing', body: 'We do not sell your personal information. We may share your information with trusted third-party services that help us operate the platform, subject to strict confidentiality agreements.' },
  { title: 'Data Retention', body: 'We retain your personal information for as long as your account is active. You may request deletion of your data at any time by contacting our support team.' },
  { title: 'Cookies & Tracking', body: 'We use cookies and similar technologies to remember your preferences, understand how you use our service, and provide a personalised experience.' },
  { title: 'Security', body: 'We implement industry-standard security measures to protect your information. All data is encrypted in transit and at rest. However, no method of transmission over the internet is 100% secure.' },
  { title: 'Your Rights', body: 'You have the right to access, correct, or delete your personal information at any time. You may also opt out of marketing communications. Contact privacy@snapcook.app for any requests.' },
  { title: 'Contact Us', body: 'For any privacy-related questions or requests, please contact us at privacy@snapcook.app or write to SnapCook Ltd, London, United Kingdom.' },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 40 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
        <button onClick={() => navigate(-1)} style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-2)', flexShrink: 0 }}>
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700 }}>Privacy Policy</h1>
      </div>
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: 20, boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' }}>Last updated: 1 January 2026</p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)', marginTop: 8, lineHeight: 1.6 }}>
            At SnapCook, we value your privacy. This policy explains how we collect, use, and protect your personal information.
          </p>
        </div>
        {SECTIONS.map((s, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
              {i + 1}. {s.title}
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)', lineHeight: 1.7 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
