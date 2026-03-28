import { useEffect, useState } from 'react';
import {
  ensurePersistentMediaUrl,
  getPersistentMediaUrlSync,
} from '../lib/persistentMediaCache';

export const usePersistentMediaUrl = (
  url: string | null | undefined,
  enabled: boolean
) => {
  const [persistentUrl, setPersistentUrl] = useState<string | null | undefined>(
    () => getPersistentMediaUrlSync(url) ?? (enabled ? null : url)
  );

  useEffect(() => {
    setPersistentUrl(getPersistentMediaUrlSync(url) ?? (enabled ? null : url));

    if (!enabled || !url || typeof window === 'undefined') {
      return;
    }

    let cancelled = false;

    void ensurePersistentMediaUrl(url).then(nextUrl => {
      if (!cancelled) {
        setPersistentUrl(nextUrl);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, url]);

  return persistentUrl;
};
