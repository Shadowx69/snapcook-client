import { cuisinesApi } from '../api/cuisines';
import { useFetch } from './useFetch';

export function useCuisines() {
  return useFetch(() => cuisinesApi.getAll(), []);
}

export function useCuisineById(id) {
  return useFetch(() => cuisinesApi.getById(id), [id]);
}

export function useCuisineRecipes(id, params = {}) {
  const key = JSON.stringify(params);
  return useFetch(() => cuisinesApi.getRecipes(id, params), [id, key]);
}
