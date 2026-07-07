import type { Transition } from "motion/react";

export const spring: Transition = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 };
export const springSoft: Transition = { type: "spring", stiffness: 180, damping: 26 };
export const ease: Transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] };

export const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: spring,
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.25 },
};

export const stagger = (delay = 0.05) => ({
  animate: { transition: { staggerChildren: delay } },
});
