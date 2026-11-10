import React from "react";

/**
 * Marquee, adapted from Magic UI's MIT-licensed Marquee component.
 * Source: https://github.com/magicuidesign/magicui
 */
export function Marquee({ children, className = "", reverse = false, duration = 34, pauseOnHover = true }) {
  return (
    <div className={"magic-marquee " + className} style={{ "--marquee-duration": duration + "s", "--marquee-direction": reverse ? "reverse" : "normal" }}>
      <div className={"magic-marquee-track" + (pauseOnHover ? " pause-on-hover" : "")}>
        <div className="magic-marquee-group">{children}</div>
        <div className="magic-marquee-group" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
