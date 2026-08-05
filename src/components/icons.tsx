/**
 * Inline SVG icons, single stroke weight (1.75) and 24px grid throughout.
 * Decorative by default — `aria-hidden` keeps them out of the accessibility
 * tree, since every icon here sits beside a visible text label.
 */
type IconProps = {
  size?: number;
};

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};

export function RouteIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <circle cx="6" cy="19" r="3" />
      <circle cx="18" cy="5" r="3" />
      <path d="M9 19h5a4 4 0 0 0 0-8H10a4 4 0 0 1 0-8h5" />
    </svg>
  );
}

export function UsersIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function ClockIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function ShieldIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function ActivityIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M3 12h4l3 8 4-16 3 8h4" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
