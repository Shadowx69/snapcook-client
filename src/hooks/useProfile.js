import { useState, useCallback } from 'react';
import { usersApi } from '../api/users';
import { useFetch } from './useFetch';

export function useProfile() {
  return useFetch(() => usersApi.getMe(), []);
}

export function useActivity() {
  return useFetch(() => usersApi.getActivity(), []);
}

export function useSavedRecipes() {
  const { data, loading, error, refetch } = useFetch(() => usersApi.getSaved(), []);
  const [toggling, setToggling] = useState(false);

  const toggleSave = useCallback(async (recipeId, isSaved) => {
    setToggling(true);
    try {
      if (isSaved) await usersApi.unsaveRecipe(recipeId);
      else await usersApi.saveRecipe(recipeId);
      await refetch();
    } finally {
      setToggling(false);
    }
  }, [refetch]);

  return { saved: data || [], loading, error, toggling, toggleSave, refetch };
}

export function usePreferences() {
  const { data, loading, error, refetch } = useFetch(() => usersApi.getPreferences(), []);
  const [saving, setSaving] = useState(false);

  const savePreferences = useCallback(async (prefs) => {
    setSaving(true);
    try {
      await usersApi.updatePreferences(prefs);
      await refetch();
    } finally {
      setSaving(false);
    }
  }, [refetch]);

  return { preferences: data, loading, error, saving, savePreferences };
}
