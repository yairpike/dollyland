import React from 'react';
import { OnboardingTour } from '../OnboardingTour';

interface AgentOrchestrationTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentOrchestrationTour: React.FC<AgentOrchestrationTourProps> = ({ isOpen, onClose }) => {
  const steps = [
    {
      selector: '[data-tour="orchestration-header"]',
      content: 'Welcome to Agent Orchestration! This is where you can create powerful multi-agent workflows that collaborate to solve complex tasks.'
    },
    {
      selector: '[data-tour="agent-workflows"]',
      content: 'Configure workflows where multiple agents work together. Each agent can have specialized roles and pass information between them.'
    },
    {
      selector: '[data-tour="conditional-handoffs"]',
      content: 'Set up conditional handoffs based on task complexity, user input, or agent performance metrics.'
    },
    {
      selector: '[data-tour="parallel-processing"]',
      content: 'Enable parallel processing where multiple agents work simultaneously on different aspects of a task.'
    },
    {
      selector: '[data-tour="workflow-templates"]',
      content: 'Choose from pre-built workflow templates or create custom orchestration patterns for your specific needs.'
    },
    {
      selector: '[data-tour="monitoring-dashboard"]',
      content: 'Monitor your multi-agent workflows in real-time, track performance, and optimize agent collaboration.'
    }
  ];

  return (
    <OnboardingTour
      steps={steps}
      isOpen={isOpen}
      onClose={onClose}
      tourKey="agent-orchestration"
    />
  );
};