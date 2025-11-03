import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import {
  DSCard,
  DSButton,
  DSCheckbox,
  DSAlert,
  DSAlertTitle,
  DSAlertDescription,
  DSBadge,
} from "@/components/design-system";
import { CheckCircle, Copy, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const installationSteps = [
  {
    id: "remix",
    title: "Remix this project in Lovable",
    description: "Click your project name → Settings → 'Remix this project'",
  },
  {
    id: "design-system",
    title: "Copy design system components",
    description: "Copy the entire `src/components/design-system/` folder to your project",
  },
  {
    id: "tokens",
    title: "Copy design tokens",
    description: "Copy `src/lib/design-tokens.ts` to your project",
  },
  {
    id: "hooks",
    title: "Copy custom hooks",
    description: "Copy hooks from `src/hooks/` (useHoverGlow, useMousePosition, useScrollParallax)",
  },
  {
    id: "css",
    title: "Import design system CSS",
    description: "Add `@import './styles/design-system.css';` to your `src/index.css`",
  },
  {
    id: "tailwind",
    title: "Update Tailwind config",
    description: "Copy the custom theme configuration from `tailwind.config.ts`",
  },
  {
    id: "dependencies",
    title: "Install dependencies",
    description: "All required dependencies should be automatically installed",
  },
];

export default function Installation() {
  const navigate = useNavigate();
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());

  const handleStepToggle = (stepId: string) => {
    const newChecked = new Set(checkedSteps);
    if (newChecked.has(stepId)) {
      newChecked.delete(stepId);
    } else {
      newChecked.add(stepId);
    }
    setCheckedSteps(newChecked);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const progress = (checkedSteps.size / installationSteps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="installation" />
      
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-12">
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Installation Guide
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Follow these steps to integrate Dollyland Design System into your Lovable project
          </p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{checkedSteps.size} / {installationSteps.length}</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Start for Lovable */}
        <DSCard className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-primary" />
            Quick Start (Recommended)
          </h2>
          <p className="text-muted-foreground mb-6">
            The easiest way to use this design system is to remix this entire project:
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <DSBadge>1</DSBadge>
              <span>Click on the project name in the top left corner</span>
            </div>
            <div className="flex items-center gap-3">
              <DSBadge>2</DSBadge>
              <span>Click "Settings"</span>
            </div>
            <div className="flex items-center gap-3">
              <DSBadge>3</DSBadge>
              <span>Click "Remix this project"</span>
            </div>
            <div className="flex items-center gap-3">
              <DSBadge>4</DSBadge>
              <span>You now have a complete copy with all components ready to use!</span>
            </div>
          </div>
        </DSCard>

        {/* Manual Installation */}
        <h2 className="text-3xl font-bold mb-6">Manual Integration</h2>
        <p className="text-muted-foreground mb-8">
          Use this checklist if you want to add Dollyland components to an existing Lovable project:
        </p>

        <div className="space-y-4 mb-12">
          {installationSteps.map((step, index) => (
            <DSCard key={step.id} className="p-6">
              <div className="flex items-start gap-4">
                <DSCheckbox
                  id={step.id}
                  checked={checkedSteps.has(step.id)}
                  onCheckedChange={() => handleStepToggle(step.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor={step.id} className="cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <DSBadge variant={checkedSteps.has(step.id) ? "default" : "outline"}>
                        {index + 1}
                      </DSBadge>
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </label>
                </div>
              </div>
            </DSCard>
          ))}
        </div>

        {/* Code Examples */}
        <h2 className="text-3xl font-bold mb-6">Code Examples</h2>

        <div className="space-y-6 mb-12">
          <DSCard className="p-6">
            <h3 className="text-lg font-semibold mb-3">Import CSS in index.css</h3>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm relative group">
              <code>@import './styles/design-system.css';</code>
              <DSButton
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copyToClipboard("@import './styles/design-system.css';")}
              >
                <Copy className="w-4 h-4" />
              </DSButton>
            </div>
          </DSCard>

          <DSCard className="p-6">
            <h3 className="text-lg font-semibold mb-3">Using Components</h3>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm relative group">
              <pre>{`import { DSButton, DSCard } from "@/components/design-system";

export default function MyComponent() {
  return (
    <DSCard className="p-8">
      <h1>Hello World</h1>
      <DSButton variant="gradient">
        Click me
      </DSButton>
    </DSCard>
  );
}`}</pre>
              <DSButton
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copyToClipboard(`import { DSButton, DSCard } from "@/components/design-system";

export default function MyComponent() {
  return (
    <DSCard className="p-8">
      <h1>Hello World</h1>
      <DSButton variant="gradient">
        Click me
      </DSButton>
    </DSCard>
  );
}`)}
              >
                <Copy className="w-4 h-4" />
              </DSButton>
            </div>
          </DSCard>
        </div>

        {/* Troubleshooting */}
        <h2 className="text-3xl font-bold mb-6">Troubleshooting</h2>
        
        <div className="space-y-4">
          <DSAlert variant="warning" icon={AlertCircle}>
            <DSAlertTitle>Components not rendering correctly?</DSAlertTitle>
            <DSAlertDescription>
              Make sure you've imported the design-system.css file in your index.css and updated your Tailwind config with the custom theme values.
            </DSAlertDescription>
          </DSAlert>

          <DSAlert variant="default">
            <DSAlertTitle>TypeScript errors?</DSAlertTitle>
            <DSAlertDescription>
              Ensure all dependencies are installed. Lovable should handle this automatically when you copy components.
            </DSAlertDescription>
          </DSAlert>

          <DSAlert variant="default">
            <DSAlertTitle>Need help?</DSAlertTitle>
            <DSAlertDescription>
              Check out the <a href="/design-system" className="underline text-primary" onClick={(e) => { e.preventDefault(); navigate('/design-system'); }}>component showcase</a> for live examples and usage patterns.
            </DSAlertDescription>
          </DSAlert>
        </div>

        {/* Completion */}
        {progress === 100 && (
          <DSAlert variant="success" icon={CheckCircle} className="mt-8">
            <DSAlertTitle>All Steps Completed! 🎉</DSAlertTitle>
            <DSAlertDescription>
              You're ready to start building with Dollyland Design System. Check out the examples page to see what you can create!
            </DSAlertDescription>
          </DSAlert>
        )}

        {/* Quick Links */}
        <div className="mt-12 flex gap-4 flex-wrap">
          <DSButton onClick={() => navigate('/design-system')}>
            View Components
            <ExternalLink className="w-4 h-4 ml-2" />
          </DSButton>
          <DSButton variant="outline" onClick={() => navigate('/examples')}>
            See Examples
            <ExternalLink className="w-4 h-4 ml-2" />
          </DSButton>
          <DSButton variant="outline" onClick={() => window.open('https://docs.lovable.dev', '_blank')}>
            Lovable Docs
            <ExternalLink className="w-4 h-4 ml-2" />
          </DSButton>
        </div>
      </div>
    </div>
  );
}
