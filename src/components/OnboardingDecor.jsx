// Abstract decorative shapes for the onboarding slides.
// Replaces literal food-emoji clusters with soft geometric SVGs that adapt to any slide background.
export default function OnboardingDecor() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Large blurred gradient blobs */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-15%',
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)',
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-12%',
          right: '-18%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.13)',
          filter: 'blur(48px)',
        }}
      />

      {/* Concentric rings */}
      <svg
        style={{ position: 'absolute', top: '11%', right: '7%', opacity: 0.22 }}
        width="92"
        height="92"
        viewBox="0 0 92 92"
        fill="none"
      >
        <circle cx="46" cy="46" r="38" stroke="#fff" strokeWidth="1.6" />
        <circle cx="46" cy="46" r="24" stroke="#fff" strokeWidth="1.6" />
        <circle cx="46" cy="46" r="10" stroke="#fff" strokeWidth="1.6" />
      </svg>

      {/* Rounded square outline */}
      <svg
        style={{ position: 'absolute', bottom: '24%', left: '6%', opacity: 0.18 }}
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
      >
        <rect x="8" y="8" width="56" height="56" rx="16" stroke="#fff" strokeWidth="2" />
      </svg>

      {/* Soft filled dot */}
      <span
        style={{
          position: 'absolute',
          top: '46%',
          left: '8%',
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)',
          filter: 'blur(2px)',
        }}
      />

      {/* Tiny dot accent */}
      <span
        style={{
          position: 'absolute',
          top: '32%',
          right: '24%',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.5)',
        }}
      />

      {/* Diagonal line / arc */}
      <svg
        style={{ position: 'absolute', top: '60%', right: '14%', opacity: 0.14 }}
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
      >
        <path d="M10 110 Q60 10 110 80" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </div>
  );
}
