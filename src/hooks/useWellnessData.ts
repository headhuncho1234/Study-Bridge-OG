import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface WellnessData {
  coins: number;
  streak: number;
  lastSessionDate: string | null;
  badges: string[];
  ownedItems: string[];
  sessionsCompleted: number;
}

export interface WellnessStreak {
  current: number;
  best: number;
  lastDate: string | null;
}

export const useWellnessData = () => {
  const [wellnessData, setWellnessData] = useLocalStorage<WellnessData>('wellnessData', {
    coins: 0,
    streak: 0,
    lastSessionDate: null,
    badges: [],
    ownedItems: [],
    sessionsCompleted: 0
  });

  const addCoins = (amount: number) => {
    setWellnessData(prev => ({
      ...prev,
      coins: prev.coins + amount
    }));
  };

  const spendCoins = (amount: number): boolean => {
    if (wellnessData.coins >= amount) {
      setWellnessData(prev => ({
        ...prev,
        coins: prev.coins - amount
      }));
      return true;
    }
    return false;
  };

  const updateStreak = () => {
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
    
    setWellnessData(prev => ({
      ...prev,
      streak: newStreak,
      lastSessionDate: today,
      badges: newBadges,
      sessionsCompleted: prev.sessionsCompleted + 1
    }));
    
    return newStreak;
  };

  const purchaseItem = (itemId: string, cost: number): boolean => {
    if (spendCoins(cost)) {
      setWellnessData(prev => ({
        ...prev,
        ownedItems: [...prev.ownedItems, itemId]
      }));
      return true;
    }
    return false;
  };

  const getBadgeInfo = (badgeId: string) => {
    const badgeMap: Record<string, { name: string; description: string; icon: string }> = {
      'zen-warrior': {
        name: 'Zen Warrior',
        description: '3-day focus streak',
        icon: '⚔️'
      },
      'mind-master': {
        name: 'Mind Master', 
        description: '7-day focus streak',
        icon: '🧠'
      },
      'focus-champion': {
        name: 'Focus Champion',
        description: '14-day focus streak', 
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
    purchaseItem,
    getBadgeInfo
  };
};
