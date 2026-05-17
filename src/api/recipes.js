import { api } from './client';

// Normalize a single recipe from backend shape → frontend shape.
// Backend: _id, nutrition:{kcal,protein,carbs,fat}, steps:[string], ingredients:[{name,amount}]
// Frontend: id, macros:{...}, steps:[{step,text,time}], ingredients (same but amount used)
function norm(r) {
  if (!r) return r;

  const n = r.nutrition || {};
  const macros = {
    protein: n.protein ?? 0,
    carbs:   n.carbs   ?? 0,
    fat:     n.fat     ?? 0,
    fiber:   n.fiber   ?? 0,
    sugar:   n.sugar   ?? 0,
    sodium:  n.sodium  ?? 0,
  };

  // Steps may be plain strings (from seed) or already {step,text,time} objects
  const steps = Array.isArray(r.steps)
    ? r.steps.map((s, i) =>
        typeof s === 'string'
          ? { step: i + 1, text: s, time: null }
          : s
      )
    : [];

  return { ...r, id: r.id ?? r._id, macros, steps };
}

// Backend GET /api/recipes returns { recipes, total, page, pages }.
// All callers expect a plain array, so we unwrap and normalize here.
function unwrap(result) {
  const arr = Array.isArray(result) ? result : (result?.recipes || []);
  return arr.map(norm);
}

export const recipesApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/recipes${qs ? `?${qs}` : ''}`).then(unwrap);
  },
  // Backend returns an array of featured recipes; consumers expect a single recipe.
  getFeatured: () =>
    api.get('/recipes/featured').then(res => {
      const arr = Array.isArray(res) ? res : (res?.recipes || []);
      return arr[0] ? norm(arr[0]) : null;
    }),
  getFeaturedList: () => api.get('/recipes/featured').then(unwrap),
  getTrending: () => api.get('/recipes/trending').then(unwrap),
  getQuick:    () => api.get('/recipes/quick').then(unwrap),
  getById:     (id) => api.get(`/recipes/${id}`).then(norm),
  // Backend uses ?search= on the main /recipes route, not a separate /search path.
  search: (q, filters = {}) => {
    const qs = new URLSearchParams({ search: q, ...filters }).toString();
    return api.get(`/recipes?${qs}`).then(unwrap);
  },
  getReviews:   (id) => api.get(`/recipes/${id}/reviews`),
  submitReview: (id, data) => api.post(`/recipes/${id}/reviews`, data),
};
