import React from 'react';
import { OnboardingTour } from '../OnboardingTour';

interface PredictiveAnalyticsTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PredictiveAnalyticsTour: React.FC<PredictiveAnalyticsTourProps> = ({ isOpen, onClose }) => {
  const steps = [
    {
      selector: '[data-tour="analytics-header"]',
      content: 'Welcome to Predictive Analytics! Get AI-powered insights into user behavior, agent performance, and future trends.'
    },
    {
      selector: '[data-tour="user-behavior-prediction"]',
      content: 'Predict user behavior patterns, identify at-risk customers, and discover optimization opportunities using machine learning.'
    },
    {
      selector: '[data-tour="performance-forecasting"]',
      content: 'Forecast agent performance trends, predict resource needs, and plan capacity based on historical data.'
    },
    {
      selector: '[data-tour="market-insights"]',
      content: 'Get insights into market trends, competitor analysis, and opportunities for new agent capabilities.'
    },
    {
      selector: '[data-tour="automated-recommendations"]',
      content: 'Receive automated recommendations for agent improvements, workflow optimizations, and strategic decisions.'
    },
    {
      selector: '[data-tour="custom-models"]',
      content: 'Train custom predictive models on your data to generate insights specific to your business and use cases.'
    }
  ];

  return (
    <OnboardingTour
      steps={steps}
      isOpen={isOpen}
      onClose={onClose}
      tourKey="predictive-analytics"
    />
  );
};