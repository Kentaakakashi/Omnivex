import React from "react";
import { motion } from "motion/react";

/**
 * Compact shimmer CTA inspired by Magic UI's MIT-licensed Shimmer Button.
 * Source: https://github.com/magicuidesign/magicui
 */
export function ShimmerButton({ children, className = "", onClick, type = "button" }) {
  return <motion.button type={type} onClick={onClick} className={"shimmer-button " + className}
    whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }}>
    <span className="shimmer-button-label">{children}</span><span className="shimmer-button-glint" aria-hidden="true" />
  </motion.button>;
}
