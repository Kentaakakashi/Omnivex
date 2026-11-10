import React, { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

/**
 * Number Ticker, adapted from Magic UI's MIT-licensed component.
 * Source: https://github.com/magicuidesign/magicui
 */
export function NumberTicker({ value, prefix = "", suffix = "", className = "", delay = 0 }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 42, stiffness: 90 });
  const inView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (!inView) return undefined;
    const timer = window.setTimeout(() => motionValue.set(value), delay);
    return () => window.clearTimeout(timer);
  }, [inView, value, delay, motionValue]);

  useEffect(() => springValue.on("change", latest => {
    if (ref.current) ref.current.textContent = prefix + Math.round(latest).toLocaleString("en-US") + suffix;
  }), [springValue, prefix, suffix]);

  return <span ref={ref} className={"number-ticker " + className}>{prefix}0{suffix}</span>;
}
