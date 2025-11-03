# 🎨 Dollyland Design System

A production-ready, glassmorphic design system built for SaaS applications. Features 29 customizable components with beautiful gradients, smooth animations, and responsive layouts.

## ✨ Features

- 🎨 **29+ Production Components** - Battle-tested UI components ready for production use
- ✨ **Glassmorphic Design** - Modern frosted glass aesthetic with backdrop blur effects
- 🌈 **Gradient Meshes** - Animated background gradients and visual effects
- 📱 **Fully Responsive** - Mobile-first design that works on all screen sizes
- 🌙 **Dark Mode Ready** - Complete theme switching with persistent preferences
- 🔒 **TypeScript First** - 100% TypeScript with full type safety and IntelliSense
- ♿ **Accessible** - WCAG AA compliant with keyboard navigation and screen reader support
- 🎯 **Highly Customizable** - Easy to theme with CSS variables and Tailwind utilities
- 🚀 **Optimized for Lovable** - Built specifically for the Lovable development platform
- 💎 **Premium Animations** - Smooth transitions, hover effects, and micro-interactions

## 🚀 Quick Start

### Using in Lovable (Recommended)

**Option 1: Remix This Project** (Easiest)
1. Click on the project name in the top left corner
2. Click "Settings"
3. Click "Remix this project"
4. You now have a complete copy with all components ready to use!

**Option 2: Interactive Installation Guide**
- Visit the `/installation` route in this project
- Follow the step-by-step interactive checklist
- Get troubleshooting help and code examples

**Start Building:**
```tsx
import { DSButton, DSCard, DSTabs } from '@/components/design-system';

function App() {
  return (
    <DSCard className="p-8">
      <h1>Welcome to Dollyland</h1>
      <DSButton variant="gradient">Get Started</DSButton>
    </DSCard>
  );
}
```

### Using in Existing Lovable Projects

1. **Copy design system components**
   - Copy the entire `src/components/design-system/` folder to your project
   - This includes all 29+ components and their configurations

2. **Copy design tokens and hooks**
   ```
   src/lib/design-tokens.ts
   src/hooks/useHoverGlow.ts
   src/hooks/useMousePosition.ts
   src/hooks/useScrollParallax.ts
   ```

3. **Import design system CSS**
   Add to your `src/index.css`:
   ```css
   @import './styles/design-system.css';
   ```

4. **Update Tailwind configuration**
   - Copy the custom theme configuration from this project's `tailwind.config.ts`
   - Ensure all custom colors, gradients, and design tokens are included

5. **Dependencies**
   - Lovable automatically installs required dependencies when you copy components
   - All Radix UI components are already configured

6. **Verify installation**
   ```tsx
   import { DSButton, DSCard } from "@/components/design-system";
   
   export default function TestComponent() {
     return (
       <DSCard className="p-8">
         <DSButton variant="gradient">It Works!</DSButton>
       </DSCard>
     );
   }
   ```

**Need Help?** Visit `/installation` in this project for an interactive installation guide.

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

### In-App Documentation

This project includes comprehensive in-app documentation:

- **`/design-system`** - Interactive component showcase with live examples
- **`/installation`** - Step-by-step installation guide with interactive checklist
- **`/examples`** - Real-world usage examples with functional interactions

### Component Documentation

Each component includes:
- TypeScript type definitions and prop documentation
- Multiple variant demonstrations
- Accessibility implementation notes
- Customization examples
- Copy-paste ready code snippets

### Design System Guide

Learn how to:
- Customize colors and create custom themes
- Build new component variants
- Use design tokens effectively
- Maintain design consistency
- Optimize component performance

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

- **Landing Page** (`/`) - Full-featured product showcase with interactive elements
- **Design System** (`/design-system`) - Complete component documentation with live demos
- **Examples** (`/examples`) - Real-world usage examples with functional interactions
- **Installation** (`/installation`) - Interactive installation guide with troubleshooting

## 🤝 Contributing

This design system is open for contributions:

1. Fork the project in Lovable
2. Make your changes
3. Share your remix with improvements

## 📄 License

MIT License - Use freely in your projects

## 🆘 Support

- **Documentation**: Visit `/design-system` and `/installation` routes in this app
- **Lovable Community**: [Join Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)
- **Lovable Docs**: [Official Documentation](https://docs.lovable.dev/)
- **Video Tutorials**: [YouTube Playlist](https://www.youtube.com/watch?v=9KHLTZaJcR8&list=PLbVHz4urQBZkJiAWdG8HWoJTdgEysigIO)
- **Issues**: Report bugs via GitHub integration in your Lovable project

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
