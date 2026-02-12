import React, { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import { useLocation } from 'react-router-dom';
import Modal, {
  MODAL_TITLE,
  MODAL_DESCRIPTION,
  CloseButton,
  MediaContainer,
  TextContainer,
  ModalArrowZone,

} from '../Modal/Modal';
import Loading from '../../assets/video/logo_animated_hq.webm';
import { supabase, supabaseUrl } from '../../supabaseClient';

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
  COLLECTION_TEXT_TITLE_WRAPPER,
  COLLECTION_TEXT_TITLE,
  COLLECTION_1SEC_TITLE,
  COLLECTION_1SEC_DESCRIPTION,
  CollectionContainer,
  CollectionHeader,
  CollectionHeader2Sec,
  CollectionBlock,
  TextBlock,
  TEXT_MBLOCK_WRAPPER,
  TEXT_MBLOCK_WRAPPER_LIGHT,
  CollectionAdditionalWrapper,
  COLLECTION_4SEC_TITLE,
  COLLECTION_4SEC_DESCRIPTION,
  CollectionTextWrapper,
  ImageBlock,
  WorkTextFilter,
  WorkFilterWrapp,
  WorkTitelContainer,
  WorkTitel,
  CUSTOM_SPLITTER,
  YouTubePlayerWrapper,
  YouTubeIframeContainer,
  ContentBlockWrapper,
} from './CollectionComponent.styled';

/* ────────────────────────────────────────────── */
/* ТИПЫ                                           */
/* ────────────────────────────────────────────── */

export type BlockType =
  | 'IMAGE_SINGLE'
  | 'IMAGE_DOUBLE'
  | 'IMAGE_GALLERY'
  | 'IMAGE_TRIPLE'
  | 'IMAGE_QUADRUPLE'
  | 'IMAGE_QUINTUPLE'
  | 'SQUARE'
  | 'TEXT_4SEC' | 'TEXT_2SEC'
  | 'TEXT_1SEC' | 'TEXT_1SEC_LP' | 'TEXT_TITLE'
  | 'YOUTUBE_PLAYER'
  | 'SPLITTER' | 'SPLITTER_SPACE' | 'SPLITTER_DEFAULT';

export interface CollectionBlockDB {
  id: number;
  collection_id: number;
  type: BlockType;
  content: any;             // см. README
  description: string | null;
  position: number;
}

export interface CollectionData {
  id: number;
  folder: string;
  blocks: CollectionBlockDB[];

  // теперь main не обязателен
  main?: {
    label: string;
    text: string;
    tag?: 'h1' | 'h2' | 'h3';
  }[];

  // если вам больше не нужен work_title, можно убрать
  work_title?: string;
}


interface CollectionComponentProps {
  collection: CollectionData;
  source?: 'work' | 'photo';
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
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
};

const PreloadedGridImage: React.FC<PreloadedGridImageProps> = ({
  src,
  alt,
  onClick,
  style,
  draggable = false,
  onError,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      onClick={onClick}
      draggable={draggable}
      loading="lazy"
      decoding="async"
      onLoad={() => setVisible(true)}
      onError={onError}
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s ease",
        ...style,
      }}
    />
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

  // NEW:
  autoPlay?: boolean; // default true
  startIndex?: number; // 0-based (real image index)
  onActiveIndexChange?: (realIndex: number) => void; // 0..images.length-1
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  aspectRatio,
  autoPlay = true,
  keyboardNav = false,
  startIndex = 0,
  resetKey = 0,
  zoomable = false,
  onActiveIndexChange,
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
            {zoomable ? (
     <ZoomableImage
       src={img.src}
       alt={img.title || `Slide ${i + 1} of ${slides.length}`}
       onZoomChange={setIsZoomed}
       onError={() => console.error("❌ Image failed to load:", img.src)}
       onSwipeLeft={nextSlide}
  onSwipeRight={prevSlide}
     />
   ) : (
     <img
       src={img.src}
       alt={img.title || `Slide ${i + 1} of ${slides.length}`}
      draggable={false}
     />
   )}
          </Slide>
        ))}
      </SliderContent>
    </SliderWrapper>
  );
};


const ENABLE_SQUARE_MODAL = false; // flip to true if you want it back

//VIDEO
interface AutoPlayVideoProps {
  src: string;
  alt?: string;
}

const AutoPlayVideo: React.FC<AutoPlayVideoProps> = ({ src, alt }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  return (
    <video
      ref={videoRef}
      src={src}
      loop
      muted
      playsInline
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        objectFit: 'cover',
      }}
      aria-label={alt}
    />
  );
};

/* ────────────────────────────────────────────── */
/* КОМПОНЕНТ                                      */
/* ────────────────────────────────────────────── */
const CollectionComponent: React.FC<CollectionComponentProps> = ({
  collection,
  source,
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

  /* ────────── стейт блоков ────────── */
  const [blocks, setBlocks] = useState<CollectionBlockDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  /* Validate tag to ensure it's a valid HTML tag and not a data URI */
  const isValidTag = (tag: any): tag is keyof JSX.IntrinsicElements => {
    if (typeof tag !== 'string') return false;
    // Prevent data URIs and other invalid tag names
    return /^[a-z][a-z0-9]*$/.test(tag) && !tag.includes(':') && !tag.includes('/');
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

  /* ────────── загрузка блоков ────────── */
  useEffect(() => {
    (async () => {
      setIsLoading(true);

      // work → project_blocks, photo → collection_blocks
      const blocksTable =
        source === 'work' ? 'project_blocks' : 'collection_blocks';

      const { data, error } = await supabase
        .from(blocksTable)
        .select('*')
        .eq('collection_id', collection.id)
        .order('position');

      if (error) console.error(error);
      setBlocks(data || []);
      setIsLoading(false);
    })();
  }, [collection.id, source]);




  /* ────────── рендер одного блока ────────── */
  const renderImageGalleryBlock = (b: CollectionBlockDB) => {
    const rawItems = (b.content?.items || []) as any[];
    if (!rawItems.length) return null;

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

      return (
        <IMAGE_GALLERY key={b.id} $itemsCount={itemsCountForGrid} $aspectRatio={globalAspectRatio}>
          {rawItems.map((item: any, i: number) => {
            const media = modalItems[i];
            const isVideo = media.type === "video";
            const effectiveAspectRatio =
              (item.aspectRatio && String(item.aspectRatio).trim()) || globalAspectRatio;

            const fullSrc = imageUrl(item.src);
const thumbSrc = imageThumbLRUrl(item.src);

            return (
              <div key={i} style={{ aspectRatio: effectiveAspectRatio }}>
                {isVideo ? (
                  <AutoPlayVideo src={media.url} alt={item.title || `Video ${i + 1}`} />
                ) : (
                  <PreloadedGridImage
  src={thumbSrc}
  alt={item.title || `Image ${i + 1}`}
  onClick={() => openModal(modalItems, i)}
  onError={(e) => {
    const img = e.currentTarget;
    if (img.src !== fullSrc) img.src = fullSrc; // fallback
  }}
  style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
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
                  const effectiveAspectRatio =
                    (item.aspectRatio && String(item.aspectRatio).trim()) ||
                    (rowAspectRatios[rowKey] && String(rowAspectRatios[rowKey]).trim()) ||
                    globalAspectRatio;
                  const fullSrc = imageUrl(item.src);
const thumbSrc = imageThumbLRUrl(item.src);

                  return (
                    <div key={i} style={{ aspectRatio: effectiveAspectRatio }}>
                      {isVideo ? (
                        <AutoPlayVideo src={media.url} alt={item.title || `Video ${i + 1}`} />
                      ) : (
                        <PreloadedGridImage
  src={thumbSrc}
  alt={item.title || `Image ${i + 1}`}
  onClick={() => openModal(modalItems, i)}
  onError={(e) => {
    const img = e.currentTarget;
    if (img.src !== fullSrc) img.src = fullSrc;
  }}
  draggable={false}
  style={{ height: "100%", display: "block", objectFit: "cover" }}
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





  const renderBlock = useCallback((b: CollectionBlockDB) => {
    switch (b.type) {
      case 'IMAGE_SINGLE': {
        const aspectRatio = b.content?.aspectRatio || '2 / 1';
        const images: ImageItem[] = b.content.items?.map((image: any) => ({
          src: imageUrl(image.src),
          title: image.title,
          description: image.description,
        })) || [];

        if (images.length === 0) return null;

        return <ImageSlider images={images} aspectRatio={aspectRatio} />;
      }

      case 'IMAGE_GALLERY':
        return renderImageGalleryBlock(b);

      /* ----- SQUARE: картинка + заголовок ----- */
      // one block in DB, can render 1–2 rows

      case 'SQUARE': {
        const items = (b.content?.items || []) as {
          src: string;
          label?: string;
          title?: string;
          description?: string;
        }[];
        
        const modalItems: ModalMediaItem[] = items.map((item) => {
          const url = imageUrl(item.src);
          const isVideo = isVideoFile(item.src);

          return {
            url,
            type: isVideo ? 'video' : 'image',
            altText: item.title || '',
            title: item.title || '',
            description: item.description || '',
          };
        });

        if (!items.length) return null;

        // 👇 new flag from Supabase JSON
        const startWithText = !!b.content?.startWithText;
        

        return (
          <>
            {items.map((item, index) => {
              const isEven = index % 2 === 0;

              // default: image|text on first row
              // startWithText: text|image on first row
              const textFirst = startWithText ? isEven : !isEven;

              const media = modalItems[index];
              const isVideo = media.type === 'video';

              const Pic = (
                <ImageBlock className="square-media" key={`pic-${index}`}>
                  {isVideo ? (
                    <AutoPlayVideo
                      src={media.url}
                      alt={item.title || 'Collection video'}
                    />
                  ) : (
                    <img
  src={media.url}
  alt={item.title || "Collection image"}
  onClick={ENABLE_SQUARE_MODAL ? () => openModal(modalItems, index) : undefined}
  onKeyDown={
    ENABLE_SQUARE_MODAL
      ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openModal(modalItems, index);
          }
        }
      : undefined
  }
  role={ENABLE_SQUARE_MODAL ? "button" : undefined}
  tabIndex={ENABLE_SQUARE_MODAL ? 0 : undefined}
/>
                  )}
                </ImageBlock>
              );


              const Txt = (
                <TextBlock className="square-text" key={`txt-${index}`}>
                  {item.label && (
                    <h1>
                      {item.label.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </h1>
                  )}
                </TextBlock>
              );

              return (
                <CollectionBlock key={`${b.id}-${index}`}>
                  {textFirst ? Txt : Pic}
                  {textFirst ? Pic : Txt}
                </CollectionBlock>
              );
            })}
          </>
        );
      }

        /* ----- текстовые секции ----- */

        interface Section {
          label: string;
          text: string;
          tag?: 'h1' | 'h2' | 'h3';
        }


      case 'TEXT_4SEC':
        return (
          <CollectionAdditionalWrapper>
            <CollectionHeader
              key={b.id}
              style={b.type.endsWith('_LP') ? { padding: '10px 0' } : {}}
            >
              {b.content.sections.map((s: Section, i: number) => (
                <TEXT_MBLOCK_WRAPPER key={i}>
                  <COLLECTION_4SEC_TITLE>{s.label}</COLLECTION_4SEC_TITLE>
                  <COLLECTION_4SEC_DESCRIPTION as={isValidTag(s.tag) ? (s.tag as any) : 'h2'}>
                    {s.text.split('\n').map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </COLLECTION_4SEC_DESCRIPTION>
                </TEXT_MBLOCK_WRAPPER>
              ))}
            </CollectionHeader>
          </CollectionAdditionalWrapper>
        );

      case 'TEXT_2SEC':
  return (
    <CollectionAdditionalWrapper>
      <CollectionHeader2Sec
        key={b.id}
        style={b.type.endsWith('_LP') ? { padding: '10px 0' } : {}}
      >
        {b.content.sections.map((s: Section, i: number) => (
          <TEXT_MBLOCK_WRAPPER_LIGHT key={i}>
            <COLLECTION_4SEC_TITLE>{s.label}</COLLECTION_4SEC_TITLE>
            <COLLECTION_4SEC_DESCRIPTION as={isValidTag(s.tag) ? (s.tag as any) : 'h2'}>
              {s.text.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </COLLECTION_4SEC_DESCRIPTION>
          </TEXT_MBLOCK_WRAPPER_LIGHT>
        ))}
      </CollectionHeader2Sec>
    </CollectionAdditionalWrapper>
  );

        interface TextSegmentB {
          text: string;
          tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
          link?: string;
        }
        interface SectionB {
          label?: string;
          segments: TextSegmentB[];
        }
      case 'TEXT_1SEC':
      case 'TEXT_1SEC_LP': {
        const normalizeSegmentTag = (tag?: string): keyof JSX.IntrinsicElements => {
  if (typeof tag !== 'string') return 'span';
  const lower = tag.toLowerCase().trim();

  // security / sanity (same idea as your other validator)
  if (lower.startsWith('data:') || lower.includes(':') || lower.includes('/')) return 'span';

  const allowed: Array<keyof JSX.IntrinsicElements> = [
    'h1','h2','h3','h4','h5','h6',
    'p','span','strong','em',
  ];

  return allowed.includes(lower as any) ? (lower as any) : 'span';
};

        const renderTextWithBreaks = (text: string) =>
          text.split('\n').map((line, lineIdx, arr) => (
            <React.Fragment key={lineIdx}>
              {line}
              {lineIdx < arr.length - 1 && <br />}
            </React.Fragment>
          ));

        return (
          <CollectionAdditionalWrapper>
            <CollectionTextWrapper key={b.id}>
              {b.content.sections.map((section: SectionB, i: number) => {
                const hasLabel =
                  typeof section.label === 'string' && section.label.trim().length > 0;

                return (
                  <div key={i}>
                    {hasLabel && (
                      <COLLECTION_1SEC_TITLE>{section.label}</COLLECTION_1SEC_TITLE>
                    )}

                    <COLLECTION_1SEC_DESCRIPTION>
                      {section.segments.map((seg, idx) => {
                        const Tag = normalizeSegmentTag(seg.tag);

                        const element = (
                          <Tag key={idx} style={{ display: 'inline' }}>
                            {renderTextWithBreaks(seg.text)}
                          </Tag>
                        );

                        return seg.link ? (
                          <a
                            key={idx}
                            href={seg.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${seg.text} (opens in new tab)`}
                          >
                            {element}
                          </a>
                        ) : (
                          element
                        );
                      })}
                    </COLLECTION_1SEC_DESCRIPTION>
                  </div>
                );
              })}
            </CollectionTextWrapper>
          </CollectionAdditionalWrapper>
        );
      }

      case 'TEXT_TITLE': {
        // предполагаем, что content имеет именно такую форму:
        // { style: 'h1'|'h2'|'h3', text: string, fontsize: string, align: 'left'|'center'|'right' }
        const { text, fontsize, align } = b.content as {
          style?: 'h1' | 'h2' | 'h3' | string;
          text: string;
          fontsize: string;
          align: 'left' | 'center' | 'right';
        };

        // Always render as h1 for SEO/semantics, regardless of stored style
        const headingTag: 'h1' = 'h1';

        return (
          <COLLECTION_TEXT_TITLE_WRAPPER key={b.id} align={align}>
            <COLLECTION_TEXT_TITLE as={headingTag} fontSize={fontsize} align={align}>
              {text}
            </COLLECTION_TEXT_TITLE>
          </COLLECTION_TEXT_TITLE_WRAPPER>
        );
      }


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
              <iframe
                src={embedUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
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
  },
    [collection.folder, bucket, source, openModal] // deps
  );

  /* ────────── LOADING ────────── */
  if (isLoading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
        }}
      >
        <video
          src={Loading}
          autoPlay
          loop
          muted
          playsInline
          style={{ width: 150, height: 150 }}
        />
      </div>
    );
  }

  /* ────────── MAIN JSX ────────── */
  const isPhoto = source === 'photo';
  return (
    <CollectionContainer $isPhoto={isPhoto}>
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

        return (
          <Reveal
            key={b.id}
            amount={isGallery ? 0.08 : undefined}  // 👈 tall galleries trigger almost immediately
          >
            <ContentBlockWrapper>{node}</ContentBlockWrapper>
          </Reveal>
        );
      })}

      {/* ——— модалка ——— */}

        <>
          <Modal isOpen={isModalOpen} onClose={closeModal}>
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
      {/* ✅ If modal items are ALL images — use the IMAGE_SINGLE slider */}
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

    </CollectionContainer>
  );
};

export default CollectionComponent;

//STARTED