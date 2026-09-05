import { Variants } from 'motion/react';

// Container variant with staggered pop-in / pop-out for child elements
export const framerSectionVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

// Item / Card variant that pops in one by one
export const framerPopItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    scale: 0.93,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const framerFadeUp: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

// Viewport settings for bidirectional scroll animation (scroll down = pop-in, scroll up/away = pop-out)
export const scrollViewportConfig = {
  once: false,
  amount: 0.15,
  margin: '-20px',
};
