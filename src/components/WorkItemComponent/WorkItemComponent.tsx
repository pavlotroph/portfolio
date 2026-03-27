import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ImageDescription,
  VideoPreview,
  WorkItemContainer,
  PreviewLayer,
  OriginalLayer,
  HoverGradient,
} from '../../pages/Work/Work.styled';
import LoadingWebm from '../../assets/video/logo_animated_hq.webm';
import LoadingMp4 from '../../assets/video/logo.mp4';
import { WorkItemData } from '../../pages/Work/Work';

const HOVER_SETTLE_DURATION_MS = 400;

interface WorkItemComponentProps {
  work: WorkItemData;
  source: 'work' | 'photo';
  loadEnabled?: boolean;
  onPreviewSettled?: () => void;
  touchActive?: boolean;
}

const WorkItemComponent: React.FC<WorkItemComponentProps> = ({
  work,
  source,
  loadEnabled = true,
  onPreviewSettled,
  touchActive = false,
}) => {
  const bucket = source === 'work' ? 'work-images' : 'photography-images';

  const [isLoading, setIsLoading] = useState(true);
  const [isPointerHovered, setIsPointerHovered] = useState(false);
  const [isOriginalLoaded, setIsOriginalLoaded] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [shouldLoadOriginal, setShouldLoadOriginal] = useState(false);
  const [shouldActivateHoverMedia, setShouldActivateHoverMedia] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const loadingVideoRef = useRef<HTMLVideoElement>(null);
  const previewImgRef = useRef<HTMLImageElement | null>(null);
  const previewSettledRef = useRef(false);
  const onPreviewSettledRef = useRef<(() => void) | undefined>(onPreviewSettled);
  const hoverActivatedAtRef = useRef<number | null>(null);
  const hoverReleaseTimeoutRef = useRef<number | null>(null);
  const hoverReactivationTimeoutRef = useRef<number | null>(null);
  const hoverReentryLockedUntilRef = useRef<number | null>(null);
  const requestedHoverRef = useRef(false);
  const loadEnabledRef = useRef(loadEnabled);

  const { folder, image_name, title, preview_url, vimeo_id } = work;
  const isVimeo = Boolean(vimeo_id);
  const isVideo = image_name.toLowerCase().endsWith('.mp4');

  const src = `https://isglxygpyiuszrsqfttp.supabase.co/storage/v1/object/public/${bucket}/${folder}/${image_name}`;
  const previewSrc = !preview_url
    ? src
    : preview_url.startsWith('http')
      ? preview_url
      : `https://isglxygpyiuszrsqfttp.supabase.co/storage/v1/object/public/${bucket}/${folder}/${preview_url}`;
  const previewLooksLikeImage = /\.(avif|webp|png|jpe?g|gif|bmp|svg)([?#].*)?$/i.test(previewSrc);
  const shouldUseImgPreview = !isVideo || previewLooksLikeImage || Boolean(preview_url);

  const sameStaticImage = !isVideo && previewSrc === src;
  const requestedHover = loadEnabled && (isPointerHovered || touchActive);
  const [isHovered, setIsHovered] = useState(false);

  const markPreviewSettled = useCallback(() => {
    setIsLoading(false);

    if (!previewSettledRef.current) {
      previewSettledRef.current = true;
      onPreviewSettledRef.current?.();
    }
  }, []);

  const clearHoverReleaseTimeout = useCallback(() => {
    if (hoverReleaseTimeoutRef.current !== null) {
      window.clearTimeout(hoverReleaseTimeoutRef.current);
      hoverReleaseTimeoutRef.current = null;
    }
  }, []);

  const clearHoverReactivationTimeout = useCallback(() => {
    if (hoverReactivationTimeoutRef.current !== null) {
      window.clearTimeout(hoverReactivationTimeoutRef.current);
      hoverReactivationTimeoutRef.current = null;
    }
  }, []);

  const settlePreviewIfComplete = useCallback((imgEl: HTMLImageElement | null) => {
    if (!loadEnabled || !shouldUseImgPreview) return;
    if (!imgEl) return;
    if (!imgEl.getAttribute('src')) return;
    if (!imgEl.complete) return;

    // Cached previews can be complete before React dispatches onLoad.
    if (imgEl.naturalWidth > 0) {
      markPreviewSettled();
    }
  }, [loadEnabled, shouldUseImgPreview, markPreviewSettled]);

  useEffect(() => {
    onPreviewSettledRef.current = onPreviewSettled;
  }, [onPreviewSettled]);

  useEffect(() => {
    requestedHoverRef.current = requestedHover;
  }, [requestedHover]);

  useEffect(() => {
    loadEnabledRef.current = loadEnabled;
  }, [loadEnabled]);

  useEffect(() => {
    previewSettledRef.current = false;
    setIsLoading(true);
    setIsPointerHovered(false);
    clearHoverReleaseTimeout();
    clearHoverReactivationTimeout();
    hoverActivatedAtRef.current = null;
    hoverReentryLockedUntilRef.current = null;
    setIsHovered(false);
    setIsOriginalLoaded(false);
    setIsVideoReady(false);
    setShouldLoadOriginal(false);
    setShouldActivateHoverMedia(false);
  }, [previewSrc, src, clearHoverReleaseTimeout, clearHoverReactivationTimeout]);

  const activateHoverState = useCallback(() => {
    if (!loadEnabled) return;

    if (!isVideo && !sameStaticImage) {
      setShouldLoadOriginal(true);
    }

    if (isVideo || isVimeo) {
      setShouldActivateHoverMedia(true);
    }
  }, [isVideo, isVimeo, loadEnabled, sameStaticImage]);

  const scheduleHoverReactivation = useCallback((delayMs: number) => {
    clearHoverReactivationTimeout();

    hoverReactivationTimeoutRef.current = window.setTimeout(() => {
      hoverReactivationTimeoutRef.current = null;

      if (!loadEnabledRef.current || !requestedHoverRef.current) {
        return;
      }

      hoverReentryLockedUntilRef.current = null;
      hoverActivatedAtRef.current = performance.now();
      setIsHovered(true);
    }, delayMs);
  }, [clearHoverReactivationTimeout]);

  useEffect(() => {
    if (!loadEnabled) {
      clearHoverReleaseTimeout();
      clearHoverReactivationTimeout();
      hoverActivatedAtRef.current = null;
      hoverReentryLockedUntilRef.current = null;
      setIsHovered(false);
      return;
    }

    if (requestedHover) {
      clearHoverReleaseTimeout();

      if (isHovered) {
        clearHoverReactivationTimeout();

        if (hoverActivatedAtRef.current === null) {
          hoverActivatedAtRef.current = performance.now();
        }

        return;
      }

      const lockedUntil = hoverReentryLockedUntilRef.current;
      const remainingLock = lockedUntil === null
        ? 0
        : Math.max(0, lockedUntil - performance.now());

      if (remainingLock > 0) {
        scheduleHoverReactivation(remainingLock);
        return;
      }

      clearHoverReactivationTimeout();
      hoverReentryLockedUntilRef.current = null;
      hoverActivatedAtRef.current = performance.now();
      setIsHovered(true);
      return;
    }

    clearHoverReactivationTimeout();

    if (!isHovered) {
      hoverActivatedAtRef.current = null;
      return;
    }

    const hoverActivatedAt = hoverActivatedAtRef.current ?? performance.now();
    const elapsed = performance.now() - hoverActivatedAt;
    const remaining = Math.max(0, HOVER_SETTLE_DURATION_MS - elapsed);

    clearHoverReleaseTimeout();

    if (remaining === 0) {
      hoverActivatedAtRef.current = null;
      hoverReentryLockedUntilRef.current = performance.now() + HOVER_SETTLE_DURATION_MS;
      setIsHovered(false);
      return;
    }

    hoverReleaseTimeoutRef.current = window.setTimeout(() => {
      hoverReleaseTimeoutRef.current = null;
      hoverActivatedAtRef.current = null;
      hoverReentryLockedUntilRef.current = performance.now() + HOVER_SETTLE_DURATION_MS;
      setIsHovered(false);
    }, remaining);
  }, [
    requestedHover,
    loadEnabled,
    isHovered,
    clearHoverReleaseTimeout,
    clearHoverReactivationTimeout,
    scheduleHoverReactivation,
  ]);

  useEffect(() => {
    return () => {
      clearHoverReleaseTimeout();
      clearHoverReactivationTimeout();
    };
  }, [clearHoverReleaseTimeout, clearHoverReactivationTimeout]);

  useEffect(() => {
    if (!loadEnabled) return;

    if (!shouldUseImgPreview) {
      markPreviewSettled();
      return;
    }

    const imgEl = previewImgRef.current;
    if (!imgEl) return;

    // Cached images may already be complete before React dispatches onLoad.
    settlePreviewIfComplete(imgEl);
  }, [previewSrc, loadEnabled, shouldUseImgPreview, settlePreviewIfComplete]);

  useEffect(() => {
    if (!loadEnabled || !isLoading || !shouldUseImgPreview || previewSettledRef.current) return;

    const timeoutId = window.setTimeout(() => {
      // Prevent a single missed image load/error event from blocking the whole list.
      markPreviewSettled();
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [loadEnabled, isLoading, previewSrc, shouldUseImgPreview]);

  useEffect(() => {
    if (!loadEnabled) return;

    if (isHovered && isVideo && !isVimeo && shouldActivateHoverMedia && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Video play interrupted:', error);
        }
      });
    } else if (isVideo && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isHovered, isVideo, isVimeo, loadEnabled, shouldActivateHoverMedia]);

  useEffect(() => {
    if (isHovered) {
      activateHoverState();
      return;
    }

    setIsVideoReady(false);
  }, [activateHoverState, isHovered]);

  const showHoverVideoLoader =
    loadEnabled &&
    isHovered &&
    (isVideo || isVimeo) &&
    shouldActivateHoverMedia &&
    !isVideoReady;

  const showLoaderOverlay = loadEnabled && (isLoading || showHoverVideoLoader);
  const showLockedPlaceholder = !loadEnabled;
  const showInitialPlaceholder = isLoading || showLockedPlaceholder;
  const loaderOverlayBackground = showInitialPlaceholder
    ? 'var(--collection-deferred-media-bg, rgb(10, 10, 10))'
    : '#000';

  useEffect(() => {
    if (!showLoaderOverlay || !loadingVideoRef.current) return;

    loadingVideoRef.current.play().catch(e => {
      if (e.name !== 'AbortError') {
        console.error('Loading video play error:', e);
      }
    });
  }, [showLoaderOverlay]);

  const handleMouseEnter = () => {
    if (!loadEnabled) return;

    setIsPointerHovered(true);
    activateHoverState();
  };

  const handleMouseLeave = () => {
    setIsPointerHovered(false);
  };

  return (
    <WorkItemContainer
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="work-item"
      data-touch-hover-id={String(work.id)}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: loaderOverlayBackground,
          zIndex: showLoaderOverlay ? 4 : 0,
          opacity: showLoaderOverlay || showLockedPlaceholder ? 1 : 0,
          pointerEvents: showLoaderOverlay ? 'auto' : 'none',
          transition: 'opacity 0.6s ease-in-out',
        }}
      >
        {showLoaderOverlay ? (
          <video
            ref={loadingVideoRef}
            loop
            muted
            playsInline
            aria-label="Loading animation"
            style={{ width: '100px', height: '100px' }}
          >
            <source src={LoadingWebm} type="video/webm" />
            <source src={LoadingMp4} type="video/mp4" />
          </video>
        ) : null}
      </div>

      <PreviewLayer $isVisible={!isLoading} $imageUrl={previewSrc}>
        <img
          ref={(el) => {
            previewImgRef.current = el;
            settlePreviewIfComplete(el);
          }}
          src={loadEnabled && shouldUseImgPreview ? previewSrc : undefined}
          alt={title || `Preview image for ${work.title || 'work item'}`}
          loading={loadEnabled ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => {
            markPreviewSettled();
          }}
          onError={() => {
            console.error('Failed to load preview image:', previewSrc);
            markPreviewSettled();
          }}
        />
      </PreviewLayer>

      {!isVideo && !sameStaticImage && (
        <OriginalLayer $isVisible={isHovered && isOriginalLoaded}>
          <img
            src={shouldLoadOriginal ? src : undefined}
            alt={title || `Full image for ${work.title || 'work item'}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsOriginalLoaded(true)}
          />
        </OriginalLayer>
      )}

      {(isVideo || isVimeo) && (
        <VideoPreview $isVisible={isHovered}>
          {isVimeo ? (
            shouldActivateHoverMedia ? (
              <iframe
                src={`https://player.vimeo.com/video/${vimeo_id}?autoplay=1&muted=1&loop=1&background=1`}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                loading="lazy"
                title={title || `Video player for ${work.title || 'work item'}`}
                aria-label={title || `Video player for ${work.title || 'work item'}`}
                onLoad={() => setIsVideoReady(true)}
              />
            ) : null
          ) : shouldActivateHoverMedia ? (
            <video
              ref={videoRef}
              src={src}
              muted
              loop
              preload="none"
              playsInline
              disablePictureInPicture
              aria-label={title || `Video preview for ${work.title || 'work item'}`}
              onCanPlay={() => setIsVideoReady(true)}
              onPlaying={() => setIsVideoReady(true)}
            />
          ) : null}
        </VideoPreview>
      )}

      <HoverGradient $isVisible={isHovered} />

      <ImageDescription
        $isVisible={
          isHovered &&
          ((!isVideo && !isVimeo) || isVideoReady)
        }
      >
        {title}
      </ImageDescription>
    </WorkItemContainer>
  );
};

export default WorkItemComponent;
