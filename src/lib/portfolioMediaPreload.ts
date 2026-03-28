import {
  fetchPortfolioItems,
  PortfolioMediaTarget,
  resolveWorkItemMedia,
} from './portfolioMedia';
import { ensurePersistentMediaUrl } from './persistentMediaCache';

const PREFETCH_CONCURRENCY = 3;
const prefetchedUrls = new Set<string>();
const preconnectedOrigins = new Set<string>();
const prefetchedDocuments = new Set<string>();
let preloadStarted = false;

const preconnectUrl = (url: string) => {
  if (typeof document === 'undefined') {
    return;
  }

  const origin = new URL(url).origin;

  if (preconnectedOrigins.has(origin)) {
    return;
  }

  preconnectedOrigins.add(origin);

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = origin;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

const prefetchDocument = (url: string) => {
  if (typeof document === 'undefined' || prefetchedDocuments.has(url)) {
    return;
  }

  prefetchedDocuments.add(url);

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'document';
  link.href = url;
  document.head.appendChild(link);
};

const prefetchTarget = async ({ kind, url }: PortfolioMediaTarget) => {
  if (typeof window === 'undefined' || prefetchedUrls.has(url)) {
    return;
  }

  prefetchedUrls.add(url);
  preconnectUrl(url);

  if (kind === 'document') {
    prefetchDocument(url);
    return;
  }

  await ensurePersistentMediaUrl(url);
};

const preloadTargets = async (targets: PortfolioMediaTarget[]) => {
  const uniqueTargets = targets.filter(({ url }, index) => {
    return targets.findIndex(target => target.url === url) === index;
  });

  let nextIndex = 0;
  const workerCount = Math.min(PREFETCH_CONCURRENCY, uniqueTargets.length);

  const workers = Array.from({ length: workerCount }, async () => {
    while (nextIndex < uniqueTargets.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      await prefetchTarget(uniqueTargets[currentIndex]);
    }
  });

  await Promise.all(workers);
};

const warmPortfolioMedia = async () => {
  const [workItems, photoItems] = await Promise.all([
    fetchPortfolioItems('work'),
    fetchPortfolioItems('photo'),
  ]);

  const previewTargets: PortfolioMediaTarget[] = [];
  const hoverTargets: PortfolioMediaTarget[] = [];

  workItems.forEach(item => {
    const media = resolveWorkItemMedia(item, 'work');
    previewTargets.push(...media.previewTargets);
    hoverTargets.push(...media.hoverTargets);
  });

  photoItems.forEach(item => {
    const media = resolveWorkItemMedia(item, 'photo');
    previewTargets.push(...media.previewTargets);
    hoverTargets.push(...media.hoverTargets);
  });

  await preloadTargets(previewTargets);
  await preloadTargets(hoverTargets);
};

export const startPortfolioMediaPreload = () => {
  if (typeof window === 'undefined' || preloadStarted) {
    return;
  }

  preloadStarted = true;

  const schedule = () => {
    void warmPortfolioMedia().catch(error => {
      console.error('Failed to preload portfolio media:', error);
    });
  };

  const windowWithIdle = window as Window & {
    requestIdleCallback?: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number;
  };

  if (typeof windowWithIdle.requestIdleCallback === 'function') {
    windowWithIdle.requestIdleCallback(() => {
      schedule();
    });
    return;
  }

  window.setTimeout(schedule, 250);
};
