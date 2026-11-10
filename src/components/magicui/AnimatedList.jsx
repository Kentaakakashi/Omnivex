import React from "react";
import { motion } from "motion/react";

/**
 * Staggered list entrance adapted from Magic UI's MIT-licensed Animated List.
 * Source: https://github.com/magicuidesign/magicui
 */
export function AnimatedList({ children, className = "", delay = 0.055 }) {
  return <div className={"magic-animated-list " + className}>
    {React.Children.toArray(children).map((child, index) =>
      <motion.div key={index} className="magic-animated-list-item"
        initial={{ opacity: 0, y: 14, filter: "blur(5px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.48, delay: index * delay, ease: [0.22, 1, 0.36, 1] }}>
        {child}
      </motion.div>
    )}
  </div>;
}
