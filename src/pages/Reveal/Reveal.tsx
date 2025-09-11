import { motion } from 'framer-motion';
import React, { createContext, ReactNode, useContext } from 'react';

//
// Контекст: по-умолчанию анимация включена
//
const DisableContext = createContext(false);

//
// Компонент, который отключает все Reveal в своём subtree
//
export const DisableReveal: React.FC<{ children: ReactNode }> = ({ children }) => (
  <DisableContext.Provider value={true}>
    {children}
  </DisableContext.Provider>
);

//
// Варианты для framer-motion
//
const revealVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as any },
  },
};

//
// Reveal — обёртка над motion.div
//
export const Reveal: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  const disabled = useContext(DisableContext);
  if (disabled) {
    // если отключено — рендерим просто детей
    return <>{children}</>;
  }
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={revealVariants}
    >
      {children}
    </motion.div>
  );
};
