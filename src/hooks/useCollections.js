import { collectionsApi } from '../api/collections';
import { recipesApi } from '../api/recipes';
import { useFetch } from './useFetch';

export function useCollections() {
  return useFetch(() => collectionsApi.getAll(), []);
}

// Fetches up to `limit` top-rated recipes for each collection id in parallel.
// Returns { [collectionId]: Recipe[] }
export function useAllCollectionRecipes(collectionIds, limit = 6) {
  const key = (collectionIds || []).join('|');
  return useFetch(async () => {
    if (!collectionIds?.length) return {};
    const results = await Promise.all(
      collectionIds.map(id =>
        recipesApi.getAll({ collection: id, limit, sort: 'rating' }).catch(() => [])
      )
    );
    return Object.fromEntries(collectionIds.map((id, i) => [id, results[i] || []]));
  }, [key]);
}
