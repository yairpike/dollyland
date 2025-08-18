import React from 'react';
import { OnboardingTour } from '../OnboardingTour';

interface EditAgentTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditAgentTour: React.FC<EditAgentTourProps> = ({ isOpen, onClose }) => {
  const steps = [
    {
      selector: '[data-tour="edit-agent-settings"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Agent Settings Hub 🛠️</h3>
          <p className="text-sm text-muted-foreground mb-3">
            This is where you configure your agent's core behavior. Update the name, description, and system prompt to fine-tune your agent.
          </p>
          <p className="text-xs text-primary">
            💡 The system prompt is the most important part - it defines your agent's personality and capabilities.
          </p>
        </div>
      )
    },
    {
      selector: '[data-tour="edit-agent-knowledge"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Knowledge Base 📚</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Upload documents, websites, and other content to give your agent domain-specific knowledge. This makes your agent smarter and more accurate.
          </p>
          <p className="text-xs text-primary">
            💡 Tip: Upload PDFs, text files, or crawl websites to expand your agent's knowledge.
          </p>
        </div>
      )
    },
    {
      selector: '[data-tour="edit-agent-ai-setup"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">AI Configuration ⚡</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Choose your AI provider (OpenAI, Claude, etc.) and configure model settings. Different models have different strengths and costs.
          </p>
          <p className="text-xs text-primary">
            💡 GPT-4 is great for complex tasks, while GPT-3.5 is faster and cheaper for simple tasks.
          </p>
        </div>
      )
    },
    {
      selector: '[data-tour="edit-agent-actions"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Actions & Automation 🤖</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Define custom actions your agent can perform, like creating tickets, sending emails, or calling APIs. Make your agent truly functional!
          </p>
          <p className="text-xs text-primary">
            💡 Actions turn your agent from just a chatbot into a powerful automation tool.
          </p>
        </div>
      )
    },
    {
      selector: '[data-tour="edit-agent-workflows"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Workflow Builder 🔄</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Create multi-step automated workflows that combine multiple actions. Perfect for complex business processes.
          </p>
          <p className="text-xs text-primary">
            💡 Think of workflows as recipes - a series of steps to accomplish complex tasks.
          </p>
        </div>
      )
    },
    {
      selector: '[data-tour="edit-agent-integrations"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Integrations 🔗</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Connect your agent to external services like GitHub, Linear, Slack, and more. The next few tabs show different integration options.
          </p>
          <p className="text-xs text-primary">
            💡 Integrations make your agent part of your existing workflow and tools.
          </p>
        </div>
      )
    },
    {
      selector: '[data-tour="edit-agent-deploy"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Deploy Your Agent 🚀</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Ready to go live? Deploy your agent to various platforms and make it accessible to your team or customers.
          </p>
          <p className="text-xs text-primary">
            💡 You can deploy to web, mobile, Slack, Discord, and more!
          </p>
        </div>
      )
    }
  ];

  return (
    <OnboardingTour
      steps={steps}
      isOpen={isOpen}
      onClose={onClose}
      tourKey="edit-agent"
    />
  );
};