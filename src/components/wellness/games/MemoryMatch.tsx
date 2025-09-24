import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, RotateCcw } from "lucide-react";

interface MemoryMatchProps {
  onGameComplete: (won: boolean) => void;
  timeLimit?: number;
}

interface CardType {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryMatch = ({ onGameComplete, timeLimit = 300 }: MemoryMatchProps) => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [moves, setMoves] = useState(0);

  const emojis = ['🎯', '🎮', '🎨', '🎵', '🎭', '🎪', '🎳', '🎲'];

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeGame = () => {
    const gameEmojis = emojis.slice(0, 6); // Use 6 different emojis for 12 cards
    const cardPairs = [...gameEmojis, ...gameEmojis];
    const shuffledCards = shuffleArray(cardPairs);
    
    const newCards: CardType[] = shuffledCards.map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false
    }));
    
    setCards(newCards);
    setFlippedCards([]);
    setMoves(0);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (!gameStarted || gameStatus !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameStatus('lost');
          onGameComplete(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameStatus, onGameComplete]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstId, secondId] = flippedCards;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);
      
      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isMatched: true, isFlipped: true }
              : card
          ));
          setFlippedCards([]);
          
          // Check if game is won
          const newCards = cards.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isMatched: true, isFlipped: true }
              : card
          );
          
          if (newCards.every(card => card.isMatched)) {
            setGameStatus('won');
            onGameComplete(true);
          }
        }, 1000);
      } else {
        // No match, flip cards back
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
      
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards]);

  const handleCardClick = (cardId: number) => {
    if (!gameStarted) setGameStarted(true);
    if (gameStatus !== 'playing' || flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));
    
    setFlippedCards(prev => [...prev, cardId]);
  };

  const resetGame = () => {
    initializeGame();
    setGameStatus('playing');
    setTimeLeft(timeLimit);
    setGameStarted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Memory Match
        </CardTitle>
        <div className="flex items-center justify-between text-sm">
          <span>Time: {formatTime(timeLeft)}</span>
          <span>Moves: {moves}</span>
          <Button variant="ghost" size="sm" onClick={resetGame}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={(timeLeft / timeLimit) * 100} className="w-full" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {cards.map((card) => (
            <button
              key={card.id}
              className={`aspect-square border-2 rounded-md text-2xl font-bold transition-all duration-300 transform
                ${card.isFlipped || card.isMatched
                  ? 'bg-primary/10 border-primary scale-105' 
                  : 'bg-muted border-border hover:bg-muted/80 hover:scale-105'
                }
                ${card.isMatched ? 'opacity-60' : ''}
              `}
              onClick={() => handleCardClick(card.id)}
              disabled={gameStatus !== 'playing' || card.isFlipped || card.isMatched}
            >
              {card.isFlipped || card.isMatched ? card.emoji : '?'}
            </button>
          ))}
        </div>
        
        {gameStatus === 'won' && (
          <div className="text-center text-green-600 font-semibold">
            🎉 All Pairs Found! Earned 1 Wellness Coin!
          </div>
        )}
        {gameStatus === 'lost' && (
          <div className="text-center text-red-600 font-semibold">
            Time's up! Try again!
          </div>
        )}
        
        <div className="text-center text-sm text-muted-foreground mt-2">
          Find all matching pairs to win!
        </div>
      </CardContent>
    </Card>
  );
};

export default MemoryMatch;