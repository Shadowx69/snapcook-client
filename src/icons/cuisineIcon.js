// Slug -> lucide icon component map.
// The backend Cuisine.emoji and Collection.emoji fields are ignored; the frontend
// renders these icons instead so we get consistent, themable SVGs.
import {
  Pizza, Wheat, Drumstick, Soup, Leaf, Flame, Beef, Croissant, Fish,
  Sandwich, UtensilsCrossed, Timer, Heart, Smile, Refrigerator, Wallet,
  BookOpen,
} from 'lucide-react';

const CUISINE = {
  italian:          Pizza,
  pakistani:        Wheat,
  mexican:          Drumstick,
  chinese:          Soup,
  thai:             Leaf,
  indian:           Flame,
  american:         Beef,
  french:           Croissant,
  japanese:         Fish,
  'middle-eastern': Sandwich,
};

const COLLECTION = {
  'under-30':     Timer,
  'date-night':   Heart,
  'kid-friendly': Smile,
  'meal-prep':    Refrigerator,
  comfort:        Soup,
  budget:         Wallet,
};

export function getCuisineIcon(slug) {
  if (!slug) return UtensilsCrossed;
  return CUISINE[String(slug).toLowerCase()] || UtensilsCrossed;
}

export function getCollectionIcon(slug) {
  if (!slug) return BookOpen;
  return COLLECTION[String(slug).toLowerCase()] || BookOpen;
}
