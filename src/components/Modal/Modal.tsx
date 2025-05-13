import React, { useEffect } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  overflow-y: auto;
  overscroll-behavior: contain;
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 100vw;
  max-height: 90vh;
  margin: 0vh auto;
  // padding: 20px;
  background: transparent;
`;

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  preventScroll?: boolean; // Додаємо новий пропс
}

const Modal: React.FC<ModalProps> = ({ onClose, children, preventScroll = true }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    // Блокування скролу
    if (preventScroll) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    }

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Відновлення скролу
      if (preventScroll) {
        const scrollY = parseInt(document.body.style.top || '0');
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, Math.abs(scrollY));
      }
    };
  }, [onClose, preventScroll]);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;