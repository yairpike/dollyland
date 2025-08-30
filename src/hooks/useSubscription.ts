import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SubscriptionPlan {
  name: string;
  features: string[];
  conversation_limit?: number;
}

interface SubscriptionData {
  subscribed: boolean;
  plan: SubscriptionPlan | null;
  subscription_end?: string;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const checkSubscription = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        setSubscription({
          subscribed: false,
          plan: {
            name: 'Free',
            features: ['20 conversations per month', 'Access to public agents', 'Basic support'],
            conversation_limit: 20
          }
        });
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error in subscription check:', error);
      setSubscription({
        subscribed: false,
        plan: {
          name: 'Free',
          features: ['20 conversations per month', 'Access to public agents', 'Basic support'],
          conversation_limit: 20
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  const canCreateConversation = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase.rpc('check_conversation_limit', {
        p_user_id: user.id
      });
      
      if (error) {
        console.error('Error checking conversation limit:', error);
        return false;
      }
      
      return data;
    } catch (error) {
      console.error('Error in conversation limit check:', error);
      return false;
    }
  };

  return {
    subscription,
    loading,
    checkSubscription,
    canCreateConversation,
    isSubscribed: subscription?.subscribed || false,
    plan: subscription?.plan,
  };
};