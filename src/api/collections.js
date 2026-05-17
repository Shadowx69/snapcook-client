import { api } from './client';

// Backend fields: slug, name, emoji, color, description
// Frontend pages use:  id,  label, emoji, color
function normalize(c) {
  return {
    ...c,
    id:    c.id    ?? c.slug,
    label: c.label ?? c.name,
  };
}

export const collectionsApi = {
  getAll: () =>
    api.get('/collections').then(arr =>
      Array.isArray(arr) ? arr.map(normalize) : []
    ),
  getRecipes: (id, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/collections/${id}/recipes${qs ? `?${qs}` : ''}`)
      .then(res => {
        const arr = Array.isArray(res) ? res : (res?.recipes || []);
        return arr.map(r => ({ ...r, id: r.id ?? r._id }));
      });
  },
};
