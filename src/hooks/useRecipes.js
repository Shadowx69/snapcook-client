import { useState, useCallback } from 'react';
import { recipesApi } from '../api/recipes';
import { useFetch } from './useFetch';

export function useFeaturedRecipe() {
  return useFetch(() => recipesApi.getFeatured(), []);
}

export function useFeaturedRecipes() {
  return useFetch(() => recipesApi.getFeaturedList(), []);
}

export function useTrendingRecipes() {
  return useFetch(() => recipesApi.getTrending(), []);
}

export function useQuickRecipes() {
  return useFetch(() => recipesApi.getQuick(), []);
}

// Pulls a small mix of recipes for each of the user's favourite cuisines.
// Cuisine names from the Preferences UI ("Pakistani", "Middle Eastern", …)
// are lowercased to match the slug format the backend stores on Recipe.cuisine.
// Results are interleaved round-robin so the row reads as a mix, not blocks
// of one cuisine. Returns [] when no cuisines are passed.
export function useFavouriteCuisineRecipes(cuisines) {
  const key = (cuisines || []).map(c => String(c).toLowerCase()).sort().join('|');
  return useFetch(async () => {
    if (!Array.isArray(cuisines) || cuisines.length === 0) return [];
    const slugs = cuisines.map(c => String(c).toLowerCase());
    const results = await Promise.all(
      slugs.map(slug => recipesApi.getAll({ cuisine: slug, limit: 6 }).catch(() => []))
    );
    const seen = new Set();
    const out = [];
    const max = Math.max(0, ...results.map(r => r.length));
    for (let i = 0; i < max; i++) {
      for (const arr of results) {
        const r = arr[i];
        if (r && !seen.has(r._id)) { seen.add(r._id); out.push(r); }
      }
    }
    return out.slice(0, 12);
  }, [key]);
}

export function useRecipes(params = {}) {
  const key = JSON.stringify(params);
  return useFetch(() => recipesApi.getAll(params), [key]);
}

export function useRecipeById(id) {
  return useFetch(() => recipesApi.getById(id), [id]);
}

export function useRecipeSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (q, filters = {}) => {
    if (!q?.trim()) { setResults([]); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await recipesApi.search(q, filters);
      setResults(data || []);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}

export function useRecipeReviews(recipeId) {
  return useFetch(() => recipesApi.getReviews(recipeId), [recipeId]);
}
