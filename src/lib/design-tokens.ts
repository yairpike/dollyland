// Dollyland Design System - Design Tokens
// Centralized constants for consistent theming across applications

export const PRODUCT_GRADIENTS = {
  purple: 'from-purple-500 via-indigo-500 to-violet-600',
  orange: 'from-orange-500 via-amber-500 to-yellow-600',
  cyan: 'from-cyan-500 via-blue-500 to-indigo-600',
  pink: 'from-pink-500 via-rose-500 to-red-600',
  emerald: 'from-emerald-500 via-teal-500 to-cyan-600',
  indigo: 'from-indigo-500 via-purple-500 to-pink-500',
} as const;

export const ICON_COLORS = {
  purple: 'text-purple-300',
  orange: 'text-orange-300',
  cyan: 'text-cyan-300',
  pink: 'text-pink-300',
  emerald: 'text-emerald-300',
  indigo: 'text-indigo-300',
} as const;

export const ANIMATION_DURATIONS = {
  fast: 'duration-200',
  normal: 'duration-300',
  smooth: 'duration-500',
  slow: 'duration-700',
} as const;

export const SECTION_SPACING = {
  container: 'container mx-auto px-6',
  section: 'py-32',
  cardGrid: 'gap-6',
  contentGrid: 'gap-16',
} as const;

export const BORDER_RADIUS = {
  small: 'rounded-lg',
  medium: 'rounded-xl',
  large: 'rounded-2xl',
  xlarge: 'rounded-3xl',
  full: 'rounded-full',
} as const;

export const TYPOGRAPHY = {
  heroDisplay: 'text-7xl md:text-9xl font-bold tracking-tight leading-none',
  featuredTitle: 'text-5xl md:text-7xl font-bold',
  sectionHeading: 'text-4xl md:text-6xl font-bold',
  cardTitleLarge: 'text-4xl font-bold',
  cardTitle: 'text-2xl font-bold',
  bodyLarge: 'text-xl md:text-2xl',
  body: 'text-base',
  small: 'text-sm',
  badge: 'text-xs',
} as const;

export const ICON_SIZES = {
  small: 'w-4 h-4',
  medium: 'w-8 h-8',
  large: 'w-12 h-12',
  xlarge: 'w-16 h-16',
  xxlarge: 'w-32 h-32',
} as const;

export const GLASSMORPHISM = {
  default: 'bg-card/40 backdrop-blur-sm border-border/50',
  strong: 'bg-card/60 backdrop-blur-md border-border/70',
  subtle: 'bg-card/20 backdrop-blur-sm border-border/30',
} as const;
