import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

export default function Toast({ message, onClose, duration = 2800 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--color-text)', color: '#fff',
      padding: '12px 18px', borderRadius: 'var(--radius-xs)',
      display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: 'var(--shadow-lg)',
      zIndex: 500, whiteSpace: 'nowrap',
      animation: 'slideUp 0.3s ease',
      fontSize: 'var(--text-sm)', fontWeight: 500,
    }}>
      <CheckCircle size={16} color="var(--color-accent)" />
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', marginLeft: 4, display: 'flex' }}>
        <X size={14} />
      </button>
    </div>
  );
}
