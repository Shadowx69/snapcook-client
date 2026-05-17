import { api } from './client';

function normalizeActivity(items = []) {
  return items.map(a => ({
    _id: a._id,
    action: a.type === 'cooked' ? 'Cooked'
          : a.type === 'saved'  ? 'Saved'
          : a.type === 'opened' ? 'Opened'
          : 'Rated',
    recipe: a.recipeId?.title ?? 'Unknown Recipe',
    recipeId: a.recipeId?._id || a.recipeId,
    date: a.timestamp
      ? new Date(a.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : '',
    rating: a.rating ?? null,
  }));
}

export const usersApi = {
  sync: (data) => api.post('/users/sync', data),
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  getPreferences: () => api.get('/users/me/preferences'),
  updatePreferences: (data) => api.put('/users/me/preferences', data),
  getActivity: () => api.get('/users/me/activity').then(normalizeActivity),
  getSaved: () => api.get('/users/me/saved'),
  saveRecipe: (recipeId) => api.post(`/users/me/saved/${recipeId}`),
  unsaveRecipe: (recipeId) => api.delete(`/users/me/saved/${recipeId}`),
  logCooked: (recipeId) => api.post(`/users/me/cooked/${recipeId}`),
  logOpened: (recipeId) => api.post(`/users/me/opened/${recipeId}`),
  deleteAccount: () => api.delete('/users/me'),
};
