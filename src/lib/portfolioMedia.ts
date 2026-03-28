import { supabase } from '../supabaseClient';
import { supabaseUrl } from '../supabaseClient';

export type PortfolioSource = 'work' | 'photo';
export type WorkItemCategory = 'PERSONAL' | 'COMMERCIAL' | null;

export interface WorkItemData {
  slug?: string | null;
  id: string | number;
  folder: string;
  image_name: string;
  title: string;
  description?: string | null;
  preview_url?: string | null;
  vimeo_id?: string | null;
  category?: WorkItemCategory;
}

export type PortfolioMediaTargetKind = 'image' | 'video' | 'document';

export interface PortfolioMediaTarget {
  kind: PortfolioMediaTargetKind;
  url: string;
}

export interface ResolvedWorkItemMedia {
  src: string;
  previewSrc: string;
  vimeoEmbedSrc: string | null;
  isVideo: boolean;
  isVimeo: boolean;
  sameStaticImage: boolean;
  shouldUseImgPreview: boolean;
  previewTargets: PortfolioMediaTarget[];
  hoverTargets: PortfolioMediaTarget[];
}

const STORAGE_BASE_URL = `${supabaseUrl}/storage/v1/object/public`;
const TABLE_BY_SOURCE: Record<PortfolioSource, 'work' | 'photography'> = {
  work: 'work',
  photo: 'photography',
};

const BUCKET_BY_SOURCE: Record<PortfolioSource, 'work-images' | 'photography-images'> = {
  work: 'work-images',
  photo: 'photography-images',
};

const itemsCache = new Map<PortfolioSource, WorkItemData[]>();
const pendingItemsCache = new Map<PortfolioSource, Promise<WorkItemData[]>>();

const buildStorageUrl = (
  source: PortfolioSource,
  folder: string,
  fileName: string
) => `${STORAGE_BASE_URL}/${BUCKET_BY_SOURCE[source]}/${folder}/${fileName}`;

export const fetchPortfolioItems = async (
  source: PortfolioSource
): Promise<WorkItemData[]> => {
  const cachedItems = itemsCache.get(source);

  if (cachedItems) {
    return cachedItems;
  }

  const pendingItems = pendingItemsCache.get(source);

  if (pendingItems) {
    return pendingItems;
  }

  const nextItemsPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from(TABLE_BY_SOURCE[source])
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        throw error;
      }

      const nextItems = (data ?? []) as WorkItemData[];
      itemsCache.set(source, nextItems);
      return nextItems;
    } finally {
      pendingItemsCache.delete(source);
    }
  })();

  pendingItemsCache.set(source, nextItemsPromise);
  return nextItemsPromise;
};

export const resolveWorkItemMedia = (
  work: WorkItemData,
  source: PortfolioSource
): ResolvedWorkItemMedia => {
  const { folder, image_name, preview_url, vimeo_id } = work;
  const src = buildStorageUrl(source, folder, image_name);
  const isVimeo = Boolean(vimeo_id);
  const isVideo = image_name.toLowerCase().endsWith('.mp4');
  const previewSrc = !preview_url
    ? src
    : preview_url.startsWith('http')
      ? preview_url
      : buildStorageUrl(source, folder, preview_url);
  const previewLooksLikeImage =
    /\.(avif|webp|png|jpe?g|gif|bmp|svg)([?#].*)?$/i.test(previewSrc);
  const shouldUseImgPreview = !isVideo || previewLooksLikeImage || Boolean(preview_url);
  const sameStaticImage = !isVideo && previewSrc === src;
  const vimeoEmbedSrc = isVimeo
    ? `https://player.vimeo.com/video/${vimeo_id}?autoplay=1&muted=1&loop=1&background=1`
    : null;

  const previewTargets: PortfolioMediaTarget[] = shouldUseImgPreview
    ? [{ kind: 'image', url: previewSrc }]
    : [];
  const hoverTargets: PortfolioMediaTarget[] = [];

  if (!isVideo && !sameStaticImage) {
    hoverTargets.push({ kind: 'image', url: src });
  }

  if (isVideo && !isVimeo) {
    hoverTargets.push({ kind: 'video', url: src });
  }

  if (vimeoEmbedSrc) {
    hoverTargets.push({ kind: 'document', url: vimeoEmbedSrc });
  }

  return {
    src,
    previewSrc,
    vimeoEmbedSrc,
    isVideo,
    isVimeo,
    sameStaticImage,
    shouldUseImgPreview,
    previewTargets,
    hoverTargets,
  };
};
