import React from 'react';
import { OnboardingTour } from '../OnboardingTour';

interface DeveloperAPITourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperAPITour: React.FC<DeveloperAPITourProps> = ({ isOpen, onClose }) => {
  const steps = [
    {
      selector: '[data-tour="api-portal-header"]',
      content: 'Welcome to the Developer API Portal! Integrate Dolly agents into your applications and build custom solutions.'
    },
    {
      selector: '[data-tour="api-key-management"]',
      content: 'Generate and manage API keys for secure access to your agents. Set permissions and usage limits for each key.'
    },
    {
      selector: '[data-tour="api-documentation"]',
      content: 'Access comprehensive API documentation with examples, SDKs, and interactive testing tools.'
    },
    {
      selector: '[data-tour="webhook-configuration"]',
      content: 'Set up webhooks to receive real-time notifications about agent interactions and events.'
    },
    {
      selector: '[data-tour="usage-analytics"]',
      content: 'Monitor API usage, track performance metrics, and analyze integration health in real-time.'
    },
    {
      selector: '[data-tour="sdk-playground"]',
      content: 'Test API endpoints directly in the browser with our interactive playground and code generators.'
    }
  ];

  return (
    <OnboardingTour
      steps={steps}
      isOpen={isOpen}
      onClose={onClose}
      tourKey="developer-api"
    />
  );
};