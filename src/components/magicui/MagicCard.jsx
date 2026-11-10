import React from "react";

/**
 * Pointer-following spotlight card, adapted from Magic UI's MIT-licensed
 * Magic Card interaction. Source: https://github.com/magicuidesign/magicui
 */
export function MagicCard({ children, className = "", as: Tag = "div" }) {
  function move(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", (event.clientX - rect.left) + "px");
    event.currentTarget.style.setProperty("--spot-y", (event.clientY - rect.top) + "px");
  }

  return <Tag className={"magic-card " + className} onPointerMove={move}>
    <span className="magic-card-spotlight" aria-hidden="true" />
    <span className="magic-card-content">{children}</span>
  </Tag>;
}
