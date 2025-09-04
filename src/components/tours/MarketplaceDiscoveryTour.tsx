import React from 'react';
import { OnboardingTour } from '../OnboardingTour';

interface MarketplaceDiscoveryTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MarketplaceDiscoveryTour: React.FC<MarketplaceDiscoveryTourProps> = ({ isOpen, onClose }) => {
  const steps = [
    {
      selector: '[data-tour="ai-search"]',
      content: 'Use AI-powered semantic search to find agents using natural language. Try searching for "help me with sales calls" or "analyze customer data".'
    },
    {
      selector: '[data-tour="smart-recommendations"]',
      content: 'Get personalized agent recommendations based on your usage patterns, industry, and specific needs.'
    },
    {
      selector: '[data-tour="performance-insights"]',
      content: 'View detailed performance analytics for each agent including success rates, user satisfaction, and efficiency metrics.'
    },
    {
      selector: '[data-tour="trending-agents"]',
      content: 'Discover trending agents that are gaining popularity and delivering exceptional results for users.'
    },
    {
      selector: '[data-tour="community-ratings"]',
      content: 'See community ratings, reviews, and success stories from other users to make informed decisions.'
    },
    {
      selector: '[data-tour="instant-preview"]',
      content: 'Preview agent capabilities and sample conversations before committing to try or purchase.'
    }
  ];

  return (
    <OnboardingTour
      steps={steps}
      isOpen={isOpen}
      onClose={onClose}
      tourKey="marketplace-discovery"
    />
  );
};