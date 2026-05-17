import BrandMark from './BrandMark';

export default function Spinner({ size = 24, style = {} }) {
  return (
    <>
      <style>{`@keyframes _spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: size, height: size,
        border: `3px solid var(--color-border)`,
        borderTop: `3px solid var(--color-primary)`,
        borderRadius: '50%',
        animation: '_spin 0.8s linear infinite',
        flexShrink: 0,
        ...style,
      }} />
    </>
  );
}

// Full-viewport loader. position:fixed + inset:0 keeps it centred on the screen
// regardless of which DOM context PageLoader is rendered into (page body,
// tab panel, modal, etc.) and stays put while the user scrolls.
export function PageLoader() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      background: 'var(--color-bg)',
      zIndex: 100,
    }}>
      <BrandMark size={48} />
      <Spinner size={24} />
    </div>
  );
}
