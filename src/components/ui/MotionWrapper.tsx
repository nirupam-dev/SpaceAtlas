"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";

// ─── Generic Client Island for Framer Motion Animations ────────
// Used to wrap server-rendered content with entrance animations
// without requiring the parent page to be a client component.

interface MotionWrapperProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  /** Stagger delay for list items */
  delay?: number;
}

export function MotionFadeIn({
  children,
  className,
  delay = 0,
  ...rest
}: MotionWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function MotionSlideIn({
  children,
  className,
  delay = 0,
  ...rest
}: MotionWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
