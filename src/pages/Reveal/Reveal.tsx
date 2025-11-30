import { motion } from 'framer-motion';
import React, { createContext, ReactNode, useContext } from 'react';

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

// 👇 add props interface with optional amount
interface RevealProps {
  children: ReactNode;
  className?: string;
  amount?: number;          // viewport threshold override
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  className,
  amount,
}) => {
  const disabled = useContext(DisableContext);
  if (disabled) {
    return <>{children}</>;
  }

  const viewportAmount = amount ?? 0.3; // default = old behavior

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: viewportAmount }}
      variants={revealVariants}
    >
      {children}
    </motion.div>
  );
};
