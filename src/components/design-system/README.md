# Dollyland Design System

A production-ready design system with glassmorphic effects, gradient meshes, 3D transforms, and AI-focused aesthetics.

## Overview

The Dollyland Design System is a comprehensive collection of reusable React components, design tokens, and custom hooks that power the modern, futuristic aesthetic seen across Dollyland products. Built with React, TypeScript, and Tailwind CSS, it emphasizes depth, fluidity, and intelligent interactions.

### Design Philosophy

- **Glassmorphism**: Semi-transparent surfaces with backdrop blur
- **Gradient Meshes**: Floating gradient orbs for ambient depth
- **3D Transforms**: Subtle scale and translate effects on hover
- **Micro-interactions**: Every element responds to user input
- **AI-Focused Aesthetics**: Modern, clean, and intelligent feel

### Key Features

✨ 10+ production-ready components  
🎨 6 pre-defined gradient palettes  
🪝 3 custom React hooks  
📱 Fully responsive design  
🌓 Dark/light mode support  
♿ Accessibility-first approach  
⚡ Optimized performance  
📦 Zero external dependencies (beyond React ecosystem)  

## Installation

### 1. Copy Files

```bash
# Copy the design system folder
cp -r src/components/design-system your-project/src/components/

# Copy design tokens
cp src/lib/design-tokens.ts your-project/src/lib/

# Copy custom hooks
cp -r src/hooks your-project/src/

# Copy design system CSS
cp src/styles/design-system.css your-project/src/styles/
```

### 2. Import CSS

Add to your `src/index.css`:

```css
@import './styles/design-system.css';
```

### 3. Dependencies

Ensure you have these packages installed:

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwindcss": "^3.0.0",
    "lucide-react": "^0.462.0",
    "class-variance-authority": "^0.7.1",
    "@radix-ui/react-slot": "^1.2.3"
  }
}
```

### 4. Tailwind Configuration

Make sure your `tailwind.config.ts` includes the design system paths:

```typescript
content: [
  "./src/components/design-system/**/*.{ts,tsx}",
  // ... other paths
],
```

## Quick Start

```tsx
import { DSButton, DSCard, DSBadge } from '@/components/design-system';
import { PRODUCT_GRADIENTS, ICON_COLORS } from '@/lib/design-tokens';
import { Sparkles } from 'lucide-react';

function MyComponent() {
  return (
    <DSCard 
      gradient={PRODUCT_GRADIENTS.purple}
      iconColor={ICON_COLORS.purple}
      icon={Sparkles}
    >
      <DSBadge variant="gradient" gradient={PRODUCT_GRADIENTS.purple}>
        Featured
      </DSBadge>
      <h2>Amazing Product</h2>
      <p>Build beautiful interfaces effortlessly</p>
      <DSButton variant="gradient" gradient={PRODUCT_GRADIENTS.purple}>
        Get Started
      </DSButton>
    </DSCard>
  );
}
```

## Component API Reference

### DSButton

Multi-variant button component with gradient support.

**Props:**
- `variant`: 'default' | 'gradient' | 'secondary' | 'ghost' | 'outline'
- `size`: 'sm' | 'default' | 'lg' | 'icon'
- `gradient`: string (Tailwind gradient classes)
- All standard button HTML attributes

**Examples:**

```tsx
<DSButton variant="default">Default Button</DSButton>
<DSButton variant="gradient" gradient={PRODUCT_GRADIENTS.cyan}>Gradient</DSButton>
<DSButton size="lg">Large Button</DSButton>
```

### DSBadge

Label and tag component with multiple variants.

**Props:**
- `variant`: 'default' | 'outline' | 'gradient' | 'secondary' | 'glassmorphic'
- `icon`: LucideIcon component
- `gradient`: string (for gradient variant)
- `animate`: boolean (pulse animation)

**Examples:**

```tsx
<DSBadge variant="outline" icon={Sparkles}>Featured</DSBadge>
<DSBadge variant="gradient" gradient={PRODUCT_GRADIENTS.purple}>Hot</DSBadge>
<DSBadge animate>Live</DSBadge>
```

### DSCard

Glassmorphic card with hover effects and gradient support.

**Props:**
- `gradient`: string (Tailwind gradient classes)
- `iconColor`: string (Tailwind color class)
- `icon`: LucideIcon component
- `size`: 'small' | 'medium' | 'large'
- `showGlow`: boolean (enable hover glow)

**Features:**
- Automatic 3D transform on hover
- Gradient mesh background
- Blur glow effect
- Icon container with pulse ring
- Border glow on hover

**Example:**

```tsx
<DSCard
  gradient={PRODUCT_GRADIENTS.purple}
  iconColor={ICON_COLORS.purple}
  icon={Brain}
  size="medium"
>
  <h3>Your Content</h3>
  <p>Description</p>
</DSCard>
```

### DSMetricCard

Specialized card for displaying metrics/statistics.

**Props:**
- `icon`: LucideIcon component (required)
- `value`: string | number (required)
- `label`: string (required)
- `gradient`: string (for value text)

**Example:**

```tsx
<DSMetricCard 
  icon={Layers} 
  value="100+" 
  label="Components" 
  gradient="from-primary to-purple-500"
/>
```

### DSGradientMesh

Background gradient mesh effect with floating orbs.

**Props:**
- `opacity`: number (0-1, default 0.3)
- `colors`: string[] (bg color classes)
- `animate`: boolean (enable float animation)

**Example:**

```tsx
<DSGradientMesh 
  opacity={0.3} 
  colors={['bg-primary/30', 'bg-purple-500/30']}
/>
```

### DSFloatingParticles

Ambient floating particles for depth.

**Props:**
- `count`: number (default 20)
- `color`: string (default 'bg-primary/20')
- `minDuration`: number (default 10)
- `maxDuration`: number (default 20)

**Example:**

```tsx
<DSFloatingParticles count={30} color="bg-cyan-500/20" />
```

### DSMagneticCursor

Cursor-following glow effect.

**Props:**
- `size`: number (default 800)
- `color`: string (default 'hsl(var(--primary))')
- `opacity`: number (default 0.15)

**Example:**

```tsx
<DSMagneticCursor size={1000} opacity={0.2} />
```

### DSHeader

Sticky glassmorphic header component.

**Props:**
- `logo`: string (image src)
- `brandName`: string
- `showThemeToggle`: boolean

**Example:**

```tsx
<DSHeader 
  logo="/logo.png" 
  brandName="My App" 
  showThemeToggle={true} 
/>
```

### DSHeroSection

Hero section with animated title and scroll indicator.

**Props:**
- `badge`: ReactNode
- `title`: ReactNode (required)
- `subtitle`: string
- `scrollY`: number (for parallax)
- `showScrollIndicator`: boolean

**Example:**

```tsx
<DSHeroSection
  badge={<DSBadge variant="outline">New</DSBadge>}
  title="Welcome to the Future"
  subtitle="Build amazing products"
/>
```

## Design Tokens

Import centralized design constants:

```tsx
import { 
  PRODUCT_GRADIENTS,
  ICON_COLORS,
  ANIMATION_DURATIONS,
  SECTION_SPACING,
  TYPOGRAPHY,
  ICON_SIZES,
  GLASSMORPHISM
} from '@/lib/design-tokens';
```

### Available Gradients

```typescript
PRODUCT_GRADIENTS.purple   // from-purple-500 via-indigo-500 to-violet-600
PRODUCT_GRADIENTS.orange   // from-orange-500 via-amber-500 to-yellow-600
PRODUCT_GRADIENTS.cyan     // from-cyan-500 via-blue-500 to-indigo-600
PRODUCT_GRADIENTS.pink     // from-pink-500 via-rose-500 to-red-600
PRODUCT_GRADIENTS.emerald  // from-emerald-500 via-teal-500 to-cyan-600
PRODUCT_GRADIENTS.indigo   // from-indigo-500 via-purple-500 to-pink-500
```

## Custom Hooks

### useMousePosition

Track mouse cursor position.

```tsx
import { useMousePosition } from '@/hooks/useMousePosition';

const { x, y } = useMousePosition();
```

### useScrollParallax

Get scroll position for parallax effects.

```tsx
import { useScrollParallax } from '@/hooks/useScrollParallax';

const scrollY = useScrollParallax();
```

### useHoverGlow

Manage hover state for glow effects.

```tsx
import { useHoverGlow } from '@/hooks/useHoverGlow';

const { isHovered, hoverProps } = useHoverGlow();

<div {...hoverProps}>
  {isHovered && <div>Glowing!</div>}
</div>
```

## Best Practices

### Performance

✅ **DO:**
- Use `transform` and `opacity` for animations (GPU-accelerated)
- Implement `requestAnimationFrame` for scroll/mouse tracking
- Lazy load heavy components
- Reduce particle count on mobile devices

❌ **DON'T:**
- Animate `width`, `height`, `top`, `left` (causes reflow)
- Use too many blur effects simultaneously
- Forget to cleanup event listeners

### Animation Guidelines

- Fast interactions: 200ms (`ANIMATION_DURATIONS.fast`)
- Normal state changes: 300ms (`ANIMATION_DURATIONS.normal`)
- Complex transforms: 500ms (`ANIMATION_DURATIONS.smooth`)
- Ambient animations: 700ms+ (`ANIMATION_DURATIONS.slow`)

### Responsive Design

All components are mobile-first. Use Tailwind breakpoints:

```tsx
<div className="text-4xl md:text-6xl lg:text-8xl">
  Responsive Text
</div>
```

### Accessibility

- All interactive elements have proper focus states
- Icons include `aria-label` when used alone
- Color contrast meets WCAG AA standards
- Keyboard navigation fully supported

## Common Patterns

### Product Card Layout

```tsx
<DSCard
  gradient={PRODUCT_GRADIENTS.purple}
  iconColor={ICON_COLORS.purple}
  icon={Brain}
  size="large"
>
  <DSBadge variant="gradient" gradient={PRODUCT_GRADIENTS.purple}>
    Featured
  </DSBadge>
  <h3 className="text-4xl font-bold mb-2">Product Name</h3>
  <p className="text-sm text-primary/70 font-medium mb-4">Tagline</p>
  <p className="text-sm text-muted-foreground mb-6">Description</p>
  
  <div className="flex gap-2 mb-6">
    <DSBadge variant="secondary">React</DSBadge>
    <DSBadge variant="secondary">TypeScript</DSBadge>
  </div>
  
  <DSButton variant="gradient" gradient={PRODUCT_GRADIENTS.purple}>
    Launch <ArrowRight className="w-4 h-4 ml-2" />
  </DSButton>
</DSCard>
```

### Full Page Layout

```tsx
function MyPage() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Effects */}
      <DSGradientMesh />
      <DSFloatingParticles />
      <DSMagneticCursor />
      
      {/* Header */}
      <DSHeader brandName="My App" />
      
      {/* Hero */}
      <DSHeroSection
        badge={<DSBadge variant="outline">New</DSBadge>}
        title="Build the Future"
        subtitle="Create amazing experiences"
      />
      
      {/* Content */}
      <section className="container mx-auto px-6 py-32">
        {/* Your content */}
      </section>
    </div>
  );
}
```

## Customization

### Extending Components

All components accept `className` for custom styling:

```tsx
<DSButton 
  className="custom-class hover:custom-hover" 
  variant="gradient"
>
  Custom Button
</DSButton>
```

### Theme Customization

Modify colors in `src/index.css`:

```css
:root {
  --primary: 210 100% 50%; /* Your brand color */
  --primary-glow: 210 100% 60%; /* Lighter variant */
}
```

## License

Open source. Free to use in any project.

## Support

For questions, issues, or contributions:
- View live examples at `/design-system`
- Check the source code in `src/components/design-system`
- Review design tokens in `src/lib/design-tokens.ts`

---

Built with ❤️ by Dollyland
