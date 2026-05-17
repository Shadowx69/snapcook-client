import { useNavigate } from 'react-router-dom';

export default function SectionHeader({ title, icon: Icon, linkTo, linkLabel = 'See All' }) {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {Icon && <Icon size={18} color="var(--color-primary)" strokeWidth={2} />}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-lg)',
          fontWeight: 600,
          color: 'var(--color-text)',
        }}>
          {title}
        </h2>
      </div>
      {linkTo && (
        <button
          onClick={() => navigate(linkTo)}
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--color-primary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          {linkLabel}
        </button>
      )}
    </div>
  );
}
