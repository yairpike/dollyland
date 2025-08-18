import React, { useState, useEffect, useRef } from 'react';
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
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return;

    const targetElement = document.querySelector(currentStepData.selector);
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const tooltipElement = tooltipRef.current;
    if (!tooltipElement) return;

    const tooltipRect = tooltipElement.getBoundingClientRect();
    const position = currentStepData.position || 'bottom';

    // Account for scroll position
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = rect.top + scrollTop - tooltipRect.height - 20;
        left = rect.left + scrollLeft + (rect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = rect.bottom + scrollTop + 20;
        left = rect.left + scrollLeft + (rect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = rect.top + scrollTop + (rect.height - tooltipRect.height) / 2;
        left = rect.left + scrollLeft - tooltipRect.width - 20;
        break;
      case 'right':
        top = rect.top + scrollTop + (rect.height - tooltipRect.height) / 2;
        left = rect.right + scrollLeft + 20;
        break;
    }

    // Keep tooltip within viewport
    const padding = 20;
    top = Math.max(padding, Math.min(window.innerHeight + scrollTop - tooltipRect.height - padding, top));
    left = Math.max(padding, Math.min(window.innerWidth + scrollLeft - tooltipRect.width - padding, left));

    setTooltipPosition({ top, left });
    setHighlightPosition({
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      width: rect.width,
      height: rect.height
    });
  };

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

  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      // Wait for next tick to ensure DOM is updated
      setTimeout(() => {
        calculatePosition();
      }, 150);

      // Recalculate position on resize and scroll
      const handleResize = () => setTimeout(calculatePosition, 100);
      const handleScroll = () => setTimeout(calculatePosition, 50);
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isOpen, currentStep, steps]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/50" />
      
      {/* Highlight */}
      <div 
        className="fixed z-50 pointer-events-none"
        style={{
          top: highlightPosition.top - 8,
          left: highlightPosition.left - 8,
          width: highlightPosition.width + 16,
          height: highlightPosition.height + 16,
          border: '3px solid hsl(var(--primary))',
          borderRadius: '12px',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      {/* Tooltip */}
      <div 
        ref={tooltipRef}
        className="fixed z-50"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          position: 'absolute',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <Card className="w-80 border-0 shadow-xl bg-background">
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
    </>
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
