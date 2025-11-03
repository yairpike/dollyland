import { useState } from "react";
import {
  DSButton,
  DSBadge,
  DSCard,
  DSMetricCard,
  DSGradientMesh,
  DSFloatingParticles,
  DSMagneticCursor,
  DSHeader,
  DSTabs,
  DSTabsList,
  DSTabsTrigger,
  DSTabsContent,
  DSAlert,
  DSAlertTitle,
  DSAlertDescription,
  DSInput,
  DSSelect,
  DSSelectTrigger,
  DSSelectValue,
  DSSelectContent,
  DSSelectItem,
} from "@/components/design-system";
import { PRODUCT_GRADIENTS, ICON_COLORS } from "@/lib/design-tokens";
import { Code2, Palette, Layers, Sparkles, Zap, Heart, Copy, Check, Info, AlertCircle, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DesignSystem() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const codeExamples = {
    button: `import { DSButton } from '@/components/design-system';
import { PRODUCT_GRADIENTS } from '@/lib/design-tokens';

<DSButton variant="gradient" gradient={PRODUCT_GRADIENTS.purple}>
  Launch App
</DSButton>`,
    
    badge: `import { DSBadge } from '@/components/design-system';
import { Sparkles } from 'lucide-react';

<DSBadge variant="outline" icon={Sparkles}>
  Featured
</DSBadge>`,
    
    card: `import { DSCard } from '@/components/design-system';
import { PRODUCT_GRADIENTS, ICON_COLORS } from '@/lib/design-tokens';
import { Brain } from 'lucide-react';

<DSCard
  gradient={PRODUCT_GRADIENTS.purple}
  iconColor={ICON_COLORS.purple}
  icon={Brain}
  size="medium"
>
  <h3 className="text-2xl font-bold">Your Content</h3>
</DSCard>`,
    
    installation: `# 1. Copy the design system folder
cp -r src/components/design-system your-project/src/components/

# 2. Copy design tokens
cp src/lib/design-tokens.ts your-project/src/lib/

# 3. Copy custom hooks
cp -r src/hooks your-project/src/

# 4. Copy design system CSS
cp src/styles/design-system.css your-project/src/styles/

# 5. Import CSS in your index.css
@import './styles/design-system.css';`,
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Effects */}
      <DSGradientMesh opacity={0.2} />
      <DSFloatingParticles count={15} />
      
      {/* Header */}
      <DSHeader brandName="Dollyland Design System" />

      {/* Hero */}
      <section className="container mx-auto px-6 py-24 text-center">
        <DSBadge variant="outline" icon={Sparkles} className="mb-6">
          Open Source Design System
        </DSBadge>
        <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Build Beautiful
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
          A production-ready design system with glassmorphic effects, gradient meshes, 3D transforms, and AI-focused aesthetics. Everything you see on dollyland.ai, packaged and ready to use.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <DSButton variant="gradient" gradient={PRODUCT_GRADIENTS.indigo} size="lg">
            <Code2 className="w-5 h-5" />
            Get Started
          </DSButton>
          <DSButton variant="outline" size="lg">
            <Palette className="w-5 h-5" />
            View Components
          </DSButton>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-24">
        <Tabs defaultValue="components" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-12">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="installation">Install</TabsTrigger>
          </TabsList>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-16">
            {/* Buttons */}
            <section>
              <h2 className="text-4xl font-bold mb-8">Buttons</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Button Variants</CardTitle>
                    <CardDescription>Multiple styles for different contexts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      <DSButton variant="default">Default</DSButton>
                      <DSButton variant="gradient" gradient={PRODUCT_GRADIENTS.purple}>Gradient</DSButton>
                      <DSButton variant="secondary">Secondary</DSButton>
                      <DSButton variant="outline">Outline</DSButton>
                      <DSButton variant="ghost">Ghost</DSButton>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <DSButton size="sm">Small</DSButton>
                      <DSButton size="default">Default</DSButton>
                      <DSButton size="lg">Large</DSButton>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Code Example</CardTitle>
                      <CardDescription>Copy and paste</CardDescription>
                    </div>
                    <DSButton 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyToClipboard(codeExamples.button, 'button')}
                    >
                      {copiedCode === 'button' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </DSButton>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                      <code>{codeExamples.button}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Badges */}
            <section>
              <h2 className="text-4xl font-bold mb-8">Badges</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Badge Variants</CardTitle>
                    <CardDescription>Labels and tags with style</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      <DSBadge variant="default">Default</DSBadge>
                      <DSBadge variant="outline" icon={Sparkles}>Outline</DSBadge>
                      <DSBadge variant="gradient" gradient={PRODUCT_GRADIENTS.purple}>Gradient</DSBadge>
                      <DSBadge variant="secondary">Secondary</DSBadge>
                      <DSBadge variant="glassmorphic">Glass</DSBadge>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <DSBadge variant="outline" icon={Zap} animate>Animated</DSBadge>
                      <DSBadge variant="gradient" gradient={PRODUCT_GRADIENTS.cyan} icon={Heart}>
                        With Icon
                      </DSBadge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Code Example</CardTitle>
                      <CardDescription>Copy and paste</CardDescription>
                    </div>
                    <DSButton 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyToClipboard(codeExamples.badge, 'badge')}
                    >
                      {copiedCode === 'badge' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </DSButton>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                      <code>{codeExamples.badge}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Cards */}
            <section>
              <h2 className="text-4xl font-bold mb-8">Cards</h2>
              <div className="grid gap-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <DSCard
                    gradient={PRODUCT_GRADIENTS.purple}
                    iconColor={ICON_COLORS.purple}
                    icon={Layers}
                    size="medium"
                  >
                    <h3 className="text-2xl font-bold mb-2">Purple Card</h3>
                    <p className="text-sm text-muted-foreground">Hover for magical effects</p>
                  </DSCard>

                  <DSCard
                    gradient={PRODUCT_GRADIENTS.cyan}
                    iconColor={ICON_COLORS.cyan}
                    icon={Zap}
                    size="medium"
                  >
                    <h3 className="text-2xl font-bold mb-2">Cyan Card</h3>
                    <p className="text-sm text-muted-foreground">3D transform on hover</p>
                  </DSCard>

                  <DSCard
                    gradient={PRODUCT_GRADIENTS.pink}
                    iconColor={ICON_COLORS.pink}
                    icon={Heart}
                    size="medium"
                  >
                    <h3 className="text-2xl font-bold mb-2">Pink Card</h3>
                    <p className="text-sm text-muted-foreground">Glassmorphic design</p>
                  </DSCard>
                </div>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Code Example</CardTitle>
                      <CardDescription>Copy and paste</CardDescription>
                    </div>
                    <DSButton 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyToClipboard(codeExamples.card, 'card')}
                    >
                      {copiedCode === 'card' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </DSButton>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                      <code>{codeExamples.card}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Metric Cards */}
            <section>
              <h2 className="text-4xl font-bold mb-8">Metric Cards</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <DSMetricCard icon={Layers} value="10+" label="Components" />
                <DSMetricCard icon={Code2} value="3" label="Custom Hooks" />
                <DSMetricCard icon={Palette} value="6" label="Gradients" />
                <DSMetricCard icon={Sparkles} value="∞" label="Possibilities" />
              </div>
            </section>
          </TabsContent>

          {/* Effects Tab */}
          <TabsContent value="effects" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Background Effects</CardTitle>
                <CardDescription>Ambient animations and visual enhancements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Gradient Mesh</h3>
                  <p className="text-sm text-muted-foreground mb-4">Floating gradient orbs with mix-blend-multiply</p>
                  <code className="bg-muted p-2 rounded text-xs block">
                    &lt;DSGradientMesh opacity={"{0.3}"} /&gt;
                  </code>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Floating Particles</h3>
                  <p className="text-sm text-muted-foreground mb-4">Subtle animated particles for depth</p>
                  <code className="bg-muted p-2 rounded text-xs block">
                    &lt;DSFloatingParticles count={"{20}"} /&gt;
                  </code>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Magnetic Cursor</h3>
                  <p className="text-sm text-muted-foreground mb-4">Glowing cursor follower effect</p>
                  <code className="bg-muted p-2 rounded text-xs block">
                    &lt;DSMagneticCursor size={"{800}"} opacity={"{0.15}"} /&gt;
                  </code>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Hooks</CardTitle>
                <CardDescription>React hooks for interactive effects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <code className="bg-muted p-2 rounded text-xs block mb-2">
                    const mousePosition = useMousePosition()
                  </code>
                  <p className="text-sm text-muted-foreground">Track mouse position for magnetic effects</p>
                </div>
                
                <div>
                  <code className="bg-muted p-2 rounded text-xs block mb-2">
                    const scrollY = useScrollParallax()
                  </code>
                  <p className="text-sm text-muted-foreground">Get scroll position for parallax animations</p>
                </div>
                
                <div>
                  <code className="bg-muted p-2 rounded text-xs block mb-2">
                    const {"{ isHovered, hoverProps }"} = useHoverGlow()
                  </code>
                  <p className="text-sm text-muted-foreground">Manage hover states for glow effects</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tokens Tab */}
          <TabsContent value="tokens" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Design Tokens</CardTitle>
                <CardDescription>Centralized constants from design-tokens.ts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Product Gradients</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(PRODUCT_GRADIENTS).map(([name, gradient]) => (
                      <div key={name} className="space-y-2">
                        <div className={`h-16 rounded-lg bg-gradient-to-r ${gradient}`} />
                        <p className="text-sm font-medium capitalize">{name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Icon Colors</h3>
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(ICON_COLORS).map(([name, color]) => (
                      <div key={name} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${color} bg-current`} />
                        <span className="text-sm capitalize">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Import Example</h3>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                    <code>{`import { PRODUCT_GRADIENTS, ICON_COLORS } from '@/lib/design-tokens';

// Use in components
<div className={\`bg-gradient-to-r \${PRODUCT_GRADIENTS.purple}\`}>
  <Icon className={ICON_COLORS.purple} />
</div>`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Installation Tab */}
          <TabsContent value="installation" className="space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Installation Guide</CardTitle>
                  <CardDescription>Get started in minutes</CardDescription>
                </div>
                <DSButton 
                  variant="ghost" 
                  size="icon"
                  onClick={() => copyToClipboard(codeExamples.installation, 'install')}
                >
                  {copiedCode === 'install' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </DSButton>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">1. Copy Files</h3>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                    <code>{codeExamples.installation}</code>
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">2. Dependencies</h3>
                  <p className="text-sm text-muted-foreground mb-2">Make sure you have these installed:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                    <li>React 18+</li>
                    <li>Tailwind CSS 3+</li>
                    <li>lucide-react</li>
                    <li>class-variance-authority</li>
                    <li>@radix-ui/react-slot</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">3. Start Using</h3>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                    <code>{`import { DSButton, DSCard, DSBadge } from '@/components/design-system';
import { PRODUCT_GRADIENTS } from '@/lib/design-tokens';

function App() {
  return (
    <DSCard gradient={PRODUCT_GRADIENTS.purple}>
      <DSBadge variant="gradient">Featured</DSBadge>
      <h1>Beautiful Design</h1>
      <DSButton variant="gradient">Get Started</DSButton>
    </DSCard>
  );
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
