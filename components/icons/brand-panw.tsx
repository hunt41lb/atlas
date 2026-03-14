// @/components/icons/brand-panw.tsx

import type { SVGProps } from "react";

interface BrandPanwProps extends SVGProps<SVGSVGElement> {
  /**
   * Icon color — accepts any CSS color value.
   * Defaults to "currentColor" so it inherits the parent's text color.
   */
  color?: string;
  /** Icon size in pixels (applied to both width and height). */
  size?: number | string;
}

export function BrandPanw({
  color = "currentColor",
  size = 24,
  ...props
}: BrandPanwProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 279.34 239.43"
      width={size}
      height={size}
      fill={color}
      aria-hidden="true"
      {...props}
    >
      <polygon points="209.27 67.56 174.56 32.85 139.85 67.56 157.11 84.83 70.07 171.87 104.78 206.58 139.49 171.87 122.23 154.6 209.27 67.56" />
      <rect
        x="17.42"
        y="69.18"
        width="123.1"
        height="49.09"
        transform="translate(-43.15 83.29) rotate(-45)"
      />
      <rect
        x="138.82"
        y="121.16"
        width="123.1"
        height="49.09"
        transform="translate(-44.34 184.36) rotate(-45)"
      />
    </svg>
  );
}

export default BrandPanw;
