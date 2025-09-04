import React from 'react';
import { OnboardingTour } from '../OnboardingTour';

interface CommunityFeaturesTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityFeaturesTour: React.FC<CommunityFeaturesTourProps> = ({ isOpen, onClose }) => {
  const steps = [
    {
      selector: '[data-tour="community-header"]',
      content: 'Welcome to the Community Hub! Connect with other AI agent creators, share knowledge, and collaborate on innovations.'
    },
    {
      selector: '[data-tour="community-discussions"]',
      content: 'Join discussions about AI agent development, share tips, and get help from the community.'
    },
    {
      selector: '[data-tour="agent-forking"]',
      content: 'Fork and customize public agents from the community. Build upon existing work to accelerate your development.'
    },
    {
      selector: '[data-tour="knowledge-sharing"]',
      content: 'Share your expertise through articles, tutorials, and best practices. Contribute to the collective knowledge base.'
    },
    {
      selector: '[data-tour="collaboration-tools"]',
      content: 'Use built-in collaboration tools to work together on agent projects and share resources.'
    },
    {
      selector: '[data-tour="community-challenges"]',
      content: 'Participate in community challenges and competitions to showcase your agent-building skills.'
    }
  ];

  return (
    <OnboardingTour
      steps={steps}
      isOpen={isOpen}
      onClose={onClose}
      tourKey="community-features"
    />
  );
};