import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, RotateCcw } from "lucide-react";

interface TicTacToeProps {
  onGameComplete: (won: boolean) => void;
  timeLimit?: number;
}

const TicTacToe = ({ onGameComplete, timeLimit = 300 }: TicTacToeProps) => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'draw'>('playing');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);

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

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const getAIMove = (squares: (string | null)[]) => {
    // Simple AI: try to win, then block, then take center, then random
    const availableMoves = squares.map((square, index) => square === null ? index : null).filter(val => val !== null);
    
    // Check if AI can win
    for (let move of availableMoves) {
      const testBoard = [...squares];
      testBoard[move] = 'O';
      if (checkWinner(testBoard) === 'O') return move;
    }
    
    // Check if AI needs to block player
    for (let move of availableMoves) {
      const testBoard = [...squares];
      testBoard[move] = 'X';
      if (checkWinner(testBoard) === 'X') return move;
    }
    
    // Take center if available
    if (squares[4] === null) return 4;
    
    // Random move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  useEffect(() => {
    if (!isPlayerTurn && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board);
        if (aiMove !== undefined) {
          const newBoard = [...board];
          newBoard[aiMove] = 'O';
          setBoard(newBoard);
          
          const winner = checkWinner(newBoard);
          if (winner === 'O') {
            setGameStatus('lost');
            onGameComplete(false);
          } else if (newBoard.every(square => square !== null)) {
            setGameStatus('draw');
            onGameComplete(false);
          } else {
            setIsPlayerTurn(true);
          }
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, board, gameStatus, onGameComplete]);

  const handleSquareClick = (index: number) => {
    if (!gameStarted) setGameStarted(true);
    if (board[index] || !isPlayerTurn || gameStatus !== 'playing') return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner === 'X') {
      setGameStatus('won');
      onGameComplete(true);
    } else if (newBoard.every(square => square !== null)) {
      setGameStatus('draw');
      onGameComplete(false);
    } else {
      setIsPlayerTurn(false);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
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
          Tic-Tac-Toe
        </CardTitle>
        <div className="flex items-center justify-between text-sm">
          <span>Time: {formatTime(timeLeft)}</span>
          <Button variant="ghost" size="sm" onClick={resetGame}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={(timeLeft / timeLimit) * 100} className="w-full" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {board.map((square, index) => (
            <button
              key={index}
              className="aspect-square bg-muted border-2 border-border rounded-md text-2xl font-bold hover:bg-muted/80 transition-colors"
              onClick={() => handleSquareClick(index)}
              disabled={!isPlayerTurn || gameStatus !== 'playing'}
            >
              {square}
            </button>
          ))}
        </div>
        
        {gameStatus === 'won' && (
          <div className="text-center text-green-600 font-semibold">
            🎉 You Won! Earned 1 Wellness Coin!
          </div>
        )}
        {gameStatus === 'lost' && (
          <div className="text-center text-red-600 font-semibold">
            Better luck next time!
          </div>
        )}
        {gameStatus === 'draw' && (
          <div className="text-center text-yellow-600 font-semibold">
            It's a draw! Try again!
          </div>
        )}
        
        <div className="text-center text-sm text-muted-foreground mt-2">
          {gameStatus === 'playing' && (isPlayerTurn ? "Your turn (X)" : "AI thinking... (O)")}
        </div>
      </CardContent>
    </Card>
  );
};

export default TicTacToe;