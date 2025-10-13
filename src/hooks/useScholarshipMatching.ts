import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MatchFilters {
  minAmount?: number;
  maxAmount?: number;
  deadlineAfter?: string;
  scholarshipTypes?: string[];
}

interface ScholarshipMatch {
  id: string;
  title: string;
  provider: string;
  amount: string;
  deadline: string;
  match_score: number;
  match_reasons: string[];
  [key: string]: any;
}

export const useScholarshipMatching = () => {
  const [matches, setMatches] = useState<ScholarshipMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const findMatches = useCallback(async (userId: string, filters?: MatchFilters) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('match-scholarships', {
        body: { userId, filters }
      });

      if (error) throw error;

      setMatches(data.matches || []);
      return data.matches || [];
    } catch (error) {
      console.error('Error finding matches:', error);
      toast({
        title: "Error Finding Matches",
        description: "Unable to find scholarship matches. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    matches,
    isLoading,
    findMatches,
  };
};
