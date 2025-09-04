import React from 'react';
import { OnboardingTour } from '../OnboardingTour';

interface FeatureShowcaseTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeatureShowcaseTour: React.FC<FeatureShowcaseTourProps> = ({ isOpen, onClose }) => {
  const steps = [
    {
      selector: '[data-tour="features-overview"]',
      content: 'Explore all of Dolly\'s powerful features! This showcase highlights our complete AI agent platform capabilities.'
    },
    {
      selector: '[data-tour="multimodal-agents"]',
      content: 'Create agents that can process text, voice, images, and documents. Build truly intelligent assistants.'
    },
    {
      selector: '[data-tour="workflow-automation"]',
      content: 'Design complex workflows with visual builders, conditional logic, and multi-agent orchestration.'
    },
    {
      selector: '[data-tour="marketplace-discovery"]',
      content: 'Discover and deploy agents from our marketplace, or publish your own creations for others to use.'
    },
    {
      selector: '[data-tour="community-collaboration"]',
      content: 'Join a thriving community of AI builders, share knowledge, and collaborate on innovative projects.'
    },
    {
      selector: '[data-tour="developer-tools"]',
      content: 'Access powerful APIs, SDKs, and integration tools to embed AI agents into any application.'
    }
  ];

  return (
    <OnboardingTour
      steps={steps}
      isOpen={isOpen}
      onClose={onClose}
      tourKey="feature-showcase"
    />
  );
};