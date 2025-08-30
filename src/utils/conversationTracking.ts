import { supabase } from '@/integrations/supabase/client';

export const trackConversationUsage = async (
  userId: string,
  agentId: string,
  conversationId: string,
  costCents: number = 15
) => {
  try {
    const { error } = await supabase.rpc('record_conversation_usage', {
      p_user_id: userId,
      p_agent_id: agentId,
      p_conversation_id: conversationId,
      p_cost_cents: costCents
    });

    if (error) {
      console.error('Error tracking conversation usage:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in conversation tracking:', error);
    return false;
  }
};

export const checkConversationLimit = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_conversation_limit', {
      p_user_id: userId
    });

    if (error) {
      console.error('Error checking conversation limit:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error in conversation limit check:', error);
    return false;
  }
};