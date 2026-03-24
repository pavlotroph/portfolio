import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

interface ImageScrollerProps {
  src?: string | null;
  alt?: string;
  aspectRatio?: string;
  disabled?: boolean;
  onSettled?: () => void;
}

const fullBleed = css`
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
`;

const ScrollerShell = styled.figure<{ $aspectRatio: string }>`
  ${fullBleed}
  position: relative;
  margin: 0;
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio};
  overflow: hidden;
  background: #050505;
`;

const ScrollerViewport = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--collection-deferred-media-bg, #111);
`;

const ScrollerPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0)),
    var(--collection-deferred-media-bg, #111);
`;

const ScrollerImage = styled.img<{ $animate: boolean }>`
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
  pointer-events: none;
  will-change: transform;
  transition: ${({ $animate }) =>
    $animate ? 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none'};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const ControlsFade = styled.div`
  position: absolute;
  inset: auto 0 0 0;
  height: clamp(92px, 14vw, 132px);
  pointer-events: none;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.74));
`;

const Controls = styled.div`
  position: absolute;
  left: clamp(16px, 3vw, 28px);
  right: clamp(16px, 3vw, 28px);
  bottom: clamp(14px, 3vw, 24px);
  z-index: 2;
`;

const Track = styled.div<{ $interactive: boolean; $active: boolean }>`
  position: relative;
  height: clamp(44px, 6vw, 58px);
  display: flex;
  align-items: center;
  cursor: ${({ $interactive }) => ($interactive ? 'ew-resize' : 'default')};
  touch-action: none;
  outline: none;
  opacity: ${({ $interactive }) => ($interactive ? 1 : 0.72)};
  transition: opacity 140ms ease;

  ${({ $active }) =>
    $active
      ? css`
          opacity: 1;
        `
      : null}
`;

const TrackRail = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.28);
`;

const TrackProgress = styled.div<{ $scale: number; $active: boolean }>`
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px;
  background: ${({ $active }) => ($active ? '#ffffff' : 'rgba(255, 255, 255, 0.86)')};
  transform-origin: left center;
  transform: scaleX(${({ $scale }) => $scale});
  transition: background 180ms ease;
`;

const TrackThumb = styled.div<{ $interactive: boolean; $active: boolean; $width: number }>`
  position: absolute;
  top: 50%;
  left: 0;
  height: 10px;
  width: ${({ $width }) => `${$width}px`};
  border-radius: 0;
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.18),
    0 0 26px rgba(255, 255, 255, 0.12);
  transform: translate3d(0, -50%, 0);
  transition:
    height 180ms ease,
    background 180ms ease,
    box-shadow 180ms ease;

  ${({ $interactive, $active }) =>
    $interactive && $active
      ? css`
          height: 12px;
          background: #ffffff;
          box-shadow:
            0 0 0 1px rgba(0, 0, 0, 0.18),
            0 0 34px rgba(255, 255, 255, 0.2);
        `
      : null}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const ImageScroller: React.FC<ImageScrollerProps> = ({
  src,
  alt = '',
  aspectRatio = '2 / 1',
  disabled = false,
  onSettled,
}) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const settledRef = useRef(false);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const [progress, setProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [metrics, setMetrics] = useState({
    maxOffset: 0,
    trackWidth: 0,
    thumbWidth: 0,
  });

  const notifySettled = useCallback(() => {
    if (settledRef.current) return;
    settledRef.current = true;
    onSettled?.();
  }, [onSettled]);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const image = imageRef.current;
    if (!viewport || !track) return;

    const viewportRect = viewport.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const imageHeight = image ? image.getBoundingClientRect().height : 0;
    const maxOffset = Math.max(0, imageHeight - viewportRect.height);
    const visibleRatio = imageHeight > 0 ? Math.min(1, viewportRect.height / imageHeight) : 1;
    const minThumbWidth = Math.min(trackRect.width, 56);
    const thumbWidth =
      trackRect.width > 0
        ? Math.min(trackRect.width, Math.max(minThumbWidth, trackRect.width * visibleRatio))
        : 0;

    setMetrics((current) => {
      const next = {
        maxOffset,
        trackWidth: trackRect.width,
        thumbWidth,
      };

      if (
        Math.abs(current.maxOffset - next.maxOffset) < 0.5 &&
        Math.abs(current.trackWidth - next.trackWidth) < 0.5 &&
        Math.abs(current.thumbWidth - next.thumbWidth) < 0.5
      ) {
        return current;
      }

      return next;
    });
  }, []);

  const stopProgressAnimation = useCallback(() => {
    if (animationFrameRef.current == null) return;
    window.cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
  }, []);

  const animateProgressTowardTarget = useCallback(() => {
    const current = progressRef.current;
    const target = targetProgressRef.current;
    const diff = target - current;

    if (Math.abs(diff) < 0.001) {
      progressRef.current = target;
      setProgress(target);
      animationFrameRef.current = null;
      return;
    }

    const ease = isDraggingRef.current ? 0.34 : 0.18;
    const nextProgress = current + diff * ease;
    progressRef.current = nextProgress;
    setProgress(nextProgress);
    animationFrameRef.current = window.requestAnimationFrame(animateProgressTowardTarget);
  }, []);

  const setTargetProgress = useCallback(
    (value: number) => {
      const nextTarget = clamp01(value);
      targetProgressRef.current = nextTarget;

      if (animationFrameRef.current == null) {
        animationFrameRef.current = window.requestAnimationFrame(animateProgressTowardTarget);
      }
    },
    [animateProgressTowardTarget]
  );

  useEffect(() => {
    settledRef.current = false;
    stopProgressAnimation();
    progressRef.current = 0;
    targetProgressRef.current = 0;
    isDraggingRef.current = false;
    setProgress(0);
    setIsHovering(false);
    setIsDragging(false);
    setMetrics({
      maxOffset: 0,
      trackWidth: 0,
      thumbWidth: 0,
    });
  }, [disabled, src, stopProgressAnimation]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const image = imageRef.current;
    if (!viewport || !track) return;

    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(() => measure());
    observer.observe(viewport);
    observer.observe(track);
    if (image) observer.observe(image);

    return () => observer.disconnect();
  }, [measure, src]);

  useEffect(
    () => () => {
      stopProgressAnimation();
    },
    [stopProgressAnimation]
  );

  const interactive = !disabled && !!src && metrics.maxOffset > 0.5;
  const thumbWidth = metrics.trackWidth > 0 ? Math.min(metrics.trackWidth, metrics.thumbWidth) : 0;
  const thumbTravel = Math.max(0, metrics.trackWidth - thumbWidth);
  const thumbOffset = thumbTravel * progress;
  const imageOffset = metrics.maxOffset * progress;

  const updateProgressFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || !interactive) return;

      const rect = track.getBoundingClientRect();
      if (rect.width <= 0) return;

      const width = thumbWidth > 0 ? thumbWidth : rect.width;
      const travel = Math.max(1, rect.width - width);
      const centeredOffset = clientX - rect.left - width / 2;

      setTargetProgress(centeredOffset / travel);
    },
    [interactive, setTargetProgress, thumbWidth]
  );

  const endPointerInteraction = useCallback((pointerId?: number) => {
    const track = trackRef.current;
    if (track && typeof pointerId === 'number' && track.hasPointerCapture(pointerId)) {
      track.releasePointerCapture(pointerId);
    }
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  return (
    <ScrollerShell $aspectRatio={aspectRatio}>
      <ScrollerViewport ref={viewportRef}>
        {!disabled && src ? (
          <ScrollerImage
            ref={imageRef}
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            draggable={false}
            $animate={!isDragging}
            onLoad={() => {
              notifySettled();
              measure();
              window.requestAnimationFrame(measure);
            }}
            onError={() => {
              notifySettled();
              measure();
            }}
            style={{ transform: `translate3d(0, -${imageOffset}px, 0)` }}
          />
        ) : (
          <ScrollerPlaceholder aria-hidden="true" />
        )}
        <ControlsFade aria-hidden="true" />
      </ScrollerViewport>

      <Controls>
        <Track
          ref={trackRef}
          role="slider"
          aria-label="Vertical image scroll position"
          aria-disabled={!interactive}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          tabIndex={interactive ? 0 : -1}
          $interactive={interactive}
          $active={isHovering || isDragging}
          onPointerEnter={(event) => {
            setIsHovering(true);
            if (event.pointerType === 'mouse') {
              updateProgressFromClientX(event.clientX);
            }
          }}
          onPointerMove={(event) => {
            if (event.pointerType === 'mouse' || isDragging) {
              updateProgressFromClientX(event.clientX);
            }
          }}
          onPointerLeave={() => {
            if (isDragging) return;
            setIsHovering(false);
          }}
          onPointerDown={(event) => {
            if (!interactive) return;
            event.preventDefault();
            trackRef.current?.setPointerCapture(event.pointerId);
            setIsHovering(true);
            isDraggingRef.current = true;
            setIsDragging(true);
            updateProgressFromClientX(event.clientX);
          }}
          onPointerUp={(event) => {
            endPointerInteraction(event.pointerId);
          }}
          onPointerCancel={(event) => {
            setIsHovering(false);
            endPointerInteraction(event.pointerId);
          }}
          onLostPointerCapture={() => {
            isDraggingRef.current = false;
            setIsDragging(false);
          }}
          onBlur={() => {
            if (isDragging) return;
            setIsHovering(false);
          }}
          onKeyDown={(event) => {
            if (!interactive) return;

            let nextProgress = targetProgressRef.current;
            switch (event.key) {
              case 'ArrowLeft':
              case 'ArrowDown':
                nextProgress = progress - 0.05;
                break;
              case 'ArrowRight':
              case 'ArrowUp':
                nextProgress = progress + 0.05;
                break;
              case 'PageDown':
                nextProgress = progress - 0.12;
                break;
              case 'PageUp':
                nextProgress = progress + 0.12;
                break;
              case 'Home':
                nextProgress = 0;
                break;
              case 'End':
                nextProgress = 1;
                break;
              default:
                return;
            }

            event.preventDefault();
            setIsHovering(true);
            setTargetProgress(nextProgress);
          }}
        >
          <TrackRail aria-hidden="true" />
          <TrackProgress aria-hidden="true" $scale={progress} $active={isHovering || isDragging} />
          <TrackThumb
            aria-hidden="true"
            $interactive={interactive}
            $active={isHovering || isDragging}
            $width={thumbWidth > 0 ? thumbWidth : Math.max(0, metrics.trackWidth)}
            style={{ transform: `translate3d(${thumbOffset}px, -50%, 0)` }}
          />
        </Track>
      </Controls>
    </ScrollerShell>
  );
};

export default ImageScroller;
