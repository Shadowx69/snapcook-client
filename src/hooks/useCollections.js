import { collectionsApi } from '../api/collections';
import { useFetch } from './useFetch';

export function useCollections() {
  return useFetch(() => collectionsApi.getAll(), []);
}
