import React from 'react';
import { OnboardingTour } from '../OnboardingTour';

interface ThirdPartyIntegrationsTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThirdPartyIntegrationsTour: React.FC<ThirdPartyIntegrationsTourProps> = ({ isOpen, onClose }) => {
  const steps = [
    {
      selector: '[data-tour="integrations-header"]',
      content: 'Connect your agents with popular tools and services! Seamlessly integrate with CRM, communication, and productivity platforms.'
    },
    {
      selector: '[data-tour="available-integrations"]',
      content: 'Browse our extensive library of pre-built integrations for Slack, Salesforce, HubSpot, Zapier, and many more.'
    },
    {
      selector: '[data-tour="integration-setup"]',
      content: 'Set up integrations with just a few clicks. Configure authentication, permissions, and data mapping easily.'
    },
    {
      selector: '[data-tour="custom-integrations"]',
      content: 'Build custom integrations using our flexible API framework. Connect to any service with REST APIs.'
    },
    {
      selector: '[data-tour="integration-monitoring"]',
      content: 'Monitor integration health, track data flow, and get alerts when connections need attention.'
    },
    {
      selector: '[data-tour="marketplace-integrations"]',
      content: 'Discover community-built integrations in our marketplace and share your own with other users.'
    }
  ];

  return (
    <OnboardingTour
      steps={steps}
      isOpen={isOpen}
      onClose={onClose}
      tourKey="third-party-integrations"
    />
  );
};