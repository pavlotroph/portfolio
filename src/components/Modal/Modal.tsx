import React, { useLayoutEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

const ModalOverlay = styled.div<{ $closing: boolean }>`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.85);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -webkit-tap-highlight-color: transparent;

  animation: ${({ $closing }) => ($closing ? fadeOut : fadeIn)} 0.2s ease-out;
  pointer-events: ${({ $closing }) => ($closing ? 'none' : 'auto')};
`;

const ModalContent = styled.div<{ $closing: boolean }>`
  position: relative;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  overflow: visible;

  animation: ${({ $closing }) => ($closing ? fadeOut : fadeIn)} 0.15s ease-out;
`;

export const MediaContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  max-height: 80vh;
  min-height: 60vh;
  width: 100%;
  overflow: auto;
  box-sizing: border-box;
  background: transparent;
  /* no border - ensure images show without frame */
  img {
    height: 24px;
    width: auto;
    max-width: 100%;
    object-fit: contain;
    display: block;
    padding: 0;
    margin: 0 auto;
    border: none;
  }
    
  }

  video {
    height: auto;
    max-height: 80vh;
    width: auto;
    max-width: 100%;
    object-fit: contain;
    display: block;
    padding: 0;
    border: none;
  }
`;

export const TextContainer = styled.div`
  color: #fff;
  text-align: center;
  width: 100%;
  max-width: 90vw;
  
  padding: 30px 20px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0);
  margin-top: auto;
`;

export const CloseButton = styled.button`
  position: fixed;
  min-width: 44px;
  min-height: 44px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  top: 36px;
  right: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 100;
  isolation: isolate; /* нужно для ::before */

  &::before {
    content: '';
    position: absolute;
    inset: -50px; /* расширяем зону наведения */
    border-radius: 50%;
    z-index: -1;
  }

  svg path {
    fill: rgb(128, 128, 128);
    transition: fill 0.3s ease;
  }

  &:hover svg path {
    fill: #fff;
  }

  svg {
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
`;

export const ModalArrowZone = styled.button<{ $side: 'left' | 'right' }>`
  position: fixed;
  top: 0;
  bottom: 0;
  left: ${({ $side }) => ($side === 'left' ? 0 : 'auto')};
  right: ${({ $side }) => ($side === 'right' ? 0 : 'auto')};
  width: 10%;          /* wide “blue” band */
  width: clamp(60px, 10vw, 140px);
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: ${({ $side }) =>
    $side === 'left' ? 'flex-start' : 'flex-end'};
  padding: 0 16px;
  z-index: 2;

  img,
  svg {
    pointer-events: none;
    width: clamp(12px, 1.1vw, 24px); 
    height: auto;
  }
`;


export const MODAL_DESCRIPTION = styled.p`
  font-family: 'JetBrains Mono';
  font-size: 14px;
  color: #808080;

  @media (min-width: 1440px) {
    font-size: 16px;
  }
`;

export const MODAL_TITLE = styled.h2`
  font-family: 'Geist';
  font-style: normal;
  font-weight: 600;
  line-height: 161.8%;
  text-align: center;
  font-size: 18px;
  color: #fff;
  padding-bottom: 4px;

  @media (min-width: 744px) {
    font-size: 20px;
  }
  @media (min-width: 1440px) {
    font-size: 24px;
  }
`;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  preventScroll?: boolean;
}


const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, preventScroll = true }) => {
  const [mounted, setMounted] = React.useState(isOpen);
  const [closing, setClosing] = React.useState(false);

  // keep mounted while we play fade-out
  React.useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
    }
  }, [isOpen, mounted]);

  // lock scroll while mounted (includes fade-out time)
  useLayoutEffect(() => {
    if (!mounted) return;

    const requestClose = () => {
      if (closing) return;
      setClosing(true);
      onClose(); // parent will set isOpen=false, but we stay mounted until animation ends
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
      }
    };

    if (preventScroll) {
      const y = window.scrollY;
      document.body.dataset.scrollY = String(y);

      document.body.style.position = 'fixed';
      document.body.style.top = `-${y}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      if (preventScroll) {
        const y = parseInt(document.body.dataset.scrollY || '0', 10);

        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        delete document.body.dataset.scrollY;

        const html = document.documentElement;
        const prev = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';
        window.scrollTo(0, y);
        html.style.scrollBehavior = prev;
      }
    };
  }, [mounted, closing, onClose, preventScroll]);

  if (!mounted) return null;

  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    onClose();
  };

  return (
    <ModalOverlay
      $closing={closing}
      onClick={requestClose}
      onAnimationEnd={() => {
        // only unmount AFTER fade-out is done
        if (closing) setMounted(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image or video modal"
    >
      <ModalContent $closing={closing} onClick={(e) => e.stopPropagation()}>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;

//STARTED