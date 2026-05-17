import { ChefHat } from 'lucide-react';

// Brand mark: just the chef-hat glyph in the primary accent color, no background.
export default function BrandMark({ size = 48, color = 'var(--color-primary)', style = {} }) {
  return (
    <ChefHat
      size={size}
      color={color}
      strokeWidth={2}
      style={{ flexShrink: 0, ...style }}
    />
  );
}
