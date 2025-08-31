import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Star, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly?: number;
  features: any; // Allow Json type from Supabase
  conversation_limit?: number;
  is_active: boolean;
}

export const PricingPlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load pricing plans');
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setLoadingPlanId(planId);
    setIsLoading(true);

    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      // For free plan, handle locally without backend calls
      if (plan.price_monthly === 0) {
        // Simulate processing time for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('You\'re on the Free plan! Start creating agents now.');
        return;
      }

      console.log('Starting checkout process for plan:', planId);
      
      // For paid plans, redirect to Stripe checkout
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          planId, 
          priceType: isYearly ? 'yearly' : 'monthly' 
        }
      });

      if (error) {
        console.error('Checkout error:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (data?.url) {
        console.log('Redirecting to checkout URL:', data.url);
        window.open(data.url, '_blank');
        toast.success('Opening payment page...');
      } else if (data?.success) {
        toast.success(data.message);
      } else {
        console.error('No checkout URL or success response received');
        throw new Error('Invalid response from checkout service');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage?.includes('Failed to fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      } else if (errorMessage?.includes('STRIPE_SECRET_KEY')) {
        toast.error('Payment system configuration error. Please contact support.');
      } else {
        toast.error(`Failed to start checkout: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
      setLoadingPlanId(null);
    }
  };

  const formatPrice = (plan: SubscriptionPlan) => {
    if (plan.price_monthly === 0) return 'Free';
    
    const price = isYearly && plan.price_yearly ? plan.price_yearly : plan.price_monthly;
    const displayPrice = price / 100;
    const period = isYearly ? 'year' : 'month';
    
    return `$${displayPrice}/${period}`;
  };

  const getYearlySavings = (plan: SubscriptionPlan) => {
    if (!plan.price_yearly || plan.price_monthly === 0) return null;
    
    const monthlyTotal = plan.price_monthly * 12;
    const savings = monthlyTotal - plan.price_yearly;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    
    return { amount: savings / 100, percentage };
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter':
        return <Zap className="w-6 h-6 text-primary" />;
      case 'pro':
        return <Star className="w-6 h-6 text-primary" />;
      default:
        return null;
    }
  };

  const isPlanPopular = (planName: string) => {
    return planName.toLowerCase() === 'starter';
  };

  const getCurrentPlanInfo = () => {
    if (!subscription?.plan) return null;
    return subscription.plan;
  };

  const getButtonText = (plan: SubscriptionPlan) => {
    const currentPlan = getCurrentPlanInfo();
    
    if (!currentPlan) {
      return plan.price_monthly === 0 ? 'Get Started Free' : 'Subscribe Now';
    }
    
    if (currentPlan.name === plan.name) {
      return 'Current Plan';
    }
    
    // Compare plan prices to determine upgrade/downgrade
    const currentPlanPrice = typeof currentPlan.conversation_limit === 'number' && currentPlan.conversation_limit === 20 ? 0 : 
                            currentPlan.name === 'Starter' ? 799 : 1999;
    
    if (plan.price_monthly > currentPlanPrice) {
      return `Upgrade to ${plan.name}`;
    } else {
      return `Downgrade to ${plan.name}`;
    }
  };

  const isCurrentPlan = (plan: SubscriptionPlan) => {
    const currentPlan = getCurrentPlanInfo();
    return currentPlan?.name === plan.name;
  };

  return (
    <div className="py-24 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start free, upgrade when you're ready
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm ${isYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            <Badge variant="secondary" className="ml-2">Save 20%</Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const savings = getYearlySavings(plan);
            const isPopular = isPlanPopular(plan.name);
            
            return (
              <Card key={plan.id} className={`relative ${isPopular ? 'ring-2 ring-primary shadow-xl scale-105' : ''}`}>
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center mb-2">
                    {getPlanIcon(plan.name)}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm px-2">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mt-4">
                    <div className="text-4xl font-bold text-primary">
                      {formatPrice(plan)}
                    </div>
                    {isYearly && savings && plan.price_monthly > 0 && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Save ${savings.amount} ({savings.percentage}%) yearly
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading || isCurrentPlan(plan) || subscriptionLoading}
                    className={`w-full mb-6 ${isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={isCurrentPlan(plan) ? 'outline' : plan.price_monthly === 0 ? 'outline' : 'default'}
                  >
                    {loadingPlanId === plan.id ? 'Processing...' : getButtonText(plan)}
                  </Button>

                  <ul className="space-y-3">
                    {(Array.isArray(plan.features) ? plan.features : []).map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    
                    {plan.conversation_limit && (
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{plan.conversation_limit} conversations per month</span>
                      </li>
                    )}
                    
                    {!plan.conversation_limit && plan.price_monthly > 0 && (
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Unlimited conversations</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            All plans include a 14-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
};