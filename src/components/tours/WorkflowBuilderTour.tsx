import React from 'react';
import { OnboardingTour } from '../OnboardingTour';

interface WorkflowBuilderTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowBuilderTour: React.FC<WorkflowBuilderTourProps> = ({ isOpen, onClose }) => {
  const steps = [
    {
      selector: '[data-tour="workflow-canvas"]',
      content: 'Welcome to the Advanced Workflow Builder! Drag and drop components to create sophisticated automation workflows.'
    },
    {
      selector: '[data-tour="node-library"]',
      content: 'Choose from a library of pre-built nodes including triggers, actions, conditions, and integrations.'
    },
    {
      selector: '[data-tour="visual-connections"]',
      content: 'Create visual connections between nodes to define the flow of data and execution order.'
    },
    {
      selector: '[data-tour="real-time-execution"]',
      content: 'Watch your workflows execute in real-time with live status updates and data flow visualization.'
    },
    {
      selector: '[data-tour="template-workflows"]',
      content: 'Start with template workflows for common use cases like lead qualification, customer support, and data processing.'
    },
    {
      selector: '[data-tour="workflow-testing"]',
      content: 'Test your workflows with sample data before deploying them to ensure they work as expected.'
    }
  ];

  return (
    <OnboardingTour
      steps={steps}
      isOpen={isOpen}
      onClose={onClose}
      tourKey="advanced-workflow-builder"
    />
  );
};