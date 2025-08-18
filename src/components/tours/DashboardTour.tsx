import React from 'react';
import { OnboardingTour } from '../OnboardingTour';

interface DashboardTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardTour: React.FC<DashboardTourProps> = ({ isOpen, onClose }) => {
  const steps = [
    {
      selector: '[data-tour="dashboard-welcome"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Welcome to Dolly! 🎉</h3>
          <p className="text-sm text-muted-foreground mb-3">
            This is your command center for managing AI agents. From here, you can create, edit, and deploy powerful AI assistants.
          </p>
          <p className="text-xs text-primary">
            💡 Let's take a quick tour to get you started!
          </p>
        </div>
      )
    },
    {
      selector: '[data-tour="agent-stats"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Your Agent Overview 📊</h3>
          <p className="text-sm text-muted-foreground mb-3">
            See key metrics about your agents - how many you have, total interactions, and performance stats.
          </p>
          <p className="text-xs text-primary">
            💡 These numbers help you track your AI automation success.
          </p>
        </div>
      )
    },
    {
      selector: '[data-tour="create-agent-button"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Create Your First Agent 🤖</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Ready to build? Click here to create your first AI agent. You can make agents for customer support, content creation, data analysis, and more!
          </p>
          <p className="text-xs text-primary">
            💡 Don't worry - you can always modify your agent later.
          </p>
        </div>
      )
    },
    {
      selector: '[data-tour="agent-list"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Your Agent Collection 📋</h3>
          <p className="text-sm text-muted-foreground mb-3">
            All your agents appear here. You can edit, chat with, or manage each one. Think of this as your AI team roster!
          </p>
          <p className="text-xs text-primary">
            💡 Click on any agent card to edit its settings and capabilities.
          </p>
        </div>
      )
    },
    {
      selector: '[data-tour="marketplace-link"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Explore the Marketplace 🏪</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Discover pre-built agents created by the community, or publish your own creations for others to use.
          </p>
          <p className="text-xs text-primary">
            💡 Great way to get inspired and see what's possible with AI agents!
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
      tourKey="dashboard"
    />
  );
};