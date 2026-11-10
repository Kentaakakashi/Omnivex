import React from "react";

/**
 * Border Beam is adapted from the visual treatment in Magic UI's MIT-licensed
 * Border Beam component. Source: https://github.com/magicuidesign/magicui
 */
export function BorderBeam({ className = "" }) {
  return <span className={"magic-border-beam " + className} aria-hidden="true"><i /></span>;
}
