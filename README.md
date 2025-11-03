# 🎨 Dollyland Design System

A production-ready, glassmorphic design system built for SaaS applications. Features 29 customizable components with beautiful gradients, smooth animations, and responsive layouts.

## ✨ Features

- **29+ Production-Ready Components** - From buttons to complex data tables
- **Glassmorphic Design** - Modern backdrop blur effects and translucent layers
- **Gradient Everything** - Beautiful color transitions and hover effects
- **Fully Responsive** - Mobile-first design that works everywhere
- **Dark Mode Ready** - Seamless theme switching
- **TypeScript First** - Full type safety and IntelliSense support
- **Accessible** - WCAG AA compliant components
- **Customizable** - Easy to theme with CSS variables

## 🚀 Quick Start

### Using This Template in Lovable

1. **Remix This Project**
   - Open this project in Lovable
   - Click "Settings" → "Remix this project"
   - Start building with all components ready to use

2. **Start Building**
   ```tsx
   import { DSButton, DSCard, DSTabs } from '@/components/design-system';
   
   function App() {
     return (
       <DSCard>
         <DSButton variant="gradient">Click Me</DSButton>
       </DSCard>
     );
   }
   ```

### Manual Installation (Other Projects)

1. **Copy Design System Files**
   ```
   src/components/design-system/
   src/lib/design-tokens.ts
   src/styles/design-system.css
   src/hooks/useHoverGlow.ts
   src/hooks/useMousePosition.ts
   src/hooks/useScrollParallax.ts
   ```

2. **Install Dependencies**
   ```bash
   npm install lucide-react class-variance-authority @radix-ui/react-slot
   ```

3. **Import Styles**
   Add to your `src/index.css`:
   ```css
   @import './styles/design-system.css';
   ```

4. **Update Tailwind Config**
   Add to `tailwind.config.ts` content array:
   ```js
   './src/components/design-system/**/*.{ts,tsx}'
   ```

## 📦 Component Categories

### Base Components (4)
- **DSButton** - Gradient buttons with multiple variants
- **DSBadge** - Status badges with animations
- **DSCard** - Glassmorphic cards with hover effects
- **DSMetricCard** - Animated metric displays

### Navigation & Layout (7)
- **DSTabs** - Glassmorphic tabs with gradient active state
- **DSSidebar** - Collapsible sidebar with magnetic hover
- **DSNavigation** - Sticky navigation with blur effect
- **DSBreadcrumb** - Breadcrumbs with gradient separators

### Data Display (3)
- **DSTable** - Enhanced tables with hover glow
- **DSDataCard** - Stats cards with animated values

### Feedback & Overlays (5)
- **DSAlert** - Notifications with icon gradients
- **DSDialog** - Modal dialogs with backdrop blur
- **DSSheet** - Slide-in panels
- **DSTooltip** - Glassmorphic tooltips

### Forms & Inputs (7)
- **DSInput** - Floating label inputs with gradient focus
- **DSTextarea** - Auto-resize textarea
- **DSSelect** - Glassmorphic dropdown
- **DSCheckbox** - Gradient checked state
- **DSRadioGroup** - Gradient selection rings
- **DSSwitch** - Smooth toggle animation

### Actions (2)
- **DSDropdown** - Context menus
- **DSCommand** - Command palette search

### Visual Effects (3)
- **DSGradientMesh** - Animated gradient backgrounds
- **DSFloatingParticles** - Particle effects
- **DSMagneticCursor** - Cursor interactions

## 🎨 Design Tokens

All colors and styles are customizable via CSS variables in `src/index.css`:

```css
:root {
  --primary: 258 15% 22%;
  --primary-glow: 258 30% 35%;
  --gradient-primary: linear-gradient(135deg, hsl(258 15% 22%), hsl(257 63% 92%));
  --shadow-glow: 0 8px 32px 0 hsl(258 15% 22% / 0.2);
  /* ... more tokens */
}
```

## 📖 Documentation

Visit `/design-system` route in your app to see:
- Interactive component showcase
- Usage examples with code
- Customization options
- Best practices

## 🔧 Customization

### Changing Theme Colors

Edit `src/index.css`:

```css
:root {
  --primary: YOUR_HUE YOUR_SAT YOUR_LIGHT;
  --primary-glow: YOUR_HUE YOUR_SAT YOUR_LIGHT;
}
```

### Adding Custom Gradients

Edit `src/lib/design-tokens.ts`:

```ts
export const PRODUCT_GRADIENTS = {
  custom: 'from-blue-500 via-purple-500 to-pink-600',
};
```

### Creating Custom Variants

Extend component variants:

```tsx
// In DSButton.tsx
const dsButtonVariants = cva(
  "...",
  {
    variants: {
      variant: {
        // Add your custom variant
        premium: "bg-gradient-to-r from-gold-500 to-gold-700",
      }
    }
  }
);
```

## 📱 Example Pages

- **Landing Page** (`/`) - Hero section with product showcase
- **Design System** (`/design-system`) - Complete component documentation
- **Examples** (`/examples`) - Real-world usage examples

## 🤝 Contributing

This design system is open for contributions:

1. Fork the project in Lovable
2. Make your changes
3. Share your remix with improvements

## 📄 License

MIT License - Use freely in your projects

## 🆘 Support

- **Documentation**: Visit `/design-system` in your app
- **Lovable Community**: [Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)
- **Issues**: Report bugs via GitHub Issues (if connected)

## 🎯 Roadmap

- [x] Phase 1: Core 29 components
- [ ] Phase 2: Advanced animations
- [ ] Phase 3: More chart components
- [ ] Phase 4: Form validation helpers
- [ ] Phase 5: Layout templates

## 🌟 Showcase

Built with Dollyland Design System:
- Add your project here!

---

**Built with ❤️ using [Lovable](https://lovable.dev)**

## Version History

### v1.0.0 (Current)
- Initial release with 29 production-ready components
- Full TypeScript support
- Dark mode support
- Responsive design
- Glassmorphic styling
- Gradient animations
