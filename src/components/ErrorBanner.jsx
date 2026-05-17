import { AlertTriangle } from 'lucide-react';
import IconTile from './IconTile';

export default function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      margin: '16px',
      padding: '16px',
      background: 'rgba(214,64,69,0.08)',
      border: '1px solid rgba(214,64,69,0.3)',
      borderRadius: 'var(--radius-md)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 10, textAlign: 'center',
    }}>
      <IconTile icon={AlertTriangle} size={56} iconSize={28} tint="warning" strokeWidth={1.75} />
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)', lineHeight: 1.5 }}>
        {message || 'Something went wrong. Please try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-secondary btn-sm"
        >
          Retry
        </button>
      )}
    </div>
  );
}
