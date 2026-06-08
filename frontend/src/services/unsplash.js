import apiClient from './apiClient';

export const categoryCache = new Map();

export async function fetchCategoryPhotos(category, city, count) {
  const key = `${category}:${city}:${count}`;
  if (categoryCache.has(key)) return categoryCache.get(key);
  try {
    const res = await apiClient.get('/proxy/search-images', {
      params: { query: `${category} ${city}`, per_page: count },
    });
    const urls = (res.data.images ?? []).map(img => img.thumb ?? null);
    categoryCache.set(key, urls);
    return urls;
  } catch (_) {
    categoryCache.set(key, []);
    return [];
  }
}

export async function fetchSinglePhoto(query, cacheKey) {
  const key = cacheKey ?? query;
  if (categoryCache.has(key)) return categoryCache.get(key);
  try {
    const res = await apiClient.get('/proxy/search-images', {
      params: { query, per_page: 1 },
    });
    const url = res.data.images?.[0]?.thumb ?? null;
    categoryCache.set(key, url);
    return url;
  } catch (_) {
    categoryCache.set(key, null);
    return null;
  }
}
