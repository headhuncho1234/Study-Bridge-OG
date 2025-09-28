import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface WellnessData {
  coins: number;
  streak: number;
  lastSessionDate: string | null;
  badges: string[];
  ownedItems: string[];
  sessionsCompleted: number;
  arcadeStreak: number;
  lastArcadeDate: string | null;
  consecutiveGames: number;
  lastGameTime: number | null;
}

export interface WellnessStreak {
  current: number;
  best: number;
  lastDate: string | null;
}

export const useWellnessData = () => {
  const { user } = useAuth();
  const [wellnessData, setWellnessData] = useState<WellnessData>({
    coins: 0,
    streak: 0,
    lastSessionDate: null,
    badges: [],
    ownedItems: [],
    sessionsCompleted: 0,
    arcadeStreak: 0,
    lastArcadeDate: null,
    consecutiveGames: 0,
    lastGameTime: null
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load wellness data from Supabase profile
  useEffect(() => {
    const loadWellnessData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('coins, questionnaire_results')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          // Parse wellness data from questionnaire_results JSON
          const questionnaire_results = profile.questionnaire_results as any;
          const savedWellnessData = questionnaire_results?.wellness || {};
          
          setWellnessData(prev => ({
            ...prev,
            coins: profile.coins || 0,
            streak: savedWellnessData.streak || 0,
            lastSessionDate: savedWellnessData.lastSessionDate || null,
            badges: savedWellnessData.badges || [],
            ownedItems: savedWellnessData.ownedItems || [],
            sessionsCompleted: savedWellnessData.sessionsCompleted || 0,
            arcadeStreak: savedWellnessData.arcadeStreak || 0,
            lastArcadeDate: savedWellnessData.lastArcadeDate || null,
            consecutiveGames: savedWellnessData.consecutiveGames || 0,
            lastGameTime: savedWellnessData.lastGameTime || null
          }));
        }
      } catch (error) {
        console.error('Error loading wellness data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWellnessData();
  }, [user]);

  // Helper function to save wellness data to database
  const saveWellnessData = async (updatedData: Partial<WellnessData>) => {
    if (!user) return;

    try {
      // Get current questionnaire_results
      const { data: profile } = await supabase
        .from('profiles')
        .select('questionnaire_results')
        .eq('user_id', user.id)
        .single();

      const currentResults = (profile?.questionnaire_results as any) || {};
      const currentWellness = currentResults.wellness || {};

      // Merge with updated wellness data (excluding coins which has its own column)
      const { coins, ...wellnessDataWithoutCoins } = updatedData;
      const updatedWellnessData = {
        ...currentWellness,
        ...wellnessDataWithoutCoins
      };

      const updatedResults = {
        ...currentResults,
        wellness: updatedWellnessData
      };

      await supabase
        .from('profiles')
        .update({ questionnaire_results: updatedResults })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error saving wellness data:', error);
    }
  };
  const addCoins = async (gameType: string, completionTimeMs: number, won: boolean = true) => {
    if (!user) return { awarded: false, reason: 'Not authenticated' };

    try {
      const { data, error } = await supabase.functions.invoke('award-coin', {
        body: { gameType, completionTimeMs, won }
      });

      if (error) throw error;

      if (data.awarded) {
        setWellnessData(prev => ({
          ...prev,
          coins: data.newTotal || (prev.coins + data.coinsAwarded)
        }));
      }

      return data;
    } catch (error) {
      console.error('Error awarding coins:', error);
      return { awarded: false, reason: 'Server error' };
    }
  };

  const spendCoins = async (amount: number): Promise<boolean> => {
    if (wellnessData.coins >= amount) {
      const newWellnessData = {
        ...wellnessData,
        coins: wellnessData.coins - amount
      };
      
      setWellnessData(newWellnessData);
      
      // Update coins in database
      if (user) {
        try {
          await supabase
            .from('profiles')
            .update({ coins: newWellnessData.coins })
            .eq('user_id', user.id);
        } catch (error) {
          console.error('Error updating coins:', error);
        }
      }
      
      return true;
    }
    return false;
  };

  const updateStreak = async () => {
    const today = new Date().toDateString();
    const lastDate = wellnessData.lastSessionDate;
    
    let newStreak = wellnessData.streak;
    
    if (!lastDate) {
      // First session ever
      newStreak = 1;
    } else {
      const lastSessionDate = new Date(lastDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        newStreak = wellnessData.streak + 1;
      } else if (daysDiff === 0) {
        // Same day, keep streak
        newStreak = wellnessData.streak;
      } else {
        // Streak broken
        newStreak = 1;
      }
    }
    
    // Check for streak badges
    const newBadges = [...wellnessData.badges];
    if (newStreak >= 3 && !newBadges.includes('zen-warrior')) {
      newBadges.push('zen-warrior');
    }
    if (newStreak >= 7 && !newBadges.includes('mind-master')) {
      newBadges.push('mind-master');
    }
    if (newStreak >= 14 && !newBadges.includes('focus-champion')) {
      newBadges.push('focus-champion');
    }
    
    const updatedData = {
      ...wellnessData,
      streak: newStreak,
      lastSessionDate: today,
      badges: newBadges,
      sessionsCompleted: wellnessData.sessionsCompleted + 1
    };
    
    setWellnessData(updatedData);
    await saveWellnessData(updatedData);
    
    return newStreak;
  };

  const purchaseItem = async (itemId: string, cost: number): Promise<boolean> => {
    if (await spendCoins(cost)) {
      const updatedData = {
        ...wellnessData,
        ownedItems: [...wellnessData.ownedItems, itemId]
      };
      
      setWellnessData(updatedData);
      await saveWellnessData(updatedData);
      return true;
    }
    return false;
  };

  const updateArcadeStreak = async () => {
    const today = new Date().toDateString();
    const lastDate = wellnessData.lastArcadeDate;
    
    let newStreak = wellnessData.arcadeStreak;
    
    if (!lastDate) {
      newStreak = 1;
    } else {
      const lastArcadeDate = new Date(lastDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastArcadeDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        newStreak = wellnessData.arcadeStreak + 1;
      } else if (daysDiff === 0) {
        newStreak = wellnessData.arcadeStreak;
      } else {
        newStreak = 1;
      }
    }
    
    // Check for streak badges
    const newBadges = [...wellnessData.badges];
    if (newStreak >= 3 && !newBadges.includes('zen-warrior')) {
      newBadges.push('zen-warrior');
    }
    if (newStreak >= 7 && !newBadges.includes('mind-master')) {
      newBadges.push('mind-master');
    }
    if (newStreak >= 14 && !newBadges.includes('focus-champion')) {
      newBadges.push('focus-champion');
    }
    
    const updatedData = {
      ...wellnessData,
      arcadeStreak: newStreak,
      lastArcadeDate: today,
      badges: newBadges
    };
    
    setWellnessData(updatedData);
    await saveWellnessData(updatedData);
    
    return newStreak;
  };

  const addConsecutiveGame = async (won: boolean = true): Promise<number> => {
    let newConsecutiveCount: number;
    
    if (won) {
      // Increment consecutive count on win
      newConsecutiveCount = (wellnessData.consecutiveGames || 0) + 1;
    } else {
      // Reset consecutive count on loss
      newConsecutiveCount = 0;
    }
    
    const updatedData = {
      ...wellnessData,
      consecutiveGames: newConsecutiveCount,
      lastGameTime: Date.now()
    };
    
    setWellnessData(updatedData);
    await saveWellnessData(updatedData);
    
    return newConsecutiveCount;
  };

  const getBadgeInfo = (badgeId: string) => {
    const badgeMap: Record<string, { name: string; description: string; icon: string }> = {
      'zen-warrior': {
        name: 'Zen Warrior',
        description: '3-day arcade streak',
        icon: '⚔️'
      },
      'mind-master': {
        name: 'Mind Master', 
        description: '7-day arcade streak',
        icon: '🧠'
      },
      'focus-champion': {
        name: 'Focus Champion',
        description: '14-day arcade streak', 
        icon: '👑'
      }
    };
    return badgeMap[badgeId];
  };

  return {
    wellnessData,
    addCoins,
    spendCoins,
    updateStreak,
    updateArcadeStreak,
    addConsecutiveGame,
    purchaseItem,
    getBadgeInfo,
    isLoading
  };
};
