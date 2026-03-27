import { RefObject, useEffect, useRef, useState } from 'react';

const TOUCH_HOVER_SELECTOR = '[data-touch-hover-id]';

const isPointInsideElement = (element: HTMLElement, x: number, y: number) => {
  const rect = element.getBoundingClientRect();

  return (
    x >= rect.left &&
    x <= rect.right &&
    y >= rect.top &&
    y <= rect.bottom
  );
};

const getTouchHoverIdAtPoint = (
  container: HTMLElement,
  x: number,
  y: number
) => {
  const hit = document.elementFromPoint(x, y);

  if (!(hit instanceof Element)) {
    return null;
  }

  const matchedItem = hit.closest<HTMLElement>(TOUCH_HOVER_SELECTOR);

  if (!matchedItem || !container.contains(matchedItem)) {
    return null;
  }

  return matchedItem.dataset.touchHoverId ?? null;
};

export const useTouchHoverItem = <T extends HTMLElement>(
  containerRef: RefObject<T>
) => {
  const [activeTouchHoverId, setActiveTouchHoverId] = useState<string | null>(null);
  const lastTouchPointRef = useRef<{ x: number; y: number } | null>(null);
  const hasActiveTouchRef = useRef(false);

  useEffect(() => {
    const updateActiveTouchHoverId = (x: number, y: number) => {
      const container = containerRef.current;

      if (!container) {
        setActiveTouchHoverId(null);
        return;
      }

      hasActiveTouchRef.current = true;
      lastTouchPointRef.current = { x, y };

      const nextId = getTouchHoverIdAtPoint(container, x, y);
      const isInsideContainer = isPointInsideElement(container, x, y);

      setActiveTouchHoverId((previousId) => {
        if (nextId) {
          return nextId;
        }

        return isInsideContainer ? previousId : null;
      });
    };

    const clearActiveTouchHoverId = () => {
      hasActiveTouchRef.current = false;
      lastTouchPointRef.current = null;
      setActiveTouchHoverId(null);
    };

    const handleTouchStart = (event: TouchEvent) => {
      const activeTouch = event.touches[0] ?? event.changedTouches[0];

      if (!activeTouch) {
        setActiveTouchHoverId(null);
        return;
      }

      updateActiveTouchHoverId(activeTouch.clientX, activeTouch.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const activeTouch = event.touches[0] ?? event.changedTouches[0];

      if (!activeTouch) {
        setActiveTouchHoverId(null);
        return;
      }

      updateActiveTouchHoverId(activeTouch.clientX, activeTouch.clientY);
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const remainingTouch = event.touches[0];

      if (!remainingTouch) {
        clearActiveTouchHoverId();
        return;
      }

      updateActiveTouchHoverId(remainingTouch.clientX, remainingTouch.clientY);
    };

    const handleTouchCancel = () => {
      // Native scrolling can fire touchcancel before the finger lifts.
      // Keep the last hover target alive and let scroll re-hit-test it.
    };

    const handlePointerStartOrMove = (event: PointerEvent) => {
      if (!event.isPrimary || event.pointerType === 'mouse') {
        return;
      }

      updateActiveTouchHoverId(event.clientX, event.clientY);
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!event.isPrimary || event.pointerType === 'mouse') {
        return;
      }

      clearActiveTouchHoverId();
    };

    const handlePointerCancel = () => {
      // Keep the hover active while the browser owns the scroll gesture.
    };

    const handleScroll = () => {
      if (!hasActiveTouchRef.current || !lastTouchPointRef.current) {
        return;
      }

      updateActiveTouchHoverId(
        lastTouchPointRef.current.x,
        lastTouchPointRef.current.y
      );
    };

    const handleWindowBlur = () => {
      clearActiveTouchHoverId();
    };

    window.addEventListener('pointerdown', handlePointerStartOrMove, { passive: true });
    window.addEventListener('pointermove', handlePointerStartOrMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('pointercancel', handlePointerCancel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('pointerdown', handlePointerStartOrMove);
      window.removeEventListener('pointermove', handlePointerStartOrMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchCancel);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [containerRef]);

  return activeTouchHoverId;
};
