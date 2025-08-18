import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface TourStep {
  selector: string;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  tourKey: string;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  isOpen,
  onClose,
  tourKey
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && currentStep > 0) {
      localStorage.setItem(`tour_${tourKey}_completed`, 'true');
    }
  }, [isOpen, tourKey, currentStep]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <Card className="w-80 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <Badge variant="secondary" className="text-xs">
                {currentStep + 1} of {steps.length}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {steps[currentStep]?.content}
          </div>

          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button
              size="sm"
              onClick={() => {
                if (currentStep < steps.length - 1) {
                  setCurrentStep(currentStep + 1);
                  steps[currentStep + 1]?.action?.();
                } else {
                  onClose();
                }
              }}
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              {currentStep !== steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const useTourManager = () => {
  const shouldShowTour = (tourKey: string) => {
    return !localStorage.getItem(`tour_${tourKey}_completed`);
  };

  const markTourAsCompleted = (tourKey: string) => {
    localStorage.setItem(`tour_${tourKey}_completed`, 'true');
  };

  const resetTours = () => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('tour_'));
    keys.forEach(key => localStorage.removeItem(key));
  };

  return { shouldShowTour, markTourAsCompleted, resetTours };
};