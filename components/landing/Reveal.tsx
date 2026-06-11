"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"

const EASE = [0.21, 0.47, 0.32, 0.98] as const

/**
 * Scroll-triggered fade-up. Fires once, respects prefers-reduced-motion.
 * Keep delays small (≤0.3s) — used for gentle stagger only.
 */
export function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px 0px" }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
