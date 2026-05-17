// Renders a lucide icon with a tint color but NO background container.
// The `size` / `iconSize` / `tint` API is preserved so all existing call sites work.
const TINT_COLORS = {
  primary: 'var(--color-primary)',
  accent:  'var(--color-accent)',
  warning: 'var(--color-warning)',
  success: 'var(--color-success)',
  neutral: 'var(--color-text-3)',
};

export default function IconTile({
  icon: Icon,
  size = 40,
  iconSize,
  tint = 'primary',
  strokeWidth = 2,
  style = {},
  className = '',
  onClick,
  ariaLabel,
  hover, // ignored — kept for backwards-compat with old call sites
}) {
  if (!Icon) return null;
  const color = TINT_COLORS[tint] || TINT_COLORS.primary;
  const renderSize = iconSize ?? size;
  return (
    <Icon
      size={renderSize}
      strokeWidth={strokeWidth}
      color={color}
      onClick={onClick}
      aria-label={ariaLabel}
      className={className}
      style={{ flexShrink: 0, cursor: onClick ? 'pointer' : undefined, ...style }}
    />
  );
}
