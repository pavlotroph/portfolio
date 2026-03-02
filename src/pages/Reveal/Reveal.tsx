import { motion } from 'framer-motion';
import React, { createContext, ReactNode, useContext, useLayoutEffect, useRef, useState } from 'react';

const DisableContext = createContext(false);

export const DisableReveal: React.FC<{ children: ReactNode }> = ({ children }) => (
  <DisableContext.Provider value={true}>
    {children}
  </DisableContext.Provider>
);

const revealVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as any },
  },
};

interface RevealProps {
  children: ReactNode;
  className?: string;
  amount?: number | 'some' | 'all';
  margin?: string;
  eager?: boolean;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  className,
  amount,
  margin,
  eager = false,
}) => {
  const disabled = useContext(DisableContext);
  const revealRef = useRef<HTMLDivElement | null>(null);
  const [isInViewportOnMount, setIsInViewportOnMount] = useState(false);

  useLayoutEffect(() => {
    if (disabled || eager) return;
    if (typeof window === 'undefined') return;

    const node = revealRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const inViewport =
      rect.bottom > 0 &&
      rect.top < window.innerHeight &&
      rect.right > 0 &&
      rect.left < window.innerWidth;

    if (inViewport) {
      setIsInViewportOnMount(true);
    }
  }, [disabled, eager]);

  if (disabled) {
    return <>{children}</>;
  }

  if (eager || isInViewportOnMount) {
    return (
      <motion.div
        ref={revealRef}
        className={className}
        initial="hidden"
        animate="show"
        variants={revealVariants}
      >
        {children}
      </motion.div>
    );
  }

  const viewportAmount = amount ?? 0.3;

  return (
    <motion.div
      ref={revealRef}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: viewportAmount, margin }}
      variants={revealVariants}
    >
      {children}
    </motion.div>
  );
};
