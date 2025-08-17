import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ProcessingStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export const useKnowledgeProcessing = (knowledgeBaseId?: string) => {
  const [stats, setStats] = useState<ProcessingStats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const fetchStats = async () => {
    if (!knowledgeBaseId) return;

    try {
      const { data: files, error } = await supabase
        .from('knowledge_files')
        .select('processing_status')
        .eq('knowledge_base_id', knowledgeBaseId);

      if (error) throw error;

      const newStats = files.reduce((acc, file) => {
        acc.total++;
        acc[file.processing_status as keyof ProcessingStats]++;
        return acc;
      }, {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0
      });

      setStats(newStats);
      setIsProcessing(newStats.pending > 0 || newStats.processing > 0);
    } catch (error) {
      console.error('Error fetching processing stats:', error);
    }
  };

  const startProcessing = async () => {
    if (!knowledgeBaseId) return;

    try {
      const { error } = await supabase.functions.invoke('process-knowledge', {
        body: { 
          knowledgeBaseId,
          batchProcess: true 
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to start processing",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Processing Started",
          description: "Knowledge base processing has begun",
        });
        fetchStats();
      }
    } catch (error) {
      console.error('Error starting processing:', error);
      toast({
        title: "Error",
        description: "Failed to start processing",
        variant: "destructive",
      });
    }
  };

  const retryFailed = async () => {
    if (!knowledgeBaseId) return;

    try {
      // Reset failed files to pending
      const { error: resetError } = await supabase
        .from('knowledge_files')
        .update({ processing_status: 'pending' })
        .eq('knowledge_base_id', knowledgeBaseId)
        .eq('processing_status', 'failed');

      if (resetError) throw resetError;

      // Start processing
      await startProcessing();
    } catch (error) {
      console.error('Error retrying failed files:', error);
      toast({
        title: "Error",
        description: "Failed to retry processing",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStats();
  }, [knowledgeBaseId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!knowledgeBaseId) return;

    const channel = supabase
      .channel(`knowledge-processing-${knowledgeBaseId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'knowledge_files',
          filter: `knowledge_base_id=eq.${knowledgeBaseId}`
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [knowledgeBaseId]);

  return {
    stats,
    isProcessing,
    startProcessing,
    retryFailed,
    refreshStats: fetchStats
  };
};