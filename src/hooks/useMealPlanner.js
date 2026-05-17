import { useState, useCallback } from 'react';
import { mealPlannerApi } from '../api/mealPlanner';
import { useFetch } from './useFetch';

// Backend stores slots as an array: [{ day, mealType, recipeId }]
// MealPlanner page expects: { Mon: { breakfast: recipe, lunch: recipe, ... }, ... }
function slotsToMap(slots = []) {
  const map = {};
  for (const slot of slots) {
    if (!map[slot.day]) map[slot.day] = {};
    map[slot.day][slot.mealType] = slot.recipeId ?? null;
  }
  return map;
}

// Convert nested plan map back to slots array for backend POST
function planToSlots(plan) {
  const slots = [];
  for (const day of Object.keys(plan)) {
    for (const mealType of Object.keys(plan[day])) {
      const recipeId = plan[day][mealType];
      if (recipeId) slots.push({ day, mealType, recipeId });
    }
  }
  return slots;
}

export function useMealPlanner() {
  const { data, loading, error, refetch } = useFetch(() => mealPlannerApi.get(), []);
  const [saving, setSaving] = useState(false);

  const plan = slotsToMap(data?.slots);

  const updateSlot = useCallback(async (day, slot, recipeId) => {
    setSaving(true);
    try {
      await mealPlannerApi.updateSlot(day, slot, recipeId);
      await refetch();
    } finally {
      setSaving(false);
    }
  }, [refetch]);

  const removeSlot = useCallback(async (day, slot) => {
    setSaving(true);
    try {
      await mealPlannerApi.removeSlot(day, slot);
      await refetch();
    } finally {
      setSaving(false);
    }
  }, [refetch]);

  const savePlan = useCallback(async (planMap) => {
    setSaving(true);
    try {
      await mealPlannerApi.savePlan(planToSlots(planMap));
      await refetch();
    } finally {
      setSaving(false);
    }
  }, [refetch]);

  return { plan, loading, error, saving, updateSlot, removeSlot, savePlan, refetch };
}
