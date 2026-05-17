import { api } from './client';

export const mealPlannerApi = {
  get: () => api.get('/meal-planner'),
  savePlan: (slots) => api.post('/meal-planner', { slots }),
  updateSlot: (day, mealType, recipeId) =>
    api.put(`/meal-planner/${day}/${mealType}`, { recipeId }),
  removeSlot: (day, mealType) => api.delete(`/meal-planner/${day}/${mealType}`),
};
