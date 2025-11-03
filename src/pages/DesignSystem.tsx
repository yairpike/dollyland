import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  DSTextarea,
  DSCheckbox,
  DSSwitch,
  DSRadioGroup,
  DSRadioGroupItem,
  DSDialog,
  DSDialogTrigger,
  DSDialogContent,
  DSDialogHeader,
  DSDialogTitle,
  DSDialogDescription,
  DSSheet,
  DSSheetTrigger,
  DSSheetContent,
  DSSheetHeader,
  DSSheetTitle,
  DSSheetDescription,
  DSDropdownMenu,
  DSDropdownMenuTrigger,
  DSDropdownMenuContent,
  DSDropdownMenuItem,
  DSTooltip,
  DSTooltipTrigger,
  DSTooltipContent,
  DSTooltipProvider,
  DSTable,
  DSTableHeader,
  DSTableBody,
  DSTableRow,
  DSTableHead,
  DSTableCell,
  DSDataCard,
  DSBreadcrumb,
  DSBreadcrumbList,
  DSBreadcrumbItem,
  DSBreadcrumbLink,
  DSBreadcrumbSeparator,
  DSNavigation,
  DSNavItem,
  DSSidebar,
  DSSidebarContent,
} from "@/components/design-system";
import { PRODUCT_GRADIENTS, ICON_COLORS } from "@/lib/design-tokens";
import { Code2, Palette, Layers, Sparkles, Zap, Heart, Copy, Check, Info, AlertCircle, CheckCircle, Home, Settings, User, FileText, Menu, ChevronRight, MoreVertical, Download, Share, Trash, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function DesignSystem() {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          <DSButton 
            variant="gradient" 
            gradient={PRODUCT_GRADIENTS.indigo} 
            size="lg"
            onClick={() => navigate('/installation')}
          >
            <Code2 className="w-5 h-5" />
            Get Started
          </DSButton>
          <DSButton 
            variant="outline" 
            size="lg"
            onClick={() => scrollToSection('all-components')}
          >
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
            {/* All Components Grid */}
            <section id="all-components" className="mb-16">
              <h2 className="text-4xl font-bold mb-4">All Components (29+)</h2>
              <p className="text-muted-foreground mb-8">Click any component to jump to its section</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Button', icon: Code2, section: 'buttons' },
                  { name: 'Badge', icon: Sparkles, section: 'badges' },
                  { name: 'Card', icon: Layers, section: 'cards' },
                  { name: 'Metric Card', icon: Zap, section: 'metric-cards' },
                  { name: 'Alert', icon: AlertCircle, section: 'alerts' },
                  { name: 'Input', icon: FileText, section: 'inputs' },
                  { name: 'Textarea', icon: FileText, section: 'textareas' },
                  { name: 'Select', icon: Menu, section: 'selects' },
                  { name: 'Checkbox', icon: CheckCircle, section: 'checkboxes' },
                  { name: 'Switch', icon: Zap, section: 'switches' },
                  { name: 'Radio', icon: CheckCircle, section: 'radios' },
                  { name: 'Dialog', icon: Layers, section: 'dialogs' },
                  { name: 'Sheet', icon: Menu, section: 'sheets' },
                  { name: 'Dropdown', icon: MoreVertical, section: 'dropdowns' },
                  { name: 'Tooltip', icon: Info, section: 'tooltips' },
                  { name: 'Table', icon: Layers, section: 'tables' },
                  { name: 'Data Card', icon: Layers, section: 'data-cards' },
                  { name: 'Navigation', icon: Menu, section: 'navigation' },
                  { name: 'Breadcrumb', icon: ChevronRight, section: 'breadcrumbs' },
                  { name: 'Sidebar', icon: Menu, section: 'sidebars' },
                  { name: 'Tabs', icon: Layers, section: 'tabs' },
                  { name: 'Gradient Mesh', icon: Palette, section: 'gradient-mesh' },
                  { name: 'Floating Particles', icon: Sparkles, section: 'particles' },
                  { name: 'Magnetic Cursor', icon: Zap, section: 'magnetic-cursor' },
                ].map((comp) => (
                  <Card 
                    key={comp.name}
                    className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
                    onClick={() => scrollToSection(comp.section)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <comp.icon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-sm">{comp.name}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
            {/* Buttons */}
            <section id="buttons">
              <h2 className="text-4xl font-bold mb-8">Buttons</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Button Variants</CardTitle>
                    <CardDescription>Multiple styles for different contexts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      <DSButton variant="default" onClick={() => toast({ title: "Default clicked!" })}>Default</DSButton>
                      <DSButton variant="gradient" gradient={PRODUCT_GRADIENTS.purple} onClick={() => toast({ title: "Gradient clicked!" })}>Gradient</DSButton>
                      <DSButton variant="secondary" onClick={() => toast({ title: "Secondary clicked!" })}>Secondary</DSButton>
                      <DSButton variant="outline" onClick={() => toast({ title: "Outline clicked!" })}>Outline</DSButton>
                      <DSButton variant="ghost" onClick={() => toast({ title: "Ghost clicked!" })}>Ghost</DSButton>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <DSButton size="sm" onClick={() => toast({ title: "Small clicked!" })}>Small</DSButton>
                      <DSButton size="default" onClick={() => toast({ title: "Default clicked!" })}>Default</DSButton>
                      <DSButton size="lg" onClick={() => toast({ title: "Large clicked!" })}>Large</DSButton>
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
            <section id="badges">
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
            <section id="cards">
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
            <section id="metric-cards">
              <h2 className="text-4xl font-bold mb-8">Metric Cards</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <DSMetricCard icon={Layers} value="29+" label="Components" />
                <DSMetricCard icon={Code2} value="3" label="Custom Hooks" />
                <DSMetricCard icon={Palette} value="6" label="Gradients" />
                <DSMetricCard icon={Sparkles} value="∞" label="Possibilities" />
              </div>
            </section>

            {/* Alerts */}
            <section id="alerts">
              <h2 className="text-4xl font-bold mb-8">Alerts</h2>
              <div className="space-y-4">
                <DSAlert variant="default">
                  <Info className="h-4 w-4" />
                  <DSAlertTitle>Info Alert</DSAlertTitle>
                  <DSAlertDescription>This is an informational alert message.</DSAlertDescription>
                </DSAlert>
                <DSAlert variant="success">
                  <CheckCircle className="h-4 w-4" />
                  <DSAlertTitle>Success Alert</DSAlertTitle>
                  <DSAlertDescription>Your action was completed successfully!</DSAlertDescription>
                </DSAlert>
                <DSAlert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <DSAlertTitle>Warning Alert</DSAlertTitle>
                  <DSAlertDescription>Please review this important information.</DSAlertDescription>
                </DSAlert>
                <DSAlert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <DSAlertTitle>Error Alert</DSAlertTitle>
                  <DSAlertDescription>Something went wrong. Please try again.</DSAlertDescription>
                </DSAlert>
              </div>
            </section>

            {/* Inputs */}
            <section id="inputs">
              <h2 className="text-4xl font-bold mb-8">Inputs</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Input Variants</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <DSInput placeholder="Default input" />
                    <DSInput placeholder="Email input" type="email" />
                    <DSInput placeholder="Password input" type="password" />
                    <DSInput placeholder="Disabled input" disabled />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Input with Icons</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <DSInput placeholder="Email" className="pl-10" />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <DSInput placeholder="Phone" className="pl-10" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Textareas */}
            <section id="textareas">
              <h2 className="text-4xl font-bold mb-8">Textareas</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Textarea Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <DSTextarea placeholder="Type your message here..." rows={5} />
                </CardContent>
              </Card>
            </section>

            {/* Selects */}
            <section id="selects">
              <h2 className="text-4xl font-bold mb-8">Selects</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Select Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <DSSelect>
                    <DSSelectTrigger>
                      <DSSelectValue placeholder="Select an option" />
                    </DSSelectTrigger>
                    <DSSelectContent>
                      <DSSelectItem value="option1">Option 1</DSSelectItem>
                      <DSSelectItem value="option2">Option 2</DSSelectItem>
                      <DSSelectItem value="option3">Option 3</DSSelectItem>
                    </DSSelectContent>
                  </DSSelect>
                </CardContent>
              </Card>
            </section>

            {/* Checkboxes */}
            <section id="checkboxes">
              <h2 className="text-4xl font-bold mb-8">Checkboxes</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Checkbox Example</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <DSCheckbox id="check1" />
                    <label htmlFor="check1" className="text-sm cursor-pointer">Accept terms and conditions</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <DSCheckbox id="check2" />
                    <label htmlFor="check2" className="text-sm cursor-pointer">Subscribe to newsletter</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <DSCheckbox id="check3" disabled />
                    <label htmlFor="check3" className="text-sm text-muted-foreground">Disabled checkbox</label>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Switches */}
            <section id="switches">
              <h2 className="text-4xl font-bold mb-8">Switches</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Switch Example</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Enable notifications</label>
                    <DSSwitch />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Dark mode</label>
                    <DSSwitch />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-muted-foreground">Disabled switch</label>
                    <DSSwitch disabled />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Radio Groups */}
            <section id="radios">
              <h2 className="text-4xl font-bold mb-8">Radio Groups</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Radio Group Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <DSRadioGroup defaultValue="option1">
                    <div className="flex items-center gap-2">
                      <DSRadioGroupItem value="option1" id="radio1" />
                      <label htmlFor="radio1" className="text-sm cursor-pointer">Option 1</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <DSRadioGroupItem value="option2" id="radio2" />
                      <label htmlFor="radio2" className="text-sm cursor-pointer">Option 2</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <DSRadioGroupItem value="option3" id="radio3" />
                      <label htmlFor="radio3" className="text-sm cursor-pointer">Option 3</label>
                    </div>
                  </DSRadioGroup>
                </CardContent>
              </Card>
            </section>

            {/* Dialogs */}
            <section id="dialogs">
              <h2 className="text-4xl font-bold mb-8">Dialogs</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Dialog Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <DSDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DSDialogTrigger asChild>
                      <DSButton>Open Dialog</DSButton>
                    </DSDialogTrigger>
                    <DSDialogContent>
                      <DSDialogHeader>
                        <DSDialogTitle>Dialog Title</DSDialogTitle>
                        <DSDialogDescription>
                          This is a dialog description. You can put any content here.
                        </DSDialogDescription>
                      </DSDialogHeader>
                      <div className="py-4">
                        <p className="text-sm text-muted-foreground">Dialog content goes here.</p>
                      </div>
                      <div className="flex justify-end gap-3">
                        <DSButton variant="outline" onClick={() => setDialogOpen(false)}>Cancel</DSButton>
                        <DSButton onClick={() => { setDialogOpen(false); toast({ title: "Confirmed!" }); }}>Confirm</DSButton>
                      </div>
                    </DSDialogContent>
                  </DSDialog>
                </CardContent>
              </Card>
            </section>

            {/* Sheets */}
            <section id="sheets">
              <h2 className="text-4xl font-bold mb-8">Sheets</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Sheet Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <DSSheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <DSSheetTrigger asChild>
                      <DSButton>Open Sheet</DSButton>
                    </DSSheetTrigger>
                    <DSSheetContent>
                      <DSSheetHeader>
                        <DSSheetTitle>Sheet Title</DSSheetTitle>
                        <DSSheetDescription>
                          This is a sheet sliding from the side.
                        </DSSheetDescription>
                      </DSSheetHeader>
                      <div className="py-4 space-y-4">
                        <DSInput placeholder="Name" />
                        <DSInput placeholder="Email" type="email" />
                        <DSTextarea placeholder="Message" />
                      </div>
                      <div className="flex justify-end gap-3">
                        <DSButton variant="outline" onClick={() => setSheetOpen(false)}>Cancel</DSButton>
                        <DSButton onClick={() => { setSheetOpen(false); toast({ title: "Submitted!" }); }}>Submit</DSButton>
                      </div>
                    </DSSheetContent>
                  </DSSheet>
                </CardContent>
              </Card>
            </section>

            {/* Dropdowns */}
            <section id="dropdowns">
              <h2 className="text-4xl font-bold mb-8">Dropdown Menus</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Dropdown Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <DSDropdownMenu>
                    <DSDropdownMenuTrigger asChild>
                      <DSButton variant="outline">
                        <MoreVertical className="h-4 w-4" />
                        Options
                      </DSButton>
                    </DSDropdownMenuTrigger>
                    <DSDropdownMenuContent>
                      <DSDropdownMenuItem onClick={() => toast({ title: "Download clicked" })}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DSDropdownMenuItem>
                      <DSDropdownMenuItem onClick={() => toast({ title: "Share clicked" })}>
                        <Share className="mr-2 h-4 w-4" />
                        Share
                      </DSDropdownMenuItem>
                      <DSDropdownMenuItem onClick={() => toast({ title: "Delete clicked" })}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DSDropdownMenuItem>
                    </DSDropdownMenuContent>
                  </DSDropdownMenu>
                </CardContent>
              </Card>
            </section>

            {/* Tooltips */}
            <section id="tooltips">
              <h2 className="text-4xl font-bold mb-8">Tooltips</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Tooltip Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <DSTooltipProvider>
                    <div className="flex gap-4">
                      <DSTooltip>
                        <DSTooltipTrigger asChild>
                          <DSButton variant="outline">Hover me</DSButton>
                        </DSTooltipTrigger>
                        <DSTooltipContent>
                          <p>This is a tooltip!</p>
                        </DSTooltipContent>
                      </DSTooltip>
                      
                      <DSTooltip>
                        <DSTooltipTrigger asChild>
                          <DSButton variant="gradient" gradient={PRODUCT_GRADIENTS.purple}>Hover for info</DSButton>
                        </DSTooltipTrigger>
                        <DSTooltipContent>
                          <p>Tooltips provide helpful context</p>
                        </DSTooltipContent>
                      </DSTooltip>
                    </div>
                  </DSTooltipProvider>
                </CardContent>
              </Card>
            </section>

            {/* Tables */}
            <section id="tables">
              <h2 className="text-4xl font-bold mb-8">Tables</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Table Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <DSTable>
                    <DSTableHeader>
                      <DSTableRow>
                        <DSTableHead>Name</DSTableHead>
                        <DSTableHead>Email</DSTableHead>
                        <DSTableHead>Role</DSTableHead>
                        <DSTableHead>Status</DSTableHead>
                      </DSTableRow>
                    </DSTableHeader>
                    <DSTableBody>
                      <DSTableRow>
                        <DSTableCell className="font-medium">John Doe</DSTableCell>
                        <DSTableCell>john@example.com</DSTableCell>
                        <DSTableCell>Admin</DSTableCell>
                        <DSTableCell><DSBadge variant="gradient" gradient={PRODUCT_GRADIENTS.emerald}>Active</DSBadge></DSTableCell>
                      </DSTableRow>
                      <DSTableRow>
                        <DSTableCell className="font-medium">Jane Smith</DSTableCell>
                        <DSTableCell>jane@example.com</DSTableCell>
                        <DSTableCell>Developer</DSTableCell>
                        <DSTableCell><DSBadge variant="gradient" gradient={PRODUCT_GRADIENTS.emerald}>Active</DSBadge></DSTableCell>
                      </DSTableRow>
                      <DSTableRow>
                        <DSTableCell className="font-medium">Bob Johnson</DSTableCell>
                        <DSTableCell>bob@example.com</DSTableCell>
                        <DSTableCell>Designer</DSTableCell>
                        <DSTableCell><DSBadge variant="outline">Inactive</DSBadge></DSTableCell>
                      </DSTableRow>
                    </DSTableBody>
                  </DSTable>
                </CardContent>
              </Card>
            </section>

            {/* Data Cards */}
            <section id="data-cards">
              <h2 className="text-4xl font-bold mb-8">Data Cards</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <DSDataCard
                  label="Total Users"
                  value="1,234"
                  change="+12.5%"
                  icon={User}
                />
                <DSDataCard
                  label="Revenue"
                  value="$45,678"
                  change="+8.2%"
                  icon={Zap}
                />
                <DSDataCard
                  label="Active Sessions"
                  value="892"
                  change="-3.1%"
                  icon={Sparkles}
                />
              </div>
            </section>

            {/* Navigation */}
            <section id="navigation">
              <h2 className="text-4xl font-bold mb-8">Navigation</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Navigation Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <DSNavigation>
                    <DSNavItem isActive icon={Home}>Home</DSNavItem>
                    <DSNavItem icon={User}>Profile</DSNavItem>
                    <DSNavItem icon={Settings}>Settings</DSNavItem>
                    <DSNavItem icon={FileText}>Documents</DSNavItem>
                  </DSNavigation>
                </CardContent>
              </Card>
            </section>

            {/* Breadcrumbs */}
            <section id="breadcrumbs">
              <h2 className="text-4xl font-bold mb-8">Breadcrumbs</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Breadcrumb Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <DSBreadcrumb>
                    <DSBreadcrumbList>
                      <DSBreadcrumbItem>
                        <DSBreadcrumbLink href="/">Home</DSBreadcrumbLink>
                      </DSBreadcrumbItem>
                      <DSBreadcrumbSeparator />
                      <DSBreadcrumbItem>
                        <DSBreadcrumbLink href="/components">Components</DSBreadcrumbLink>
                      </DSBreadcrumbItem>
                      <DSBreadcrumbSeparator />
                      <DSBreadcrumbItem>
                        <DSBreadcrumbLink>Breadcrumb</DSBreadcrumbLink>
                      </DSBreadcrumbItem>
                    </DSBreadcrumbList>
                  </DSBreadcrumb>
                </CardContent>
              </Card>
            </section>

            {/* Sidebars */}
            <section id="sidebars">
              <h2 className="text-4xl font-bold mb-8">Sidebar</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Sidebar</CardTitle>
                  <CardDescription>A collapsible sidebar component. Requires SidebarProvider at app level - see installation guide.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden h-96 flex w-full">
                    {/* Static sidebar visual mock */}
                    <div className="w-64 bg-card/40 backdrop-blur-md border-r border-border/50">
                      <div className="p-4">
                        <h3 className="font-semibold mb-4">Menu</h3>
                        <div className="space-y-1">
                          <div className="px-3 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-medium flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            <span>Dashboard</span>
                          </div>
                          <div className="px-3 py-2 rounded-lg hover:bg-accent/50 flex items-center gap-2 text-foreground">
                            <User className="w-4 h-4" />
                            <span>Users</span>
                          </div>
                          <div className="px-3 py-2 rounded-lg hover:bg-accent/50 flex items-center gap-2 text-foreground">
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </div>
                          <div className="px-3 py-2 rounded-lg hover:bg-accent/50 flex items-center gap-2 text-foreground">
                            <FileText className="w-4 h-4" />
                            <span>Reports</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 p-6 bg-muted/20">
                      <h3 className="text-lg font-semibold mb-2">Main Content Area</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        This is a visual preview of the Sidebar component.
                      </p>
                      <DSButton 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/installation')}
                      >
                        View Setup Guide
                      </DSButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Tabs */}
            <section id="tabs">
              <h2 className="text-4xl font-bold mb-8">Tabs</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Tabs Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <DSTabs defaultValue="tab1">
                    <DSTabsList>
                      <DSTabsTrigger value="tab1">Overview</DSTabsTrigger>
                      <DSTabsTrigger value="tab2">Analytics</DSTabsTrigger>
                      <DSTabsTrigger value="tab3">Settings</DSTabsTrigger>
                    </DSTabsList>
                    <DSTabsContent value="tab1" className="mt-4">
                      <p className="text-sm text-muted-foreground">Overview content goes here.</p>
                    </DSTabsContent>
                    <DSTabsContent value="tab2" className="mt-4">
                      <p className="text-sm text-muted-foreground">Analytics content goes here.</p>
                    </DSTabsContent>
                    <DSTabsContent value="tab3" className="mt-4">
                      <p className="text-sm text-muted-foreground">Settings content goes here.</p>
                    </DSTabsContent>
                  </DSTabs>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Effects Tab */}
          <TabsContent value="effects" className="space-y-8">
            {/* Gradient Mesh */}
            <section id="gradient-mesh">
              <Card>
                <CardHeader>
                  <CardTitle>Gradient Mesh</CardTitle>
                  <CardDescription>Floating gradient orbs with mix-blend-multiply</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Creates ambient background gradients</p>
                  <code className="bg-muted p-2 rounded text-xs block">
                    &lt;DSGradientMesh opacity={"{0.3}"} /&gt;
                  </code>
                </CardContent>
              </Card>
            </section>

            {/* Floating Particles */}
            <section id="particles">
              <Card>
                <CardHeader>
                  <CardTitle>Floating Particles</CardTitle>
                  <CardDescription>Subtle animated particles for depth</CardDescription>
                </CardHeader>
                <CardContent>
                  <code className="bg-muted p-2 rounded text-xs block">
                    &lt;DSFloatingParticles count={"{20}"} /&gt;
                  </code>
                </CardContent>
              </Card>
            </section>

            {/* Magnetic Cursor */}
            <section id="magnetic-cursor">
              <Card>
                <CardHeader>
                  <CardTitle>Magnetic Cursor</CardTitle>
                  <CardDescription>Glowing cursor follower effect</CardDescription>
                </CardHeader>
                <CardContent>
                  <code className="bg-muted p-2 rounded text-xs block">
                    &lt;DSMagneticCursor size={"{800}"} opacity={"{0.15}"} /&gt;
                  </code>
                </CardContent>
              </Card>
            </section>

            {/* Custom Hooks */}
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
              <CardHeader>
                <CardTitle>Using in Lovable</CardTitle>
                <CardDescription>Two ways to get started with Dollyland Design System</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Method 1: Remix */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    Method 1: Remix This Project (Recommended)
                  </h3>
                  <p className="text-muted-foreground mb-4">Get everything pre-configured in seconds</p>
                  <ol className="space-y-3 text-sm mb-4 list-decimal list-inside">
                    <li>Click your project name (top left corner)</li>
                    <li>Click "Settings"</li>
                    <li>Click "Remix this project"</li>
                    <li>Start building with all 29+ components ready!</li>
                  </ol>
                  <DSButton 
                    variant="gradient" 
                    gradient={PRODUCT_GRADIENTS.purple}
                    size="lg"
                    onClick={() => navigate('/installation')}
                  >
                    <Code2 className="w-5 h-5" />
                    View Detailed Installation Guide
                  </DSButton>
                </div>

                {/* Method 2: Copy Components */}
                <div className="pt-8 border-t">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Copy className="w-6 h-6 text-primary" />
                    Method 2: Copy to Existing Project
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Add Dollyland components to your existing Lovable project
                  </p>
                  
                  <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">1. Copy Design System Folder</h4>
                      <p className="text-sm text-muted-foreground">Copy <code className="bg-background px-2 py-1 rounded">src/components/design-system</code> to your project</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">2. Copy Design Tokens</h4>
                      <p className="text-sm text-muted-foreground">Copy <code className="bg-background px-2 py-1 rounded">src/lib/design-tokens.ts</code> to your project</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">3. Copy Custom Hooks</h4>
                      <p className="text-sm text-muted-foreground">Copy <code className="bg-background px-2 py-1 rounded">src/hooks</code> folder to your project</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">4. Import Design System CSS</h4>
                      <p className="text-sm text-muted-foreground mb-2">Add to your <code className="bg-background px-2 py-1 rounded">src/index.css</code>:</p>
                      <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
                        <code>@import './styles/design-system.css';</code>
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">5. Update Tailwind Config</h4>
                      <p className="text-sm text-muted-foreground mb-2">Merge the custom animations and utilities from <code className="bg-background px-2 py-1 rounded">tailwind.config.ts</code></p>
                    </div>
                  </div>

                  <DSButton 
                    variant="outline"
                    size="lg"
                    className="mt-6"
                    onClick={() => navigate('/installation')}
                  >
                    <FileText className="w-5 h-5" />
                    See Complete Installation Checklist
                  </DSButton>
                </div>

                {/* Quick Start */}
                <div className="pt-8 border-t">
                  <h3 className="text-2xl font-bold mb-4">Quick Start Example</h3>
                  <p className="text-sm text-muted-foreground mb-4">Once installed, use components like this:</p>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                    <code>{`import { DSButton, DSCard, DSBadge } from '@/components/design-system';
import { PRODUCT_GRADIENTS } from '@/lib/design-tokens';

export default function MyComponent() {
  return (
    <DSCard gradient={PRODUCT_GRADIENTS.purple}>
      <DSBadge variant="gradient" gradient={PRODUCT_GRADIENTS.cyan}>
        New Feature
      </DSBadge>
      <h2>Welcome to Dollyland</h2>
      <DSButton variant="gradient" gradient={PRODUCT_GRADIENTS.indigo}>
        Get Started
      </DSButton>
    </DSCard>
  );
}`}</code>
                  </pre>
                </div>

                {/* Need Help */}
                <div className="pt-8 border-t">
                  <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
                  <DSAlert variant="default">
                    <Info className="h-4 w-4" />
                    <DSAlertTitle>Interactive Installation Guide</DSAlertTitle>
                    <DSAlertDescription>
                      Visit the <span className="font-semibold">/installation</span> page for an interactive checklist with detailed instructions and troubleshooting.
                    </DSAlertDescription>
                  </DSAlert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
