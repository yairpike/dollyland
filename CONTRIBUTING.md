# Contributing to Dollyland Design System

Thank you for your interest in contributing to the Dollyland Design System! 🎨

## How to Contribute

### For Lovable Users

1. **Remix the Project**
   - Open the project in Lovable
   - Click "Settings" → "Remix this project"
   - Make your improvements

2. **Share Your Improvements**
   - Document your changes clearly
   - Share your remix link in the community
   - Consider creating a pull request if GitHub is connected

### For Developers

1. **Fork & Clone**
   ```bash
   git clone your-fork-url
   cd dollyland-design-system
   npm install
   npm run dev
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-improvement
   ```

3. **Make Changes**
   - Follow existing code style
   - Add TypeScript types
   - Maintain accessibility standards
   - Test in both light and dark modes

4. **Test Thoroughly**
   - Test all component variants
   - Verify responsive behavior
   - Check dark mode compatibility
   - Ensure no console errors

5. **Submit Pull Request**
   - Describe your changes clearly
   - Include screenshots if UI changes
   - Reference any related issues

## Component Guidelines

### Design Principles

1. **Glassmorphism First**
   - Use backdrop-blur and translucent backgrounds
   - Layer elements with proper depth

2. **Gradient Everything**
   - Active states should use gradients
   - Hover effects should enhance with gradients

3. **Smooth Animations**
   - Transitions should be 300-500ms
   - Use ease-in-out curves

4. **Accessibility**
   - WCAG AA compliant color contrast
   - Proper ARIA labels
   - Keyboard navigation support

### Code Style

```tsx
// ✅ Good - Semantic tokens, proper types
export interface DSComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient";
}

const DSComponent = React.forwardRef<HTMLDivElement, DSComponentProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-card/40 backdrop-blur-sm border border-border/50",
        "transition-all duration-300",
        className
      )}
      {...props}
    />
  )
);

// ❌ Bad - Direct colors, no types
const DSComponent = ({ className, ...props }) => (
  <div
    className={`bg-white/40 ${className}`}
    {...props}
  />
);
```

### Adding New Components

1. **Create Component File**
   ```
   src/components/design-system/DSYourComponent.tsx
   ```

2. **Follow Structure**
   - Import dependencies
   - Define interface with proper types
   - Use React.forwardRef
   - Apply design system tokens
   - Export component and types

3. **Update Index**
   Add exports to `src/components/design-system/index.ts`

4. **Add Documentation**
   Include usage example in `/design-system` page

5. **Update CHANGELOG**
   Document your addition

## Reporting Issues

### Bug Reports

Include:
- Component name
- Expected behavior
- Actual behavior
- Steps to reproduce
- Screenshots
- Browser/device info

### Feature Requests

Describe:
- Use case
- Proposed solution
- Alternative solutions considered
- Impact on existing components

## Design Token Changes

When modifying design tokens:

1. **Update Both Themes**
   - Light mode (`:root`)
   - Dark mode (`.dark`)

2. **Maintain Consistency**
   - Keep HSL color format
   - Use semantic naming
   - Document purpose

3. **Test Thoroughly**
   - All components with new tokens
   - Both themes
   - Various screen sizes

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **Major (x.0.0)**: Breaking API changes
- **Minor (1.x.0)**: New features, backward compatible
- **Patch (1.0.x)**: Bug fixes, backward compatible

### Changelog

Update `CHANGELOG.md`:

```markdown
## [1.1.0] - YYYY-MM-DD

### Added
- New DSComponent with gradient variants

### Changed
- Improved hover states on DSButton

### Fixed
- Dark mode contrast issue in DSCard
```

## Community

- **Discord**: [Lovable Community](https://discord.com/channels/1119885301872070706/1280461670979993613)
- **Discussions**: Share ideas and ask questions
- **Showcase**: Show what you built!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making Dollyland better! 💜
