const persistentMediaUrlCache = new Map<string, string>();
const pendingPersistentMediaUrlCache = new Map<string, Promise<string>>();

export const getPersistentMediaUrlSync = (url: string | null | undefined) => {
  if (!url) {
    return null;
  }

  return persistentMediaUrlCache.get(url) ?? null;
};

export const ensurePersistentMediaUrl = async (url: string) => {
  if (!url || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }

  const cachedUrl = persistentMediaUrlCache.get(url);

  if (cachedUrl) {
    return cachedUrl;
  }

  const pendingUrl = pendingPersistentMediaUrlCache.get(url);

  if (pendingUrl) {
    return pendingUrl;
  }

  const nextUrlPromise = fetch(url, { cache: 'force-cache' })
    .then(async response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      persistentMediaUrlCache.set(url, objectUrl);
      return objectUrl;
    })
    .catch(error => {
      console.error(`Failed to keep media asset in memory: ${url}`, error);
      persistentMediaUrlCache.set(url, url);
      return url;
    })
    .finally(() => {
      pendingPersistentMediaUrlCache.delete(url);
    });

  pendingPersistentMediaUrlCache.set(url, nextUrlPromise);
  return nextUrlPromise;
};
