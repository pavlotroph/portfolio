import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeInScale = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
  animation: ${fadeInScale} 0.15s ease-out;

  /* RED ZONES — horizontal “leave modal” bands */
  /* base (mobile) */

  /* tablet and up */
  @media (min-width: 744px) {
  }

  /* big desktop */
  @media (min-width: 1440px) {
  }
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  animation: ${fadeInScale} 0.15s ease-out;
  overflow: visible;
`;

export const MediaContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  max-height: 80vh;
  width: 100%;
  overflow: auto;
  box-sizing: border-box;
  background: transparent;
  /* no border - ensure images show without frame */
  img {
    height: auto;
    max-height: 80vh;
    width: auto;
    max-width: 100%;
    object-fit: contain;
    display: block;
    padding: 0;
    margin: 0 auto;
    border: none;
  }

  video {
    height: auto;
    max-height: 80vh;
    width: auto;
    max-width: 90vw;
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
  width: 44px;
  height: 44px;
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
  if (!isOpen) return null;
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
  
    /* ---------- ОТКРЫТИЕ модалки ---------- */
    if (preventScroll) {
      /* ① лог до фиксации */
      /* console.log('🡅 before lock', window.scrollY); */
  
      const y = window.scrollY;
      document.body.dataset.scrollY = String(y);
  
      document.body.style.position = 'fixed';
      document.body.style.top      = `-${y}px`;
      document.body.style.left     = '0';
      document.body.style.right    = '0';
      document.body.style.width    = '100%';
      document.body.style.overflow = 'hidden';
    }
  
    document.addEventListener('keydown', handleKeyDown);
  
    /* ---------- ЗАКРЫТИЕ модалки ---------- */
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
  
      if (preventScroll) {
        /* ② лог сразу после снятия top, ДО scrollTo */
        /* console.log('🡇 unlock, scrollY is', window.scrollY); */
  
        const y = parseInt(document.body.dataset.scrollY || '0', 10);
  
        // снимаем стили
        document.body.style.position = '';
        document.body.style.top      = '';
        document.body.style.left     = '';
        document.body.style.right    = '';
        document.body.style.width    = '';
        document.body.style.overflow = '';
        delete document.body.dataset.scrollY;
  
        // возвращаем позицию (без анимации)
        const html = document.documentElement;
        html.style.scrollBehavior = 'auto';
        window.scrollTo(0, y);
        html.style.scrollBehavior = '';
      }
    };
  }, [onClose, preventScroll]);
  
  

  return (
    <ModalOverlay 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image or video modal"
    >
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;

//STARTED