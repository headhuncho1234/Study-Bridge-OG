import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SavedScholarship {
  id: string;
  scholarship_id: string;
  saved_at: string;
  application_status: string;
  application_deadline: string | null;
  notes: string | null;
  priority: number;
  scholarship?: any;
}

export const useSavedScholarships = (userId: string | undefined) => {
  const [savedScholarships, setSavedScholarships] = useState<SavedScholarship[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadSavedScholarships = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_saved_scholarships')
        .select(`
          *,
          scholarship:scholarships(*)
        `)
        .eq('user_id', userId)
        .order('priority', { ascending: true })
        .order('application_deadline', { ascending: true });

      if (error) throw error;

      setSavedScholarships(data || []);
    } catch (error) {
      console.error('Error loading saved scholarships:', error);
      toast({
        title: "Error Loading Scholarships",
        description: "Unable to load your saved scholarships.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  const saveScholarship = useCallback(async (scholarshipId: string) => {
    if (!userId) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to save scholarships.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_saved_scholarships')
        .insert({
          user_id: userId,
          scholarship_id: scholarshipId,
        });

      if (error) throw error;

      toast({
        title: "Scholarship Saved",
        description: "Added to your saved scholarships.",
      });

      await loadSavedScholarships();
      return true;
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Already Saved",
          description: "This scholarship is already in your saved list.",
        });
      } else {
        toast({
          title: "Error Saving Scholarship",
          description: "Unable to save scholarship. Please try again.",
          variant: "destructive",
        });
      }
      return false;
    }
  }, [userId, loadSavedScholarships, toast]);

  const unsaveScholarship = useCallback(async (scholarshipId: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('user_saved_scholarships')
        .delete()
        .eq('user_id', userId)
        .eq('scholarship_id', scholarshipId);

      if (error) throw error;

      toast({
        title: "Scholarship Removed",
        description: "Removed from your saved scholarships.",
      });

      await loadSavedScholarships();
      return true;
    } catch (error) {
      toast({
        title: "Error Removing Scholarship",
        description: "Unable to remove scholarship. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [userId, loadSavedScholarships, toast]);

  const updateScholarshipStatus = useCallback(async (
    savedScholarshipId: string,
    status: string,
    notes?: string
  ) => {
    if (!userId) return false;

    try {
      const updates: any = { application_status: status };
      if (notes !== undefined) updates.notes = notes;

      const { error } = await supabase
        .from('user_saved_scholarships')
        .update(updates)
        .eq('id', savedScholarshipId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Scholarship marked as ${status}.`,
      });

      await loadSavedScholarships();
      return true;
    } catch (error) {
      toast({
        title: "Error Updating Status",
        description: "Unable to update scholarship status.",
        variant: "destructive",
      });
      return false;
    }
  }, [userId, loadSavedScholarships, toast]);

  const updatePriority = useCallback(async (
    savedScholarshipId: string,
    priority: number
  ) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('user_saved_scholarships')
        .update({ priority })
        .eq('id', savedScholarshipId)
        .eq('user_id', userId);

      if (error) throw error;

      await loadSavedScholarships();
      return true;
    } catch (error) {
      toast({
        title: "Error Updating Priority",
        description: "Unable to update priority.",
        variant: "destructive",
      });
      return false;
    }
  }, [userId, loadSavedScholarships, toast]);

  useEffect(() => {
    loadSavedScholarships();
  }, [loadSavedScholarships]);

  return {
    savedScholarships,
    isLoading,
    saveScholarship,
    unsaveScholarship,
    updateScholarshipStatus,
    updatePriority,
    refresh: loadSavedScholarships,
  };
};
