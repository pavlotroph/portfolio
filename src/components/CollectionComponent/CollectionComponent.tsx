import React, { useState, useEffect, useRef, useCallback, useMemo, startTransition } from 'react';
import {
useLocation } from 'react-router-dom';
import Modal, {
  MODAL_TITLE,
  MODAL_DESCRIPTION,
  CloseButton,
  MediaContainer,
  TextContainer,
  ModalArrowZone,

} from '../Modal/Modal';
import Loading from '../../assets/video/logo_animated_hq.webm';
import { supabaseUrl } from '../../supabaseClient';

import CloseIcon from '../../assets/icons/c_cross.svg?react';
import Left from '../../assets/icons/icon_left.svg';
import Right from '../../assets/icons/icon_right.svg';
import { Reveal } from '../../pages/Reveal/Reveal';

import {
  IMAGE_GALLERY,
  ImageGalleryRows,
  ImageGalleryRow,
  SliderWrapper,
  SliderContent,
  Slide,
  Arrow,
  WRAPPER_GLOBAL,
  CollectionHeader,
  TEXT_MBLOCK_WRAPPER,
  CollectionAdditionalWrapper,
  COLLECTION_4SEC_TITLE,
  COLLECTION_4SEC_DESCRIPTION,
  WorkTextFilter,
  WorkFilterWrapp,
  WorkTitelContainer,
  WorkTitel,
  CUSTOM_SPLITTER,
  YouTubePlayerWrapper,
  YouTubeIframeContainer,
  ContentBlockWrapper,

  WRAPPER_COMPONENT,
  WRAPPER_BLOCKS,
  CONTENT_TEXT_BLOCK,
  CONTENT_MEDIA_BLOCK,
  CONTENT_EMPTY_BLOCK,
  CONTENT_TEXT_HEADING,
  CONTENT_TEXT_BODY,
  CONTENT_LINK,
  CONTENT_INLINE_LINK,
  CONTENT_MEDIA_INNER,
} from './CollectionComponent.styled';
import {
  getContentLinkProps,
  isInlineFlag,
  renderMultiline,
  renderTextWithInlineLinks,
} from './contentTextUtils';
import type { CollectionBlockDB, CollectionData } from './collectionBlocks';

interface CollectionComponentEditorState {
  enabled: boolean;
  preview: boolean;
  selectedBlockId: number | null;
  onSelectBlock?: (blockId: number) => void;
  placeholder?: React.ReactNode;
}

interface CollectionComponentProps {
  collection: CollectionData;
  source?: 'work' | 'photo';
  editor?: CollectionComponentEditorState;
}

interface ModalMediaItem {
  url: string;
  type: 'image' | 'video';
  altText: string;
  title?: string;
  description: string;
}

interface ZoomableImageProps {
  src: string;
  alt: string;
  onError?: () => void;
  onLoad?: () => void;
  onZoomChange?: (zoomed: boolean) => void;

  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

/**
 * ZoomableImage:
 * - Mouse wheel → zoom in/out
 * - Touch pinch (two fingers) → zoom
 * - Drag/pan when zoomed in
 */
const ZoomableImage: React.FC<ZoomableImageProps> = ({
  src,
  alt,
  onError,
  onLoad,
  onZoomChange,
  onSwipeLeft,
  onSwipeRight,
  
}) => {
  const swipePointerIdRef = useRef<number | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeDeltaRef = useRef({ dx: 0, dy: 0 });
  const swipeStartTimeRef = useRef(0);

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const scaleRef = useRef(1);
  const translateRef = useRef({ x: 0, y: 0 });

  const panStartRef = useRef({ x: 0, y: 0 });
  const translateStartRef = useRef({ x: 0, y: 0 });

  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const isPinchingRef = useRef(false);
  const initialPinchDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef(1);

  const MIN_SCALE = 1;
  const MAX_SCALE = 4;

  const clampScale = (value: number) =>
    Math.min(Math.max(value, MIN_SCALE), MAX_SCALE);

  const clampTranslate = useCallback(
    (x: number, y: number, scaleValue: number) => {
      const el = wrapperRef.current;
      if (!el || scaleValue <= 1) {
        return { x: 0, y: 0 };
      }

      const rect = el.getBoundingClientRect();
      const maxX = (rect.width * (scaleValue - 1)) / 2;
      const maxY = (rect.height * (scaleValue - 1)) / 2;

      const clampedX = Math.max(-maxX, Math.min(maxX, x));
      const clampedY = Math.max(-maxY, Math.min(maxY, y));

      return { x: clampedX, y: clampedY };
    },
    []
  );
  
  useEffect(() => {
  onZoomChange?.(scale > 1);
}, [scale, onZoomChange]);

useEffect(() => {
  setScale(1);
  setTranslate({ x: 0, y: 0 });
  setIsPanning(false);

  scaleRef.current = 1;
  translateRef.current = { x: 0, y: 0 };

  pointersRef.current.clear();
  isPinchingRef.current = false;

  onZoomChange?.(false);
}, [src, onZoomChange]);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    translateRef.current = translate;
  }, [translate]);

  // Wheel zoom (mouse / trackpad)
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY === 0) return;

    // Don’t call preventDefault here – in some environments wheel listeners are passive,
    // which causes “Unable to preventDefault inside passive event listener” spam.
    // Body is already scroll-locked by the Modal, and this wrapper has overflow: hidden,
    // so there’s no visible scroll to block anyway.

    const prevScale = scaleRef.current;
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const nextScale = clampScale(prevScale * factor);

    if (nextScale === prevScale) return;

    if (nextScale === 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
      return;
    }

    const current = translateRef.current;
    const clamped = clampTranslate(current.x, current.y, nextScale);

    setScale(nextScale);
    setTranslate(clamped);
  };


  // Pointer helpers
  const updatePointer = (id: number, x: number, y: number) => {
    const map = pointersRef.current;
    map.set(id, { x, y });
  };

  const removePointer = (id: number) => {
    const map = pointersRef.current;
    map.delete(id);
  };

  const getTwoPointers = () => {
    const arr = Array.from(pointersRef.current.values());
    if (arr.length < 2) return null;
    return arr.slice(0, 2);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = wrapperRef.current;
    if (!el) return;

    el.setPointerCapture(e.pointerId);
    updatePointer(e.pointerId, e.clientX, e.clientY);

    const activeCount = pointersRef.current.size;

    if (activeCount === 2) {
      // Begin pinch
      const pts = getTwoPointers();
      if (!pts) return;
      const [p1, p2] = pts;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);

      initialPinchDistanceRef.current = dist;
      initialScaleRef.current = scaleRef.current;
      isPinchingRef.current = true;
      setIsPanning(false);
    } else if (activeCount === 1 && scaleRef.current > 1) {
      // Begin pan
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      translateStartRef.current = translateRef.current;
      isPinchingRef.current = false;
    }
    if (e.pointerType === "touch") {
  if (activeCount === 1 && scaleRef.current === 1) {
    swipePointerIdRef.current = e.pointerId;
    swipeStartRef.current = { x: e.clientX, y: e.clientY };
    swipeDeltaRef.current = { dx: 0, dy: 0 };
    swipeStartTimeRef.current = Date.now();
  } else {
    swipePointerIdRef.current = null;
    swipeStartRef.current = null;
  }
}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;

    updatePointer(e.pointerId, e.clientX, e.clientY);

    if (
  swipePointerIdRef.current === e.pointerId &&
  swipeStartRef.current &&
  scaleRef.current === 1 &&
  !isPinchingRef.current &&
  pointersRef.current.size === 1
) {
  swipeDeltaRef.current = {
    dx: e.clientX - swipeStartRef.current.x,
    dy: e.clientY - swipeStartRef.current.y,
  };
}

    // Pinch zoom (touch)
    if (isPinchingRef.current) {
      const pts = getTwoPointers();
      if (!pts) return;
      const [p1, p2] = pts;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);

      if (initialPinchDistanceRef.current == null) return;

      const rawScale =
        (dist / initialPinchDistanceRef.current) * initialScaleRef.current;
      const nextScale = clampScale(rawScale);

      if (nextScale === 1) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
        return;
      }

      const current = translateRef.current;
      const clamped = clampTranslate(current.x, current.y, nextScale);

      setScale(nextScale);
      setTranslate(clamped);
      return;
    }

    // Pan when zoomed in
    if (isPanning && scaleRef.current > 1) {
      const start = panStartRef.current;
      const base = translateStartRef.current;

      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;

      const nextX = base.x + dx;
      const nextY = base.y + dy;

      const clamped = clampTranslate(nextX, nextY, scaleRef.current);
      setTranslate(clamped);
    }
  };

  const endInteraction = (pointerId: number) => {
    removePointer(pointerId);

    const count = pointersRef.current.size;

    if (count < 2) {
      isPinchingRef.current = false;
    }
    if (count === 0) {
      setIsPanning(false);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = wrapperRef.current;
    if (el && el.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
    if (
  swipePointerIdRef.current === e.pointerId &&
  swipeStartRef.current &&
  scaleRef.current === 1 &&
  !isPinchingRef.current
) {
  const { dx, dy } = swipeDeltaRef.current;
  const dt = Date.now() - swipeStartTimeRef.current;

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  const SWIPE_PX = 50;
  const MAX_MS = 700;

  if (dt <= MAX_MS && absDx >= SWIPE_PX && absDx > absDy * 1.2) {
    if (dx < 0) onSwipeLeft?.();  // swipe left → next
    else onSwipeRight?.();        // swipe right → prev
  }
}

// cleanup
swipePointerIdRef.current = null;
swipeStartRef.current = null;
    endInteraction(e.pointerId);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = wrapperRef.current;
    if (el && el.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
    endInteraction(e.pointerId);
  };

  return (
    <div
      ref={wrapperRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerUp}
      style={{
        width: '100%',
        height: '100%',
        maxHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        touchAction: 'none',
        cursor:
          scale > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
      }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        draggable={false}
        onLoad={onLoad}
        onError={onError}
        style={{
          transform: `translate3d(${translate.x}px, ${translate.y}px, 0) scale(${scale})`,
          transformOrigin: 'center center',
          transition:
            isPanning || isPinchingRef.current
              ? 'none'
              : 'transform 0.15s ease-out',
          maxHeight: '80vh',
          maxWidth: '100%',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};



type PreloadedGridImageProps = {
  src: string;
  alt: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  draggable?: boolean;
  loading?: 'lazy' | 'eager';
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onSettled?: () => void;
  sequentialGroupKey?: string;
  sequentialIndex?: number;
};

type SequentialLoadGroupState = {
  nextIndex: number;
  listeners: Set<() => void>;
  mounts: number;
};

const sequentialLoadGroups = new Map<string, SequentialLoadGroupState>();

const getSequentialLoadGroup = (key: string): SequentialLoadGroupState => {
  let group = sequentialLoadGroups.get(key);
  if (!group) {
    group = { nextIndex: 0, listeners: new Set(), mounts: 0 };
    sequentialLoadGroups.set(key, group);
  }
  return group;
};

const PreloadedGridImage: React.FC<PreloadedGridImageProps> = ({
  src,
  alt,
  onClick,
  style,
  draggable = false,
  loading = 'lazy',
  onError,
  onSettled,
  sequentialGroupKey,
  sequentialIndex,
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [visible, setVisible] = useState(false);
  const hasSequentialOrder =
    typeof sequentialGroupKey === "string" && typeof sequentialIndex === "number";
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (!hasSequentialOrder) return true;
    const group = getSequentialLoadGroup(sequentialGroupKey!);
    return sequentialIndex! <= group.nextIndex;
  });

  useEffect(() => {
    if (!hasSequentialOrder) {
      setIsUnlocked(true);
      return;
    }

    const group = getSequentialLoadGroup(sequentialGroupKey!);
    group.mounts += 1;

    const sync = () => {
      setIsUnlocked(sequentialIndex! <= group.nextIndex);
    };

    group.listeners.add(sync);
    sync();

    return () => {
      group.listeners.delete(sync);
      group.mounts = Math.max(0, group.mounts - 1);
      if (group.mounts === 0) {
        sequentialLoadGroups.delete(sequentialGroupKey!);
      }
    };
  }, [hasSequentialOrder, sequentialGroupKey, sequentialIndex]);

  const advanceSequentialQueue = useCallback(() => {
    if (!hasSequentialOrder) return;
    const group = getSequentialLoadGroup(sequentialGroupKey!);
    if (sequentialIndex! > group.nextIndex) return;
    if (sequentialIndex! === group.nextIndex) {
      group.nextIndex += 1;
      group.listeners.forEach((listener) => listener());
    }
  }, [hasSequentialOrder, sequentialGroupKey, sequentialIndex]);

  useEffect(() => {
    if (!isUnlocked) {
      setVisible(false);
      return;
    }

    const img = imgRef.current;
    if (!img) {
      setVisible(false);
      return;
    }

    if (img.complete) {
      setVisible(img.naturalWidth > 0);
      advanceSequentialQueue();
      onSettled?.();
      return;
    }

    setVisible(false);
  }, [src, isUnlocked, advanceSequentialQueue, onSettled]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--collection-deferred-media-bg, #111)',
      }}
    >
      <img
        ref={imgRef}
        src={isUnlocked ? src : undefined}
        alt={alt}
        onClick={onClick}
        draggable={draggable}
        loading={loading}
        decoding="async"
        onLoad={() => {
          setVisible(true);
          advanceSequentialQueue();
          onSettled?.();
        }}
        onError={(e) => {
          advanceSequentialQueue();
          onSettled?.();
          onError?.(e);
        }}
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.35s ease",
          ...style,
        }}
      />
    </div>
  );
};



/* ────────────────────────────────────────────── */
/* HELPER                                         */
/* ────────────────────────────────────────────── */

interface ImageItem {
  src: string;
  title?: string;
  description?: string;
  row?: number | string;
  aspectRatio?: string;
}

interface ImageSliderProps {
  images: ImageItem[];
  aspectRatio?: string;
  keyboardNav?: boolean; // default false
  resetKey?: number;
  zoomable?: boolean;
  sequentialLoad?: boolean;
  sequentialLoadStrategy?: 'linear' | 'around-active';

  // NEW:
  autoPlay?: boolean; // default true
  startIndex?: number; // 0-based (real image index)
  onActiveIndexChange?: (realIndex: number) => void; // 0..images.length-1
  onImageSettled?: (realIndex: number, total: number) => void;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  aspectRatio,
  autoPlay = true,
  keyboardNav = false,
  startIndex = 0,
  resetKey = 0,
  zoomable = false,
  sequentialLoad = false,
  sequentialLoadStrategy = 'linear',
  onActiveIndexChange,
  onImageSettled,
}) => {
  const slides = [images[images.length - 1], ...images, images[0]];

  const hasMultiple = images.length > 1;

  // start at startIndex (but +1 because of the "clone" at the beginning)
  const [index, setIndex] = useState(startIndex + 1);

  const [animate, setAnimate] = useState(true);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const transitioningRef = useRef(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const slideWidthRef = useRef(0);

  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const startTimeRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastVelocityRef = useRef(0);

  const autoPlayRef = useRef<number>();

  const [autoplayDisabledByUser, setAutoplayDisabledByUser] = useState(false);

  const [isZoomed, setIsZoomed] = useState(false);
  const isZoomedRef = useRef(false);
  const sequentialSettledRef = useRef<Set<number>>(new Set());
  const visuallySettledRef = useRef<Set<number>>(new Set());
  const [visuallySettledRealIndices, setVisuallySettledRealIndices] = useState<Set<number>>(
    () => new Set<number>()
  );
  const [sequentialUnlockedCount, setSequentialUnlockedCount] = useState(
    sequentialLoad ? Math.min(images.length, Math.max(1, startIndex + 1)) : images.length
  );
  const [sequentialUnlockedIndices, setSequentialUnlockedIndices] = useState<Set<number>>(
    () => new Set<number>()
  );

  const getRealImageIndexForSlide = useCallback((slideIndex: number) => {
    if (images.length === 0) return 0;
    if (slideIndex === 0) return images.length - 1;
    if (slideIndex === slides.length - 1) return 0;
    return slideIndex - 1;
  }, [images.length, slides.length]);

  const getAroundActiveIndices = (total: number, active: number) => {
    const result = new Set<number>();
    if (total <= 0) return result;

    const normalizedActive = ((active % total) + total) % total;
    result.add(normalizedActive);

    if (total > 1) {
      result.add((normalizedActive + 1) % total);
      result.add((normalizedActive - 1 + total) % total);
    }

    return result;
  };

  const markSequentialImageSettled = useCallback((slideIndex: number) => {
    const settledRealIndex = getRealImageIndexForSlide(slideIndex);
    if (sequentialSettledRef.current.has(settledRealIndex)) return;
    sequentialSettledRef.current.add(settledRealIndex);

    onImageSettled?.(settledRealIndex, images.length);

    if (!sequentialLoad || images.length <= 1) return;
    if (sequentialLoadStrategy === 'around-active') return;

    setSequentialUnlockedCount((current) => {
      if (settledRealIndex !== current - 1) return current;
      return Math.min(images.length, current + 1);
    });
  }, [
    getRealImageIndexForSlide,
    images.length,
    onImageSettled,
    sequentialLoad,
    sequentialLoadStrategy,
  ]);

  const markSlideVisuallySettled = useCallback((slideIndex: number) => {
    const settledRealIndex = getRealImageIndexForSlide(slideIndex);
    if (visuallySettledRef.current.has(settledRealIndex)) return;
    visuallySettledRef.current.add(settledRealIndex);
    setVisuallySettledRealIndices((current) => {
      if (current.has(settledRealIndex)) return current;
      const next = new Set(current);
      next.add(settledRealIndex);
      return next;
    });
  }, [getRealImageIndexForSlide]);

  const imageSignature = useMemo(
    () => images.map((image) => image.src).join('|'),
    [images]
  );

  useEffect(() => {
    sequentialSettledRef.current.clear();
    visuallySettledRef.current.clear();
    setVisuallySettledRealIndices(new Set<number>());
    if (!sequentialLoad || images.length <= 1) {
      setSequentialUnlockedCount(images.length);
      setSequentialUnlockedIndices(new Set());
      return;
    }

    if (sequentialLoadStrategy === 'around-active') {
      const normalizedStart = ((startIndex % images.length) + images.length) % images.length;
      setSequentialUnlockedIndices(getAroundActiveIndices(images.length, normalizedStart));
      setSequentialUnlockedCount(images.length);
      return;
    }

    setSequentialUnlockedIndices(new Set());
    setSequentialUnlockedCount(Math.min(images.length, Math.max(1, startIndex + 1)));
  }, [sequentialLoad, sequentialLoadStrategy, images.length, startIndex, resetKey, imageSignature]);

  useEffect(() => {
  setIsZoomed(false);
}, [index, resetKey]);

  useEffect(() => {
    isZoomedRef.current = isZoomed;
  }, [isZoomed]);

  // NEW: if parent changes startIndex (e.g. modal opens at clicked image)
  useEffect(() => {
  setAnimate(false);
  setIndex(startIndex + 1);
  setOffset(0);
  setIsDragging(false);
  transitioningRef.current = false;

  const raf = requestAnimationFrame(() => setAnimate(true));
  return () => cancelAnimationFrame(raf);
}, [resetKey]); // ✅ only reset when modal opens (or gallery changes), not on every slide

  // NEW: inform parent which real slide is active
  const realIndex =
    images.length > 0 ? ((index - 1 + images.length) % images.length) : 0;

  useEffect(() => {
    onActiveIndexChange?.(realIndex);
  }, [realIndex, onActiveIndexChange]);

  useEffect(() => {
    if (!sequentialLoad || sequentialLoadStrategy !== 'around-active' || images.length <= 1) return;
    setSequentialUnlockedIndices((current) => {
      const nextNeighborhood = getAroundActiveIndices(images.length, realIndex);
      let changed = false;
      const next = new Set(current);
      nextNeighborhood.forEach((idx) => {
        if (!next.has(idx)) {
          next.add(idx);
          changed = true;
        }
      });
      if (!changed) return current;
      return next;
    });
  }, [realIndex, sequentialLoad, sequentialLoadStrategy, images.length]);

  useEffect(() => {
    if (zoomable) return;
    const sliderElement = sliderRef.current;
    if (!sliderElement) return;

    const imagesInDom = sliderElement.querySelectorAll<HTMLImageElement>('img[data-slide-index]');
    imagesInDom.forEach((imgElement) => {
      if (!imgElement.complete || imgElement.naturalWidth <= 0) return;
      const slideIndexAttr = imgElement.dataset.slideIndex;
      if (!slideIndexAttr) return;

      const slideIndex = Number(slideIndexAttr);
      if (Number.isNaN(slideIndex)) return;

      markSlideVisuallySettled(slideIndex);
      markSequentialImageSettled(slideIndex);
    });
  }, [
    zoomable,
    index,
    imageSignature,
    sequentialUnlockedCount,
    sequentialUnlockedIndices,
    markSlideVisuallySettled,
    markSequentialImageSettled,
  ]);
  
  // Стрелки
  const prevSlide = (fromUser: boolean = true) => {
  if (transitioningRef.current) return;
  setAnimate(true);
  setIndex(i => i - 1);
  transitioningRef.current = true;

  if (fromUser) setAutoplayDisabledByUser(true);
};

const nextSlide = (fromUser: boolean = true) => {
  if (transitioningRef.current) return;
  setAnimate(true);
  setIndex(i => i + 1);
  transitioningRef.current = true;

  if (fromUser) setAutoplayDisabledByUser(true);
};

useEffect(() => {
  if (!keyboardNav || !hasMultiple) return;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  };

  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}, [keyboardNav, hasMultiple, prevSlide, nextSlide]);

  // Drag logic
  const onPointerDown = (e: React.PointerEvent) => {
    if (!hasMultiple) return; 

 // If image is zoomed in, user is panning/zooming — don't swipe slides.
if (isZoomedRef.current) return;

// Touch devices: disable slide swipe so pinch-zoom never fights the slider.
if (zoomable && e.pointerType === "touch") return;

    if ((e.target as HTMLElement).closest('button') || transitioningRef.current) return;
    const el = sliderRef.current!;
    el.setPointerCapture(e.pointerId);
    
    setAutoplayDisabledByUser(true);
    setIsDragging(true);
    slideWidthRef.current = el.clientWidth;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    startTimeRef.current = Date.now();
    lastTimeRef.current = Date.now();
    lastVelocityRef.current = 0;
    setAnimate(false);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || transitioningRef.current) return;
    const now = Date.now();
    const dxLocal = e.clientX - lastXRef.current;
    const dtLocal = now - lastTimeRef.current;
    if (dtLocal > 0) lastVelocityRef.current = dxLocal / dtLocal;
    lastXRef.current = e.clientX;
    lastTimeRef.current = now;

    const dx = e.clientX - startXRef.current;
    setOffset(dx);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const el = sliderRef.current!;
    el.releasePointerCapture(e.pointerId);

    setIsDragging(false);

    const dx = offset;
    const vel = lastVelocityRef.current; // 👉 signed velocity
    const threshold = slideWidthRef.current * 0.3; // a bit softer than 0.5 feels nicer

    let newIdx = index;

    const passedRight = dx > threshold || vel > 0.3;   // swipe right → previous slide
    const passedLeft = dx < -threshold || vel < -0.3; // swipe left  → next slide

    if (passedRight && !passedLeft) {
      newIdx = index - 1;
    } else if (passedLeft && !passedRight) {
      newIdx = index + 1;
    }
    // if both or neither → newIdx stays index (no slide change)

    setAnimate(true);
    setOffset(0);

    // (keep the click-fix logic we added earlier)
    if (newIdx !== index && !transitioningRef.current) {
      setIndex(newIdx);
      transitioningRef.current = true;
    } else {
      transitioningRef.current = false;
    }
  };



  const handleTransitionEnd = () => {
    transitioningRef.current = false;
    if (index === 0) {
      setAnimate(false);
      setIndex(images.length);
    } else if (index === slides.length - 1) {
      setAnimate(false);
      setIndex(1);
    }
  };

  // восстановление animate после программного сброса
  useEffect(() => {
    if (!animate) requestAnimationFrame(() => setAnimate(true));
  }, [animate]);

  // IntersectionObserver для видимости
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.5 }
    );
    if (sliderRef.current) obs.observe(sliderRef.current);
    return () => obs.disconnect();
  }, []);

  // Автоплей каждые 2 сек, когда видим и не драгаем и не анимируем
  useEffect(() => {
    if (autoPlay && !autoplayDisabledByUser && isVisible && !isDragging && !transitioningRef.current) {
      autoPlayRef.current = window.setInterval(() => {
        nextSlide(false);
      }, 3000);
    } else {
      window.clearInterval(autoPlayRef.current);
    }
    return () => window.clearInterval(autoPlayRef.current);
  }, [autoPlay, autoplayDisabledByUser, isVisible, isDragging]);
  
  return (
    <SliderWrapper
      ref={sliderRef}
      $aspectRatio={aspectRatio}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {hasMultiple && (
  <>
      <Arrow $left onClick={() => prevSlide(true)} aria-label="Previous slide" role="button" tabIndex={0}>
  <img src={Left} alt="Previous slide" />
</Arrow>

<Arrow onClick={() => nextSlide(true)} aria-label="Next slide" role="button" tabIndex={0}>
  <img src={Right} alt="Next slide" />
</Arrow>
      </>
      )}

      <SliderContent
        $index={index}
        $animate={animate}
        $offset={offset}
        $isDragging={isDragging}
        onTransitionEnd={handleTransitionEnd}
      >
        {slides.map((img, i) => (
          <Slide key={i}>
            {(() => {
              const realSlideIndex = getRealImageIndexForSlide(i);
              const isVisualSettled = visuallySettledRealIndices.has(realSlideIndex);
              const shouldLoadImage =
                !sequentialLoad ||
                images.length <= 1 ||
                (sequentialLoadStrategy === 'around-active'
                  ? sequentialUnlockedIndices.has(realSlideIndex)
                  : realSlideIndex < sequentialUnlockedCount);

              return shouldLoadImage ? (
                <>
            {zoomable ? (
     <ZoomableImage
       src={img.src}
       alt={img.title || `Slide ${i + 1} of ${slides.length}`}
       onLoad={() => markSequentialImageSettled(i)}
       onZoomChange={setIsZoomed}
       onError={() => {
         markSequentialImageSettled(i);
         console.error("Image failed to load:", img.src);
       }}
       onSwipeLeft={nextSlide}
  onSwipeRight={prevSlide}
     />
   ) : (
     <div
       style={{
         width: '100%',
         height: '100%',
         background: 'var(--collection-deferred-media-bg, #111)',
       }}
     >
       <img
         data-slide-index={i}
         src={img.src}
         alt={img.title || `Slide ${i + 1} of ${slides.length}`}
         draggable={false}
         onLoad={() => {
           markSlideVisuallySettled(i);
           markSequentialImageSettled(i);
         }}
         onError={() => {
           markSlideVisuallySettled(i);
           markSequentialImageSettled(i);
         }}
         style={{
           width: '100%',
           height: '100%',
           objectFit: 'cover',
           opacity: isVisualSettled ? 1 : 0,
           transition: 'opacity 0.35s ease',
         }}
       />
     </div>
   )}
                </>
              ) : (
                <div
                  aria-hidden="true"
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'var(--collection-deferred-media-bg, #111)',
                  }}
                />
              );
            })()}
          </Slide>
        ))}
      </SliderContent>
    </SliderWrapper>
  );
};
//VIDEO
interface AutoPlayVideoProps {
  src: string;
  alt?: string;
  preload?: 'none' | 'metadata' | 'auto';
  onSettled?: () => void;
}

const AutoPlayVideo: React.FC<AutoPlayVideoProps> = ({
  src,
  alt,
  preload = 'none',
  onSettled,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // If IntersectionObserver is not supported, just play muted loop.
    if (typeof IntersectionObserver === 'undefined') {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => { });
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry || !video) return;

        if (entry.isIntersecting) {
          const playPromise = video.play();
          if (playPromise && typeof playPromise.then === 'function') {
            playPromise.catch(() => { });
          }
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleVideoSettled = useCallback(() => {
    setIsReady(true);
    onSettled?.();
  }, [onSettled]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--collection-deferred-media-bg, #111)',
      }}
    >
      <video
        ref={videoRef}
        src={src}
        loop
        muted
        playsInline
        preload={preload}
        onLoadedData={handleVideoSettled}
        onCanPlay={handleVideoSettled}
        onError={handleVideoSettled}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'cover',
          opacity: isReady ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}
        aria-label={alt}
      />
    </div>
  );
};

/* ────────────────────────────────────────────── */
/* КОМПОНЕНТ                                      */
/* ────────────────────────────────────────────── */
const CollectionComponent: React.FC<CollectionComponentProps> = ({
  collection,
  source,
  editor,
}) => {
  /* ────────── фильтр в URL (оставил как было) ────────── */
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [filter, setFilter] = useState<'ALL' | 'COMMERCIAL' | 'PERSONAL'>(
    (searchParams.get('filter') as any) || 'ALL'
  );
  const updateUrlFilter = (newFilter: string) => {
    const params = new URLSearchParams(location.search);
    params.set('filter', newFilter);
    window.history.replaceState({}, '', `${location.pathname}?${params}`);
  };
  const showFilter = location.pathname === '/work' || location.pathname === '/photo';
  const bucket = source === 'work'
    ? 'work-images'
    : 'photography-images';

  const blocks = collection.blocks ?? [];
  const editorEnabled = !!editor?.enabled;
  const showEditorChrome = editorEnabled && !editor.preview;
  const canOpenPageInteractions = !showEditorChrome;

  /* ────────── модалка ────────── */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalItems, setModalItems] = useState<ModalMediaItem[]>([]);
  const [modalIndex, setModalIndex] = useState<number>(0);

  const hasModalMedia = modalItems.length > 0;
  const currentMedia = hasModalMedia ? modalItems[modalIndex] : null;

  const failedMedia = useRef<Set<string>>(new Set());
  const modalHistoryRef = useRef(false);

  const modalLength = modalItems.length;

  const goToPrevMedia = useCallback(() => {
    if (!hasModalMedia || modalLength === 0) return;

    setModalIndex((prev) => (prev - 1 + modalLength) % modalLength);
  }, [hasModalMedia, modalLength]);

  const goToNextMedia = useCallback(() => {
    if (!hasModalMedia || modalLength === 0) return;

    setModalIndex((prev) => (prev + 1) % modalLength);
  }, [hasModalMedia, modalLength]);


  /* ────────── helpers ────────── */
  const encodePath = (...parts: string[]) =>
  parts.map((p) => encodeURIComponent(p)).join('/');

const imageUrl = (fileName: string) =>
  `${supabaseUrl}/storage/v1/object/public/${encodePath(bucket, collection.folder, fileName)}`;

const lrName = (fileName: string) => {
  const dot = fileName.lastIndexOf(".");
  if (dot === -1) return `${fileName}LR`;         // edge case
  const base = fileName.slice(0, dot);
  const ext = fileName.slice(dot);               // includes ".webp"
  return `${base}LR${ext}`;
};

const imageThumbLRUrl = (fileName: string) =>
  `${supabaseUrl}/storage/v1/object/public/${encodePath(
    bucket,
    collection.folder,
    "thumb",               // <-- your folder name
    lrName(fileName)
  )}`;

  const isVideoFile = (fileName: string | undefined | null): boolean => {
    if (!fileName || typeof fileName !== 'string') return false;
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex === -1) return false;
    const ext = fileName.slice(dotIndex + 1).toLowerCase();
    return ['mp4', 'webm', 'mov', 'm4v', 'ogg', 'ogv'].includes(ext);
  };

  const getYouTubeId = (value: string): string | null => {
    if (!value) return null;

    const trimmed = value.trim();

    // If it's already an ID-like string
    const idPattern = /^[a-zA-Z0-9_-]{11}$/;
    if (idPattern.test(trimmed)) return trimmed;

    // Try to parse as URL
    try {
      const url = new URL(trimmed);

      if (url.hostname === 'youtu.be') {
        return url.pathname.slice(1);
      }

      if (url.hostname.endsWith('youtube.com')) {
        if (url.pathname === '/watch') {
          return url.searchParams.get('v');
        }
        if (url.pathname.startsWith('/embed/')) {
          return url.pathname.split('/embed/')[1];
        }
        if (url.pathname.startsWith('/shorts/')) {
          return url.pathname.split('/shorts/')[1];
        }
      }
    } catch {
      // Not a valid URL, last chance: look for an ID inside string
      const match = value.match(/([a-zA-Z0-9_-]{11})/);
      if (match) return match[1];
    }

    return null;
  };

  const isContentYouTubeKind = (kind: string): boolean =>
    kind === 'youtube' || kind === 'youtube_player';

  const getContentYoutubeId = (item: any): string | null => {
    const nestedItems = Array.isArray(item?.items)
      ? item.items
      : (Array.isArray(item?.content?.items) ? item.content.items : []);
    const firstNestedItem = nestedItems?.[0];

    const candidates = [
      item?.youtubeId,
      item?.youtubeUrl,
      item?.youtube,
      item?.videoId,
      item?.videoUrl,
      item?.url,
      item?.content?.youtubeId,
      item?.content?.youtubeUrl,
      item?.content?.youtube,
      item?.content?.videoId,
      item?.content?.videoUrl,
      item?.content?.url,
      firstNestedItem?.youtubeId,
      firstNestedItem?.youtubeUrl,
      firstNestedItem?.youtube,
      firstNestedItem?.videoId,
      firstNestedItem?.videoUrl,
      firstNestedItem?.url,
      firstNestedItem?.media,
    ];

    const rawIdOrUrl = candidates.find(
      (value) => typeof value === 'string' && value.trim()
    ) as string | undefined;

    return rawIdOrUrl ? getYouTubeId(rawIdOrUrl) : null;
  };

  const getMediaItemCountForBlock = (block: CollectionBlockDB): number => {
    switch (block.type) {
      case 'IMAGE_SLIDER': {
        const items = Array.isArray(block.content?.items) ? block.content.items : [];
        return items.filter((item: any) => typeof item?.src === 'string' && item.src.trim()).length;
      }

      case 'IMAGE_GALLERY': {
        const items = Array.isArray(block.content?.items) ? block.content.items : [];
        return items.filter((item: any) => typeof item?.src === 'string' && item.src.trim()).length;
      }

      case 'CONTENT': {
        const contentItems = Array.isArray(block.content?.items) ? block.content.items : [];
        return contentItems.reduce((count: number, it: any) => {
          const kind = typeof it?.block === 'string' ? it.block.toLowerCase().trim() : '';
          if (kind === 'media') {
            const items = Array.isArray(it?.items)
              ? it.items
              : (Array.isArray(it?.content?.items) ? it.content.items : []);
            const first = items?.[0];
            const mediaName = typeof first?.media === 'string' ? first.media.trim() : '';
            return mediaName ? count + 1 : count;
          }

          if (isContentYouTubeKind(kind)) {
            return getContentYoutubeId(it) ? count + 1 : count;
          }

          return count;
        }, 0);
      }

      case 'YOUTUBE_PLAYER': {
        const content = block.content || {};
        const rawIdOrUrl = (content.youtubeId || content.youtubeUrl || '') as string;
        return getYouTubeId(rawIdOrUrl) ? 1 : 0;
      }

      default:
        return 0;
    }
  };

  const mediaBlockIdsInOrder = useMemo(
    () => blocks
      .filter((block) => getMediaItemCountForBlock(block) > 0)
      .map((block) => block.id),
    [blocks]
  );

  const mediaOrderIndexByBlockId = useMemo(() => {
    const map = new Map<number, number>();
    mediaBlockIdsInOrder.forEach((id, index) => map.set(id, index));
    return map;
  }, [mediaBlockIdsInOrder]);

  const mediaQueueSignature = useMemo(
    () => mediaBlockIdsInOrder.join('|'),
    [mediaBlockIdsInOrder]
  );

  const [nextMediaBlockOrderToUnlock, setNextMediaBlockOrderToUnlock] = useState(0);
  const settledMediaBlocksRef = useRef<Set<number>>(new Set());
  const settledMediaItemsRef = useRef<Map<number, Set<string>>>(new Map());
  const mediaBlockElementsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const MEDIA_VIEWPORT_UNLOCK_THRESHOLD = 0.35;
  const [viewportRequestedMediaBlockIds, setViewportRequestedMediaBlockIds] = useState<Set<number>>(
    () => new Set<number>()
  );

  const registerMediaBlockElement = useCallback((blockId: number, element: HTMLDivElement | null) => {
    if (element) {
      mediaBlockElementsRef.current.set(blockId, element);
      return;
    }
    mediaBlockElementsRef.current.delete(blockId);
  }, []);

  const markMediaBlockRequestedByViewport = useCallback((blockId: number) => {
    setViewportRequestedMediaBlockIds((current) => {
      if (current.has(blockId)) return current;
      const next = new Set(current);
      next.add(blockId);
      return next;
    });
  }, []);

  useEffect(() => {
    settledMediaBlocksRef.current.clear();
    settledMediaItemsRef.current.clear();
    setNextMediaBlockOrderToUnlock(0);
    setViewportRequestedMediaBlockIds(new Set<number>());
  }, [mediaQueueSignature]);

  useEffect(() => {
    if (!mediaBlockIdsInOrder.length) return;

    if (typeof IntersectionObserver === 'undefined') {
      mediaBlockIdsInOrder.forEach((blockId) => markMediaBlockRequestedByViewport(blockId));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const target = entry.target as HTMLElement;
          const rawId = target.dataset.mediaBlockId;
          const blockId = Number(rawId);
          if (!Number.isFinite(blockId)) return;

          markMediaBlockRequestedByViewport(blockId);
          observer.unobserve(target);
        });
      },
      { threshold: MEDIA_VIEWPORT_UNLOCK_THRESHOLD }
    );

    mediaBlockIdsInOrder.forEach((blockId) => {
      if (viewportRequestedMediaBlockIds.has(blockId)) return;
      const el = mediaBlockElementsRef.current.get(blockId);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [mediaBlockIdsInOrder, viewportRequestedMediaBlockIds, markMediaBlockRequestedByViewport, MEDIA_VIEWPORT_UNLOCK_THRESHOLD]);

  const isMediaBlockUnlocked = useCallback((blockId: number) => {
    if (viewportRequestedMediaBlockIds.has(blockId)) return true;

    const mediaOrder = mediaOrderIndexByBlockId.get(blockId);
    if (mediaOrder === undefined) return true;
    return mediaOrder <= nextMediaBlockOrderToUnlock;
  }, [mediaOrderIndexByBlockId, nextMediaBlockOrderToUnlock, viewportRequestedMediaBlockIds]);

  const markBlockMediaItemSettled = useCallback((blockId: number, itemKey: string, totalItems: number) => {
    if (!totalItems || totalItems <= 0) return;

    let settledItems = settledMediaItemsRef.current.get(blockId);
    if (!settledItems) {
      settledItems = new Set<string>();
      settledMediaItemsRef.current.set(blockId, settledItems);
    }

    if (settledItems.has(itemKey)) return;
    settledItems.add(itemKey);

    if (settledItems.size < totalItems) return;
    if (settledMediaBlocksRef.current.has(blockId)) return;

    settledMediaBlocksRef.current.add(blockId);

    setNextMediaBlockOrderToUnlock((currentOrder) => {
      let nextOrder = currentOrder;
      while (nextOrder < mediaBlockIdsInOrder.length) {
        const blockAtOrder = mediaBlockIdsInOrder[nextOrder];
        if (!settledMediaBlocksRef.current.has(blockAtOrder)) break;
        nextOrder += 1;
      }
      return nextOrder;
    });
  }, [mediaBlockIdsInOrder]);


  const [modalSession, setModalSession] = useState(0);

const openModal = useCallback((items: ModalMediaItem[], startIndex: number) => {
  setModalIndex(startIndex);        // ✅ immediate (so slider knows where to start)
  setIsModalOpen(true);
  setModalSession((s) => s + 1);    // ✅ increments each open

  startTransition(() => {
    setModalItems(items);           // heavy update stays deferred
  });
}, []);

  const closeModal = useCallback(() => {
    // Make the click close instant
    setIsModalOpen(false);

    // Do NOT clear items/index on the click.
    // If you really want cleanup, do it later (won’t affect INP):
    const cleanup = () =>
      startTransition(() => {
        setModalItems([]);
        setModalIndex(0);
      });

    // @ts-ignore
    if (typeof requestIdleCallback === "function") requestIdleCallback(cleanup, { timeout: 1200 });
    else setTimeout(cleanup, 300);
  }, []);

  const modalUsesSlider = modalItems.length > 0 && modalItems.every(m => m.type === "image");

  useEffect(() => {
    if (canOpenPageInteractions) return;

    setIsModalOpen(false);
    setModalItems([]);
    setModalIndex(0);
    modalHistoryRef.current = false;
  }, [canOpenPageInteractions]);

  useEffect(() => {
    if (!isModalOpen) return;

    // Push a fake history entry once when modal opens
    if (!modalHistoryRef.current) {
      const prevState = window.history.state || {};
      const modalState = { ...prevState, __modal: true };

      window.history.pushState(modalState, '', window.location.href);
      modalHistoryRef.current = true;
    }

    const handlePopState = () => {
      // User pressed Back while modal is open → act like Escape
      if (isModalOpen) {
        setIsModalOpen(false);
        setModalItems([]);
        setModalIndex(0);
        modalHistoryRef.current = false;
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // If modal is closing/unmounting, we no longer care about that entry
      modalHistoryRef.current = false;
    };
  }, [isModalOpen]);


  useEffect(() => {
    if (!isModalOpen || modalLength <= 1) return;
    if (modalUsesSlider) return; // ✅ slider handles navigation

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextMedia();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevMedia();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
}, [isModalOpen, modalLength, modalUsesSlider, goToNextMedia, goToPrevMedia]);

  /* ────────── рендер одного блока ────────── */
  const renderImageGalleryBlock = (b: CollectionBlockDB) => {
    const rawItems = (b.content?.items || []) as any[];
    if (!rawItems.length) return null;
    const isBlockMediaUnlocked = isMediaBlockUnlocked(b.id);
    const totalMediaItems = rawItems.length;

    const globalAspectRatio = (b.content?.aspectRatio || "16 / 9") as string;
    const rowAspectRatios = (b.content?.rowAspectRatios || {}) as Record<string, string>;

    const hasRowInfo = rawItems.some(
      (item: any) => item.row !== undefined && item.row !== null && item.row !== ""
    );

    const buildModalItems = (items: any[]) =>
      items.map((item: any) => {
        const url = imageUrl(item.src);
        const isVideo = isVideoFile(item.src);
        return {
          url,
          type: isVideo ? "video" : "image",
          altText: item.title || "",
          title: item.title || "",
          description: item.description || "",
        } as ModalMediaItem;
      });

    // Non-row mode: keep your existing behavior (simple grid)
    if (!hasRowInfo) {
      const modalItems = buildModalItems(rawItems);
      const itemsCountForGrid = (b.content?.columns as number | undefined) ?? rawItems.length;
      const sequentialGroupKey = `gallery-${String(b.id)}`;
      let sequentialImageIndex = 0;

      return (
        <IMAGE_GALLERY key={b.id} $itemsCount={itemsCountForGrid} $aspectRatio={globalAspectRatio}>
          {rawItems.map((item: any, i: number) => {
            const media = modalItems[i];
            const isVideo = media.type === "video";
            const imageSequenceIndex = isVideo ? undefined : sequentialImageIndex++;
            const effectiveAspectRatio =
              (item.aspectRatio && String(item.aspectRatio).trim()) || globalAspectRatio;

            const fullSrc = imageUrl(item.src);
const thumbSrc = imageThumbLRUrl(item.src);

            return (
              <div key={i} style={{ aspectRatio: effectiveAspectRatio }}>
                {!isBlockMediaUnlocked ? (
                  <div aria-hidden="true" style={{ width: '100%', height: '100%', background: 'var(--collection-deferred-media-bg, #111)' }} />
                ) : isVideo ? (
                  <AutoPlayVideo
                    src={media.url}
                    alt={item.title || `Video ${i + 1}`}
                    preload="auto"
                    onSettled={() => markBlockMediaItemSettled(b.id, `gallery-${i}`, totalMediaItems)}
                  />
                ) : (
                  <PreloadedGridImage
                    src={thumbSrc}
                    alt={item.title || `Image ${i + 1}`}
                    loading="eager"
                    sequentialGroupKey={sequentialGroupKey}
                    sequentialIndex={imageSequenceIndex}
                    onSettled={() => markBlockMediaItemSettled(b.id, `gallery-${i}`, totalMediaItems)}
                    onClick={canOpenPageInteractions ? () => openModal(modalItems, i) : undefined}
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.src !== fullSrc) img.src = fullSrc; // fallback
                    }}
                    style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
                  />
                )}
              </div>
            );
          })}
        </IMAGE_GALLERY>
      );
    }

    // Row mode: group by row and render each row as its own grid
    const rowOrder: string[] = [];
    const rows = new Map<string, any[]>();

    for (const item of rawItems) {
      const rowKey = String(item.row ?? "1");
      if (!rows.has(rowKey)) {
        rows.set(rowKey, []);
        rowOrder.push(rowKey);
      }
      rows.get(rowKey)!.push(item);
    }

    // Flatten in row order for modal indexing
    const flatItems = rowOrder.flatMap((rk) => rows.get(rk)!);
    const modalItems = buildModalItems(flatItems);

    // IMPORTANT: We don’t want IMAGE_GALLERY forcing a single grid layout here.
    // So we render rows inside it and each row controls its own columns.
    let globalIndex = 0;
    const sequentialGroupKey = `gallery-${String(b.id)}`;
    let sequentialImageIndex = 0;

    return (
      <IMAGE_GALLERY key={b.id} $itemsCount={1} $aspectRatio={globalAspectRatio}>
        <ImageGalleryRows>
          {rowOrder.map((rowKey) => {
            const rowItems = rows.get(rowKey)!;
            const cols = rowItems.length;

            return (
              <ImageGalleryRow key={rowKey} $cols={cols}>
                {rowItems.map((item: any) => {
                  const media = modalItems[globalIndex];
                  const i = globalIndex;
                  globalIndex++;

                  const isVideo = media.type === "video";
                  const imageSequenceIndex = isVideo ? undefined : sequentialImageIndex++;
                  const effectiveAspectRatio =
                    (item.aspectRatio && String(item.aspectRatio).trim()) ||
                    (rowAspectRatios[rowKey] && String(rowAspectRatios[rowKey]).trim()) ||
                    globalAspectRatio;
                  const fullSrc = imageUrl(item.src);
const thumbSrc = imageThumbLRUrl(item.src);

                  return (
                    <div key={i} style={{ aspectRatio: effectiveAspectRatio }}>
                      {!isBlockMediaUnlocked ? (
                        <div aria-hidden="true" style={{ width: '100%', height: '100%', background: 'var(--collection-deferred-media-bg, #111)' }} />
                      ) : isVideo ? (
                        <AutoPlayVideo
                          src={media.url}
                          alt={item.title || `Video ${i + 1}`}
                          preload="auto"
                          onSettled={() => markBlockMediaItemSettled(b.id, `gallery-${i}`, totalMediaItems)}
                        />
                      ) : (
                        <PreloadedGridImage
                          src={thumbSrc}
                          alt={item.title || `Image ${i + 1}`}
                          loading="eager"
                          sequentialGroupKey={sequentialGroupKey}
                          sequentialIndex={imageSequenceIndex}
                          onSettled={() => markBlockMediaItemSettled(b.id, `gallery-${i}`, totalMediaItems)}
                          onClick={canOpenPageInteractions ? () => openModal(modalItems, i) : undefined}
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (img.src !== fullSrc) img.src = fullSrc;
                          }}
                          draggable={false}
                          style={{ height: '100%', display: 'block', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                  );
                })}
              </ImageGalleryRow>
            );
          })}
        </ImageGalleryRows>
      </IMAGE_GALLERY>
    );
  };





  /* ────────── CONTENT helpers ────────── */
const aspectLockToCss = (raw: any): string | null => {
  if (typeof raw !== 'string') return null;

  const v = raw.trim().toLowerCase();
  if (!v || v === 'no' || v === 'none' || v === 'off' || v === '0') return null;

  // Accept formats like "1:1", "16:9", "32 / 9", "1/1"
  const compact = v.replace(/\s+/g, '');

  const parsePair = (a: string, b: string) => {
    const an = Number(a);
    const bn = Number(b);
    if (!Number.isFinite(an) || !Number.isFinite(bn)) return null;
    if (an <= 0 || bn <= 0) return null;
    return `${an} / ${bn}`;
  };

  if (compact.includes(':')) {
    const [a, b] = compact.split(':');
    return a && b ? parsePair(a, b) : null;
  }

  if (compact.includes('/')) {
    const [a, b] = compact.split('/');
    return a && b ? parsePair(a, b) : null;
  }

  // If someone already wrote CSS form like "1 / 1", keep it as-is
  if (raw.includes('/')) return raw.trim();

  return null;
};

const normalizeAlign = (a: any): 'left' | 'center' | 'right' => {
  const s = typeof a === 'string' ? a.toLowerCase().trim() : 'left';
  if (s.startsWith('right')) return 'right';
  if (s.startsWith('center')) return 'center';
  return 'left';
};

const paddingToCss = (pad: any, fallback: string): string => {
  const raw = typeof pad === 'string' ? pad : fallback;
  const nums = raw
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => Number(x));

  const safe = (n: any) => (Number.isFinite(n) ? Math.max(0, Math.min(128, n)) : 0);

  // Accept 1, 2, or 4 values (CSS-like behavior)
  let t = 0, r = 0, b = 0, l = 0;
  if (nums.length === 1) {
    t = r = b = l = safe(nums[0]);
  } else if (nums.length === 2) {
    t = b = safe(nums[0]);
    r = l = safe(nums[1]);
  } else if (nums.length >= 4) {
    t = safe(nums[0]);
    r = safe(nums[1]);
    b = safe(nums[2]);
    l = safe(nums[3]);
  } else {
    // invalid → fallback
    return paddingToCss(fallback, fallback);
  }

  return `${t}px ${r}px ${b}px ${l}px`;
};

const renderBlock = (b: CollectionBlockDB) => {
    const isBlockMediaUnlocked = isMediaBlockUnlocked(b.id);
    switch (b.type) {

case 'CONTENT': {
        const contentItems = Array.isArray(b.content?.items) ? b.content.items : [];
        const totalContentMediaItems = contentItems.reduce((count: number, item: any) => {
          const kind = typeof item?.block === 'string' ? item.block.toLowerCase().trim() : '';
          if (kind === 'media') {
            const mediaItems = Array.isArray(item?.items)
              ? item.items
              : (Array.isArray(item?.content?.items) ? item.content.items : []);
            const firstMedia = mediaItems?.[0];
            return typeof firstMedia?.media === 'string' && firstMedia.media.trim()
              ? count + 1
              : count;
          }

          if (isContentYouTubeKind(kind)) {
            return getContentYoutubeId(item) ? count + 1 : count;
          }

          return count;
        }, 0);


  const componentPaddingCss = paddingToCss(b.content?.componentPadding, '0,0,0,0');
        const removeWidthRestriction = !!b.content?.removeWidthRestriction;
        const contentMaxWidth = removeWidthRestriction ? 'none' : '1440px';

        const contentEntries = contentItems.map((item: any, index: number) => ({ item, index }));
        const rowOrder: string[] = [];
        const rows = new Map<string, Array<{ item: any; index: number }>>();

        contentEntries.forEach((entry) => {
          const rowKey =
            typeof entry.item?.row === 'string' && entry.item.row.trim()
              ? entry.item.row.trim()
              : '1';

          if (!rows.has(rowKey)) {
            rows.set(rowKey, []);
            rowOrder.push(rowKey);
          }

          rows.get(rowKey)!.push(entry);
        });

        const renderContentEntry = (it: any, idx: number) => {
          const blockKind = typeof it?.block === 'string' ? it.block.toLowerCase().trim() : 'empty';

          const paddingCss =
            blockKind === 'text'
              ? paddingToCss(it?.padding, '24,24,24,24')
              : paddingToCss(it?.padding, '0,0,0,0');

          if (blockKind === 'text') {
            const blockItems = Array.isArray(it?.block_items) ? it.block_items : [];
            const aspectRatioLock = aspectLockToCss(
              it?.['aspect-ratio'] ?? it?.aspectRatio ?? it?.aspect_ratio
            );

            const renderTextItem = (t: any, keyId: string, forceInline: boolean) => {
              const obj = typeof t?.object === 'string' ? t.object.toLowerCase().trim() : 'body';
              const isHeading = obj === 'heading';

              const tagRaw = typeof t?.style === 'string' ? t.style.toLowerCase().trim() : '';
              const fallbackTag = isHeading ? 'h4' : 'h3';
              const tag = (
                ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em'].includes(tagRaw)
                  ? tagRaw
                  : fallbackTag
              ) as any;

              const align = normalizeAlign(t?.alignment);
              const size = Number(t?.size ?? 0);
              const sizeStyle =
                Number.isFinite(size) && size > 0 ? { fontSize: Math.min(128, size) } : undefined;

              const lineStyle: React.CSSProperties | undefined = forceInline
                ? {
                    ...(sizeStyle ?? {}),
                    display: 'inline',
                    width: 'auto',
                    maxHeight: 'none',
                    overflow: 'visible',
                  }
                : sizeStyle;

              const linkProps = getContentLinkProps(t?.link);

              const Line = isHeading ? CONTENT_TEXT_HEADING : CONTENT_TEXT_BODY;

              const lineNode = (
                <Line as={tag} $align={align} style={lineStyle}>
                  {linkProps ? renderMultiline(t?.text) : renderTextWithInlineLinks(t?.text)}
                </Line>
              );

              if (!linkProps) return <React.Fragment key={keyId}>{lineNode}</React.Fragment>;

              const LinkTag = forceInline ? CONTENT_INLINE_LINK : CONTENT_LINK;

              return (
                <LinkTag
                  key={keyId}
                  {...linkProps}
                  aria-label={typeof t?.text === 'string' ? t.text : 'Open link'}
                >
                  {lineNode}
                </LinkTag>
              );
            };

            const nodes: React.ReactNode[] = [];
            let inlineGroup: Array<{ item: any; itemIndex: number }> = [];

            const flushInline = () => {
              if (!inlineGroup.length) return;
              const group = inlineGroup;
              inlineGroup = [];

              nodes.push(
                <div key={`content-inline-group-${idx}-${nodes.length}`} style={{ width: '100%' }}>
                  {group.map(({ item, itemIndex }) =>
                    renderTextItem(item, `content-inline-${idx}-${itemIndex}`, true)
                  )}
                </div>
              );
            };

            blockItems.forEach((t: any, j: number) => {
              if (isInlineFlag(t?.inline)) {
                inlineGroup.push({ item: t, itemIndex: j });
                return;
              }

              flushInline();
              nodes.push(renderTextItem(t, `content-textline-${idx}-${j}`, false));
            });

            flushInline();

            return (
              <CONTENT_TEXT_BLOCK
                key={`content-text-${idx}`}
                $padding={paddingCss}
                $aspectRatio={aspectRatioLock}
                data-kind="text"
              >
                {nodes}
              </CONTENT_TEXT_BLOCK>
            );
          }

          if (blockKind === 'media') {
            const aspectRatio =
              typeof it?.aspectRatio === 'string' && it.aspectRatio.trim()
                ? it.aspectRatio
                : (typeof it?.content?.aspectRatio === 'string' ? it.content.aspectRatio : '16 / 9');

            const items = Array.isArray(it?.items)
              ? it.items
              : (Array.isArray(it?.content?.items) ? it.content.items : []);
            const first = items?.[0];
            const mediaName = typeof first?.media === 'string' ? first.media : '';

            if (!mediaName) {
              return <CONTENT_EMPTY_BLOCK key={`content-media-empty-${idx}`} $padding={paddingCss} />;
            }

            const url = imageUrl(mediaName);
            const isVideo = isVideoFile(mediaName);

            const wantsModal =
              typeof first?.modal === 'string' && first.modal.toLowerCase().trim() === 'yes';

            const modalImageItems: ModalMediaItem[] = (Array.isArray(items) ? items : [])
              .filter((x: any) => typeof x?.media === 'string' && x.media && !isVideoFile(x.media))
              .map((x: any) => ({
                url: imageUrl(String(x.media)),
                type: 'image',
                altText: x?.title ? String(x.title) : '',
                title: x?.title ? String(x.title) : '',
                description: x?.description ? String(x.description) : '',
              }));

            const handleContentMediaClick = () => {
              if (!wantsModal || isVideo || !modalImageItems.length) return;
              openModal(modalImageItems, 0);
            };

            return (
              <CONTENT_MEDIA_BLOCK
                key={`content-media-${idx}`}
                $padding={paddingCss}
                $aspectRatio={aspectRatio}
                role="group"
                aria-label={first?.title ? String(first.title) : 'Media'}
                data-modal={wantsModal ? 'yes' : 'no'}
                onClick={
                  isBlockMediaUnlocked && wantsModal && !isVideo && canOpenPageInteractions
                    ? handleContentMediaClick
                    : undefined
                }
                tabIndex={
                  isBlockMediaUnlocked && wantsModal && !isVideo && canOpenPageInteractions ? 0 : -1
                }
                onKeyDown={(e) => {
                  if (!(isBlockMediaUnlocked && wantsModal && !isVideo && canOpenPageInteractions)) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleContentMediaClick();
                  }
                }}
                data-kind="media"
              >
                <CONTENT_MEDIA_INNER>
                  {!isBlockMediaUnlocked ? (
                    <div
                      aria-hidden="true"
                      style={{ width: '100%', height: '100%', background: 'var(--collection-deferred-media-bg, #111)' }}
                    />
                  ) : isVideo ? (
                    <AutoPlayVideo
                      src={url}
                      alt={first?.title ? String(first.title) : 'Collection video'}
                      preload="auto"
                      onSettled={() =>
                        markBlockMediaItemSettled(b.id, `content-media-${idx}`, totalContentMediaItems)
                      }
                    />
                  ) : (
                    <PreloadedGridImage
                      src={url}
                      alt={first?.title ? String(first.title) : ''}
                      loading="eager"
                      onSettled={() =>
                        markBlockMediaItemSettled(b.id, `content-media-${idx}`, totalContentMediaItems)
                      }
                      style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
                    />
                  )}
                </CONTENT_MEDIA_INNER>
              </CONTENT_MEDIA_BLOCK>
            );
          }

          if (isContentYouTubeKind(blockKind)) {
            const aspectRatio =
              typeof it?.aspectRatio === 'string' && it.aspectRatio.trim()
                ? it.aspectRatio
                : (typeof it?.content?.aspectRatio === 'string' ? it.content.aspectRatio : '16 / 9');

            const videoId = getContentYoutubeId(it);
            if (!videoId) {
              return <CONTENT_EMPTY_BLOCK key={`content-youtube-empty-${idx}`} $padding={paddingCss} />;
            }

            const title =
              typeof it?.title === 'string' && it.title.trim()
                ? it.title.trim()
                : (typeof it?.content?.title === 'string' && it.content.title.trim()
                    ? it.content.title.trim()
                    : 'YouTube video');

            const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&controls=1&rel=0&playsinline=1`;

            return (
              <CONTENT_MEDIA_BLOCK
                key={`content-youtube-${idx}`}
                $padding={paddingCss}
                $aspectRatio={aspectRatio}
                role="group"
                aria-label={title}
                data-kind="media"
              >
                <CONTENT_MEDIA_INNER>
                  {!isBlockMediaUnlocked ? (
                    <div
                      aria-hidden="true"
                      style={{ width: '100%', height: '100%', background: 'var(--collection-deferred-media-bg, #111)' }}
                    />
                  ) : (
                    <iframe
                      src={embedUrl}
                      title={title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                      onLoad={() =>
                        markBlockMediaItemSettled(b.id, `content-youtube-${idx}`, totalContentMediaItems)
                      }
                    />
                  )}
                </CONTENT_MEDIA_INNER>
              </CONTENT_MEDIA_BLOCK>
            );
          }

          return <CONTENT_EMPTY_BLOCK key={`content-empty-${idx}`} $padding={paddingCss} />;
        };

        const renderContentRow = (rowEntries: Array<{ item: any; index: number }>, rowKey: string) => {
          const kinds = rowEntries
            .map(({ item }) => (typeof item?.block === 'string' ? item.block.toLowerCase().trim() : ''))
            .filter(Boolean);

          const isTextMediaPair =
            rowEntries.length === 2 &&
            kinds.includes('text') &&
            kinds.some((kind: string) => kind === 'media' || isContentYouTubeKind(kind));

          return (
            <WRAPPER_BLOCKS
              key={`content-row-${b.id}-${rowKey}`}
              $maxWidth={contentMaxWidth}
              data-count={rowEntries.length}
              data-pair={isTextMediaPair ? 'yes' : 'no'}
            >
              {rowEntries.map(({ item, index }) => renderContentEntry(item, index))}
            </WRAPPER_BLOCKS>
          );
        };

        return (
          <WRAPPER_COMPONENT $padding={componentPaddingCss}>
            <ImageGalleryRows style={{ width: '100%', maxWidth: contentMaxWidth }}>
              {(rowOrder.length ? rowOrder : ['1']).map((rowKey) =>
                renderContentRow(rows.get(rowKey) ?? [], rowKey)
              )}
            </ImageGalleryRows>
          </WRAPPER_COMPONENT>
        );
}

      case 'IMAGE_SLIDER': {
        const aspectRatio = b.content?.aspectRatio || '2 / 1';
        const images: ImageItem[] = b.content.items?.map((image: any) => ({
          src: imageUrl(image.src),
          title: image.title,
          description: image.description,
        })) || [];

        if (images.length === 0) return null;

        if (!isBlockMediaUnlocked) {
          return (
            <SliderWrapper $aspectRatio={aspectRatio}>
              <div aria-hidden="true" style={{ width: '100%', height: '100%', background: 'var(--collection-deferred-media-bg, #111)' }} />
            </SliderWrapper>
          );
        }

        return (
          <ImageSlider
            images={images}
            aspectRatio={aspectRatio}
            sequentialLoad={true}
            onImageSettled={(realIndex, total) =>
              markBlockMediaItemSettled(b.id, `image-single-${realIndex}`, total)
            }
          />
        );
      }

      case 'IMAGE_GALLERY':
        return renderImageGalleryBlock(b);

      /* ----- YouTube ----- */
      case 'YOUTUBE_PLAYER': {
        const content = b.content || {};
        const rawIdOrUrl = (content.youtubeId || content.youtubeUrl || '') as string;

        const videoId = getYouTubeId(rawIdOrUrl);
        if (!videoId) {
          console.warn('YOUTUBE_PLAYER block has no valid youtubeId/youtubeUrl', b);
          return null;
        }

        // still ok to keep internal title for iframe accessibility
        const title: string = content.title || 'YouTube video';

        const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&controls=1&rel=0&playsinline=1`;

        return (
          <YouTubePlayerWrapper key={b.id}>
            <YouTubeIframeContainer>
              {!isBlockMediaUnlocked ? (
                <div aria-hidden="true" style={{ width: '100%', height: '100%', background: 'var(--collection-deferred-media-bg, #111)' }} />
              ) : (
                <iframe
                  src={embedUrl}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  onLoad={() => markBlockMediaItemSettled(b.id, 'youtube', 1)}
                />
              )}
            </YouTubeIframeContainer>
          </YouTubePlayerWrapper>
        );
      }


      /* ----- разделители ----- */
      case 'SPLITTER_DEFAULT':
        return <hr key={b.id} style={{ margin: '20px 0', borderColor: '#444' }} />;
      case 'SPLITTER':
        // Hide SPLITTER blocks for photography pages since we have TopSplitter at the top
        if (source === 'photo') {
          return null;
        }
        return <CUSTOM_SPLITTER key={b.id} />;
      case 'SPLITTER_SPACE': {
        const height = b.content?.size || '100px'; // fallback if no size is defined
        return <div key={b.id} style={{ height }} />;
      }

      default:
        return null;
    }
  };

  /* ────────── MAIN JSX ────────── */
  const isPhoto = source === 'photo';
  return (
    <WRAPPER_GLOBAL $isPhoto={isPhoto}>
      {/* ——— верхний титул и фильтр ——— */}
      {showFilter && (
        <WorkTitelContainer>
          <WorkTitel>{source === 'photo' ? 'PHOTOGRAPHY' : 'WORK'}</WorkTitel>
          <WorkFilterWrapp>
            {['ALL', 'COMMERCIAL', 'PERSONAL'].map(cat => (
              <WorkTextFilter
                key={cat}
                onClick={() => {
                  if (filter !== cat) {
                    setFilter(cat as any);
                    updateUrlFilter(cat);
                  }
                }}
                className={filter === cat ? 'active' : ''}
                aria-label={`Filter by ${cat}`}
                aria-pressed={filter === cat}
                role="button"
              >
                {cat}
              </WorkTextFilter>
            ))}
          </WorkFilterWrapp>
        </WorkTitelContainer>
      )}

      {/* ——— хедер коллекции ——— */}
      {collection.main && (
        <CollectionAdditionalWrapper $isPhoto={isPhoto}>
          <CollectionHeader $isPhoto={isPhoto}>
            {collection.main.map(
              (
                s: {
                  label: string;
                  text: string;
                  tag?: 'h1' | 'h2' | 'h3';
                },
                i: number
              ) => {
                const normalizeTag = (tag?: string): keyof JSX.IntrinsicElements => {
                  if (typeof tag !== 'string') return 'p';
                  const lower = tag.toLowerCase();
                  if (lower === 'h1') return 'h3';
                  if (lower === 'h2') return 'h4';
                  const allowed: Array<keyof JSX.IntrinsicElements> = ['h3', 'h4', 'h5', 'p', 'span'];
                  return allowed.includes(lower as keyof JSX.IntrinsicElements)
                    ? (lower as keyof JSX.IntrinsicElements)
                    : 'p';
                };

                return (
                  <TEXT_MBLOCK_WRAPPER key={i} $isPhoto={isPhoto}>
                    <COLLECTION_4SEC_TITLE>{s.label}</COLLECTION_4SEC_TITLE>
                    <COLLECTION_4SEC_DESCRIPTION
                      as={normalizeTag(s.tag)}
                      dangerouslySetInnerHTML={{ __html: s.text }}
                    />
                  </TEXT_MBLOCK_WRAPPER>
                );
              }
            )}
          </CollectionHeader>
        </CollectionAdditionalWrapper>
      )}


      {/* ——— контент из collection_blocks ——— */}
      {blocks.map((b) => {
        const node = renderBlock(b);
        if (!node) return null;

        const isGallery = b.type === 'IMAGE_GALLERY';
        const hasMedia = mediaOrderIndexByBlockId.has(b.id);
        const renderedNode = (
          <div
            ref={hasMedia ? (el) => registerMediaBlockElement(b.id, el) : undefined}
            data-media-block-id={hasMedia ? String(b.id) : undefined}
          >
            <Reveal amount={isGallery ? 0 : undefined}>
              {b.type === 'CONTENT' ? node : <ContentBlockWrapper>{node}</ContentBlockWrapper>}
            </Reveal>
          </div>
        );

        if (!showEditorChrome) {
          return (
            <div key={b.id}>
              {renderedNode}
            </div>
          );
        }

        const isSelected = editor?.selectedBlockId === b.id;

        return (
          <div
            key={b.id}
            onClickCapture={(event) => {
              event.preventDefault();
              event.stopPropagation();
              editor?.onSelectBlock?.(b.id);
            }}
            style={{
              position: 'relative',
              outline: isSelected ? '1px solid rgba(255,255,255,0.72)' : '1px dashed rgba(255,255,255,0.28)',
              outlineOffset: '10px',
              marginBottom: '20px',
              cursor: 'pointer',
            }}
          >
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                editor?.onSelectBlock?.(b.id);
              }}
              style={{
                position: 'absolute',
                top: '-14px',
                left: '14px',
                zIndex: 4,
                border: '1px solid rgba(255,255,255,0.28)',
                background: isSelected ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.82)',
                color: '#fff',
                padding: '6px 10px',
                fontSize: '12px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {b.position}. {b.type}
            </button>
            {renderedNode}
          </div>
        );
      })}
      {showEditorChrome ? editor?.placeholder ?? null : null}

      {/* ——— модалка ——— */}

        <>
          <Modal isOpen={canOpenPageInteractions && isModalOpen} onClose={closeModal}>
            <CloseButton
              onClick={closeModal}
              aria-label="Close modal"
              title="Close modal (Press Escape)"
            >
              {typeof CloseIcon === 'string' ? (
                <img src={CloseIcon} alt="Close" style={{ width: '24px', height: '24px' }} />
              ) : (
                <CloseIcon />
              )}
            </CloseButton>
            <MediaContainer>
  {currentMedia ? (
    <>
      {/* ✅ If modal items are ALL images — use the IMAGE_SLIDER slider */}
      {modalItems.length > 0 && modalItems.every(m => m.type === "image") ? (
        <ImageSlider
  images={modalItems.map((m) => ({
    src: m.url,
    title: m.title,
    description: m.description,
  }))}
  autoPlay={false}
  keyboardNav={true}
  zoomable={true}
  startIndex={modalIndex}       // ✅ open at clicked thumb
  resetKey={modalSession}       // ✅ apply startIndex only per-open
  onActiveIndexChange={(i) => setModalIndex(i)} // keep text synced
  aspectRatio={"auto"}
  sequentialLoad={true}
  sequentialLoadStrategy="around-active"
/>
      ) : (
        <>
          {/* fallback: your old arrows + zoomable image / video */}
          {modalLength > 1 && (
            <>
              <ModalArrowZone
                type="button"
                onClick={goToPrevMedia}
                aria-label="Previous image"
                $side="left"
              >
                <img src={Left} alt="" />
              </ModalArrowZone>

              <ModalArrowZone
                type="button"
                onClick={goToNextMedia}
                aria-label="Next image"
                $side="right"
              >
                <img src={Right} alt="" />
              </ModalArrowZone>
            </>
          )}

          {currentMedia.type === "image" && (
            <ZoomableImage
              src={currentMedia.url}
              alt={currentMedia.altText}
              onLoad={() => {}}
              onError={() => {
                console.error("❌ Image failed to load:", currentMedia.url);
                failedMedia.current.add(currentMedia.url);
              }}
            />
          )}

          {currentMedia.type === "video" && currentMedia.url && (
            <video
              src={currentMedia.url}
              controls
              style={{ maxWidth: "100%", maxHeight: "80vh" }}
            />
          )}
        </>
      )}
    </>
  ) : (
    <div
      style={{
        width: "100%",
        height: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <video
        src={Loading}
        autoPlay
        loop
        muted
        playsInline
        style={{ width: 140, height: 140 }}
      />
    </div>
  )}
</MediaContainer>
            {(currentMedia?.title || currentMedia?.description || collection.work_title) && (
              <TextContainer>
                {currentMedia?.title && (
                  <MODAL_TITLE style={{}}>
                    {currentMedia?.title}
                  </MODAL_TITLE>
                )}
                {currentMedia?.description && (
                  <MODAL_DESCRIPTION style={{}}>
                    {currentMedia?.description}
                  </MODAL_DESCRIPTION>
                )}
              </TextContainer>
            )}


          </Modal>
        </>

    </WRAPPER_GLOBAL>
  );
};

export default CollectionComponent;

//STARTED
