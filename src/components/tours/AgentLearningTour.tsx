import React from 'react';
import { OnboardingTour } from '../OnboardingTour';

interface AgentLearningTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentLearningTour: React.FC<AgentLearningTourProps> = ({ isOpen, onClose }) => {
  const steps = [
    {
      selector: '[data-tour="learning-header"]',
      content: 'Welcome to the Agent Learning System! Your agents can now learn and improve from every interaction.'
    },
    {
      selector: '[data-tour="feedback-system"]',
      content: 'Track user feedback and ratings to automatically identify areas where your agent can improve.'
    },
    {
      selector: '[data-tour="performance-analytics"]',
      content: 'Monitor performance metrics including response quality, user satisfaction, and task completion rates.'
    },
    {
      selector: '[data-tour="auto-optimization"]',
      content: 'Enable automatic prompt optimization based on successful interactions and user feedback patterns.'
    },
    {
      selector: '[data-tour="learning-insights"]',
      content: 'View detailed insights about what your agent has learned and how it has evolved over time.'
    },
    {
      selector: '[data-tour="continuous-improvement"]',
      content: 'Set up continuous improvement cycles where your agent automatically refines its responses based on data.'
    }
  ];

  return (
    <OnboardingTour
      steps={steps}
      isOpen={isOpen}
      onClose={onClose}
      tourKey="agent-learning"
    />
  );
};