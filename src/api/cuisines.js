import { api } from './client';

// Backend fields: slug, name, imageUrl, recipeCount, gradient, emoji, color
// Frontend pages use:  id,  label, image, count,       gradient, emoji, color
function normalize(c) {
  return {
    ...c,
    id:    c.id    ?? c.slug,
    label: c.label ?? c.name,
    image: c.image ?? c.imageUrl ?? '',
    count: c.count ?? c.recipeCount ?? 0,
  };
}

export const cuisinesApi = {
  getAll: () =>
    api.get('/cuisines').then(arr =>
      Array.isArray(arr) ? arr.map(normalize) : []
    ),
  getById: (id) =>
    api.get(`/cuisines/${id}`).then(normalize),
  getRecipes: (id, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/cuisines/${id}/recipes${qs ? `?${qs}` : ''}`)
      .then(res => {
        const arr = Array.isArray(res) ? res : (res?.recipes || []);
        return arr.map(r => ({ ...r, id: r.id ?? r._id }));
      });
  },
};
