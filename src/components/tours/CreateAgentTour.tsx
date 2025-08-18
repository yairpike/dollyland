import React, { useState, useEffect } from 'react';
import { OnboardingTour } from '../OnboardingTour';

interface CreateAgentTourProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: 'template' | 'customize';
  onTemplateSelected: () => void;
}

export const CreateAgentTour: React.FC<CreateAgentTourProps> = ({ 
  isOpen, 
  onClose, 
  currentStep,
  onTemplateSelected 
}) => {
  const [tourPhase, setTourPhase] = useState<'template' | 'customize'>('template');

  // Update tour phase when user switches steps
  useEffect(() => {
    if (currentStep === 'customize' && tourPhase === 'template') {
      setTourPhase('customize');
      // Show the customization tour after a short delay
      setTimeout(() => {
        setTourPhase('customize');
      }, 500);
    }
  }, [currentStep, tourPhase]);

  const templateSteps = [
    {
      selector: '[data-tour="create-agent-card"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Welcome to Agent Creation! 🎉</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Creating an AI agent is easy! First, we'll choose a template that fits your needs, then customize it to your requirements.
          </p>
          <p className="text-xs text-primary">
            💡 Templates provide proven configurations for common use cases.
          </p>
        </div>
      ),
      position: 'bottom' as const
    },
    {
      selector: '[data-tour="agent-templates"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Choose Your Agent Template 🤖</h3>
          <p className="text-sm text-muted-foreground mb-3">
            These templates provide pre-configured prompts and settings for different types of AI agents. Pick one that matches what you want to build!
          </p>
          <p className="text-xs text-primary font-medium">
            👆 Go ahead and click on a template to continue the tour!
          </p>
        </div>
      ),
      position: 'top' as const
    }
  ];

  const customizeSteps = [
    {
      selector: '[data-tour="customize-form"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Perfect! Now Let's Customize 🎨</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Your template has filled in the details, but you can modify everything to fit your specific needs. Let's walk through each field.
          </p>
          <p className="text-xs text-primary">
            💡 The template gives you a great starting point!
          </p>
        </div>
      ),
      position: 'top' as const
    },
    {
      selector: '[data-tour="agent-name-input"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Agent Name 📝</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Give your agent a descriptive name that reflects its purpose. The template has suggested one, but feel free to change it!
          </p>
          <p className="text-xs text-primary">
            💡 Examples: "Customer Support Bot", "Content Writer", "Code Reviewer"
          </p>
        </div>
      ),
      position: 'right' as const
    },
    {
      selector: '[data-tour="agent-description-input"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Description 📋</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Explain what your agent does and how it helps. This helps you and others understand its capabilities at a glance.
          </p>
          <p className="text-xs text-primary">
            💡 Include the main tasks and use cases for your agent.
          </p>
        </div>
      ),
      position: 'right' as const
    },
    {
      selector: '[data-tour="agent-system-prompt-input"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">System Prompt - The Brain! 🧠</h3>
          <p className="text-sm text-muted-foreground mb-3">
            This is the most important part! It defines your agent's personality, behavior, and expertise. The template provides a solid foundation.
          </p>
          <p className="text-xs text-primary">
            💡 Be specific about the role, skills, and behavior you want.
          </p>
        </div>
      ),
      position: 'left' as const
    },
    {
      selector: '[data-tour="create-agent-submit"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Launch Your Agent! 🚀</h3>
          <p className="text-sm text-muted-foreground mb-3">
            When you're happy with the configuration, click "Create Agent" to bring your AI assistant to life! You can always edit these settings later.
          </p>
          <p className="text-xs text-primary">
            💡 Your agent will be ready to chat as soon as it's created!
          </p>
        </div>
      ),
      position: 'left' as const
    }
  ];

  // Show different steps based on current phase
  const currentSteps = tourPhase === 'template' ? templateSteps : customizeSteps;
  
  // Only show tour if we're in the right phase
  const shouldShowTour = isOpen && (
    (tourPhase === 'template' && currentStep === 'template') ||
    (tourPhase === 'customize' && currentStep === 'customize')
  );

  return (
    <OnboardingTour
      steps={currentSteps}
      isOpen={shouldShowTour}
      onClose={onClose}
      tourKey={`create-agent-${tourPhase}`}
    />
  );
};