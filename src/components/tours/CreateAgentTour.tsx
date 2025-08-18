import React from 'react';
import { OnboardingTour } from '../OnboardingTour';

interface CreateAgentTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAgentTour: React.FC<CreateAgentTourProps> = ({ isOpen, onClose }) => {
  const steps = [
    {
      selector: '[data-tour="create-agent-button"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Welcome to Dolly! 🎉</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Let's create your first AI agent! Click the "Create Agent" button to get started.
          </p>
          <p className="text-xs text-muted-foreground">
            This is where you'll begin building your AI workforce.
          </p>
        </div>
      )
    },
    {
      selector: '[data-tour="agent-name-input"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Name Your Agent</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Give your agent a descriptive name that reflects its purpose. For example: "Customer Support Bot" or "Content Writer".
          </p>
          <p className="text-xs text-primary">
            💡 Tip: Use clear, descriptive names to easily identify your agents later.
          </p>
        </div>
      )
    },
    {
      selector: '[data-tour="agent-description-input"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Describe Your Agent</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Explain what your agent does and how it helps. This helps you and others understand its capabilities.
          </p>
          <p className="text-xs text-primary">
            💡 Tip: Include the main tasks and use cases for your agent.
          </p>
        </div>
      )
    },
    {
      selector: '[data-tour="agent-system-prompt-input"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Set the System Prompt</h3>
          <p className="text-sm text-muted-foreground mb-3">
            This is the core instruction that defines your agent's personality, behavior, and expertise. Be specific about what you want it to do.
          </p>
          <p className="text-xs text-primary">
            💡 Tip: Start with "You are a..." and define the role, skills, and behavior clearly.
          </p>
        </div>
      )
    },
    {
      selector: '[data-tour="create-agent-submit"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Create Your Agent! 🚀</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Once you're happy with the configuration, click "Create Agent" to bring your AI assistant to life!
          </p>
          <p className="text-xs text-primary">
            💡 You can always edit these settings later from the agent management page.
          </p>
        </div>
      )
    }
  ];

  return (
    <OnboardingTour
      steps={steps}
      isOpen={isOpen}
      onClose={onClose}
      tourKey="create-agent"
    />
  );
};