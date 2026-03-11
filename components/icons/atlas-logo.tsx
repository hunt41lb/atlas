// @/components/icons/atlas-logo.tsx

import * as React from "react"
import { cn } from "@/lib/utils"

interface AtlasLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

export function AtlasLogo({ size = 128, className, style, ...props }: AtlasLogoProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        ...style,
      }}
      {...props}
    >
      <defs>
        <clipPath id="globe-clip">
          <circle cx="64" cy="64" r="51" />
        </clipPath>

        <filter id="a-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.0" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="eq-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="node-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id="rim" cx="34%" cy="26%" r="52%">
          <stop offset="0%" stopColor="var(--foreground)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Globe body */}
      <circle cx="64" cy="64" r="51" fill="var(--sidebar-primary)" />
      <circle cx="64" cy="64" r="51" fill="url(#rim)" />

      {/* Globe ring */}
      <circle
        cx="64" cy="64" r="51"
        fill="none"
        stroke="var(--sidebar-primary-foreground)"
        strokeWidth="1"
        strokeDasharray="500"
        strokeDashoffset="8"
      />

      {/* Equator ellipse */}
      <g clipPath="url(#globe-clip)" filter="url(#eq-glow)">
        <ellipse
          cx="64" cy="72" rx="51" ry="12"
          fill="none"
          stroke="var(--sidebar-primary-foreground)"
          strokeWidth="0.9"
          opacity="0.7"
        />
      </g>

      {/* The A */}
      <g
        clipPath="url(#globe-clip)"
        fill="none"
        stroke="var(--sidebar-primary-foreground)"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#a-glow)"
      >
        <path d="M 64 13 C 44 34 24 58 30 115" strokeWidth="3.0" />
        <path d="M 64 13 C 84 34 104 58 98 115" strokeWidth="3.0" />
        <path d="M 42 62 Q 64 55 86 62" strokeWidth="3.0" />
      </g>

      {/* Network nodes */}
      <g filter="url(#node-glow)">
        {/* Apex */}
        <circle cx="64" cy="13" r="4.0" fill="var(--sidebar-primary-foreground)" />
        <circle cx="64" cy="13" r="6.5" fill="none" stroke="var(--sidebar-foreground)" strokeWidth="0.8" opacity="0.35" />

        {/* Left crossbar */}
        <circle cx="42" cy="62" r="3.0" fill="var(--sidebar-primary-foreground)" />
        <circle cx="42" cy="62" r="5.2" fill="none" stroke="var(--sidebar-primary-foreground)" strokeWidth="0.7" opacity="0.40" />

        {/* Right crossbar */}
        <circle cx="86" cy="62" r="3.0" fill="var(--sidebar-primary-foreground)" />
        <circle cx="86" cy="62" r="5.2" fill="none" stroke="var(--sidebar-primary-foreground)" strokeWidth="0.7" opacity="0.40" />

        {/* Bottom-left leg */}
        <circle cx="29" cy="100" r="2.6" fill="var(--sidebar-primary-foreground)" opacity="0.85" />

        {/* Bottom-right leg */}
        <circle cx="99" cy="100" r="2.6" fill="var(--sidebar-primary-foreground)" opacity="0.85" />
      </g>
    </svg>
  )
}
