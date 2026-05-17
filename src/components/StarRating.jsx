import { Star } from 'lucide-react';

export default function StarRating({ rating, max = 5, size = 14, interactive = false, onRate }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <span
            key={i}
            onClick={() => interactive && onRate?.(i + 1)}
            style={{ cursor: interactive ? 'pointer' : 'default', position: 'relative', display: 'inline-flex' }}
          >
            <Star
              size={size}
              style={{
                fill: filled || half ? 'var(--color-warning)' : 'transparent',
                color: filled || half ? 'var(--color-warning)' : 'var(--color-border-strong)',
                transition: 'all 0.15s',
              }}
            />
          </span>
        );
      })}
    </div>
  );
}
