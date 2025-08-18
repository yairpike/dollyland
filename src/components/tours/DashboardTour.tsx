import React from 'react';
import { OnboardingTour } from '../OnboardingTour';

interface DashboardTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardTour: React.FC<DashboardTourProps> = ({ isOpen, onClose }) => {
  const steps = [
    {
      selector: '[data-tour="dashboard-header"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Welcome to Your Dashboard! 🎉</h3>
          <p className="text-sm text-muted-foreground mb-3">
            This is your command center for managing AI agents. From here, you can create, edit, and deploy powerful AI assistants.
          </p>
          <p className="text-xs text-primary">
            💡 Let's take a quick tour to get you started!
          </p>
        </div>
      ),
      position: 'bottom' as const
    },
    {
      selector: '[data-tour="dashboard-stats"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Your Agent Analytics 📊</h3>
          <p className="text-sm text-muted-foreground mb-3">
            See key metrics about your agents - how many you have, total conversations, active users, and performance stats.
          </p>
          <p className="text-xs text-primary">
            💡 These numbers help you track your AI automation success.
          </p>
        </div>
      ),
      position: 'bottom' as const
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
      ),
      position: 'left' as const
    },
    {
      selector: '[data-tour="dashboard-tabs"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Navigate Your Content 📋</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Switch between your personal agents and explore the marketplace. Your agents tab shows all your creations.
          </p>
          <p className="text-xs text-primary">
            💡 The marketplace has pre-built agents you can use or get inspired by!
          </p>
        </div>
      ),
      position: 'top' as const
    },
    {
      selector: '[data-tour="agents-grid"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Your Agent Collection 🏆</h3>
          <p className="text-sm text-muted-foreground mb-3">
            All your agents appear here. You can chat with them, edit their settings, publish them, or delete them. Think of this as your AI team roster!
          </p>
          <p className="text-xs text-primary">
            💡 Click the edit button on any agent to configure its capabilities and integrations.
          </p>
        </div>
      ),
      position: 'top' as const
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