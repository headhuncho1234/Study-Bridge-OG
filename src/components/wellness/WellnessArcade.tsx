import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Trophy, Coins, Zap, ArrowLeft } from "lucide-react";
import { useWellnessData } from "@/hooks/useWellnessData";
import TicTacToe from "./games/TicTacToe";
import ConnectFour from "./games/ConnectFour";
import MiniSudoku from "./games/MiniSudoku";
import MemoryMatch from "./games/MemoryMatch";
import Checkers from "./games/Checkers";
import confetti from 'canvas-confetti';

const WellnessArcade = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const { wellnessData, addCoins, updateArcadeStreak, addConsecutiveGame } = useWellnessData();

  const games = [
    {
      id: 'tic-tac-toe',
      name: 'Tic-Tac-Toe',
      description: 'Classic 3x3 strategy game vs AI',
      component: TicTacToe,
      icon: '⭕'
    },
    {
      id: 'connect-four',
      name: 'Connect Four',
      description: 'Get four in a row before the AI',
      component: ConnectFour,
      icon: '🔴'
    },
    {
      id: 'mini-sudoku',
      name: 'Mini Sudoku',
      description: '4x4 number puzzle challenge',
      component: MiniSudoku,
      icon: '🔢'
    },
    {
      id: 'memory-match',
      name: 'Memory Match',
      description: 'Find all matching pairs',
      component: MemoryMatch,
      icon: '🎯'
    },
    {
      id: 'checkers',
      name: 'Checkers',
      description: 'Classic board game vs AI',
      component: Checkers,
      icon: '🔴'
    }
  ];

  const handleGameComplete = (won: boolean) => {
    if (won) {
      // Base reward
      addCoins(1);
      
      // Track consecutive games
      const newConsecutiveCount = addConsecutiveGame();
      
      // Bonus for 3 consecutive games
      if (newConsecutiveCount >= 3 && newConsecutiveCount % 3 === 0) {
        addCoins(1);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      // Update daily streak
      updateArcadeStreak();
      
      // Celebration confetti
      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.7 }
      });
    }
    
    // Auto-return to game selection after 3 seconds
    setTimeout(() => {
      setSelectedGame(null);
    }, 3000);
  };

  if (selectedGame) {
    const game = games.find(g => g.id === selectedGame);
    if (!game) return null;

    const GameComponent = game.component;
    
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setSelectedGame(null)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Arcade
        </Button>
        
        <GameComponent onGameComplete={handleGameComplete} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Arcade Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Gamepad2 className="h-8 w-8 text-purple-500" />
            Wellness Arcade
          </CardTitle>
          <p className="text-muted-foreground">
            Play quick mini-games to earn Wellness Coins and maintain your daily streak!
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">{wellnessData.coins} Coins</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">{wellnessData.arcadeStreak || 0} Day Streak</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Trophy className="h-5 w-5 text-green-500" />
              <span className="font-semibold">{wellnessData.consecutiveGames || 0}/3 Consecutive</span>
            </div>
          </div>
          
          {wellnessData.consecutiveGames >= 3 && (
            <div className="mt-4 text-center">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                🎉 Next win = +2 Coins (Bonus Ready!)
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game Rules */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Game Rules & Rewards
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>🎯 Complete any game under 5 minutes = 1 Wellness Coin</p>
            <p>🔥 Win 3 games in a row = +1 Bonus Coin</p>
            <p>⭐ Play daily to maintain your streak and earn badges</p>
            <p>🏆 Redeem coins in the Rewards Shop for themes and upgrades</p>
          </div>
        </CardContent>
      </Card>

      {/* Game Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <Card key={game.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {game.icon}
              </div>
              <h3 className="font-semibold mb-2">{game.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {game.description}
              </p>
              <Button 
                className="w-full"
                onClick={() => setSelectedGame(game.id)}
              >
                Play Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily Streaks & Badges */}
      {wellnessData.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Your Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {wellnessData.badges.map((badge) => {
                const badgeInfo = {
                  'zen-warrior': { name: 'Zen Warrior', icon: '⚔️', desc: '3-day streak' },
                  'mind-master': { name: 'Mind Master', icon: '🧠', desc: '7-day streak' },
                  'focus-champion': { name: 'Focus Champion', icon: '👑', desc: '14-day streak' }
                }[badge];
                
                return badgeInfo ? (
                  <Badge key={badge} variant="secondary" className="flex items-center gap-1">
                    <span>{badgeInfo.icon}</span>
                    <span>{badgeInfo.name}</span>
                  </Badge>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WellnessArcade;