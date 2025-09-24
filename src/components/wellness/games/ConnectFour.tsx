import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, RotateCcw } from "lucide-react";

interface ConnectFourProps {
  onGameComplete: (won: boolean) => void;
  timeLimit?: number;
}

const ConnectFour = ({ onGameComplete, timeLimit = 300 }: ConnectFourProps) => {
  const [board, setBoard] = useState<(string | null)[][]>(
    Array(6).fill(null).map(() => Array(7).fill(null))
  );
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

  const checkWinner = (board: (string | null)[][]) => {
    // Check horizontal
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        if (board[row][col] && 
            board[row][col] === board[row][col + 1] &&
            board[row][col] === board[row][col + 2] &&
            board[row][col] === board[row][col + 3]) {
          return board[row][col];
        }
      }
    }

    // Check vertical
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 3; row++) {
        if (board[row][col] && 
            board[row][col] === board[row + 1][col] &&
            board[row][col] === board[row + 2][col] &&
            board[row][col] === board[row + 3][col]) {
          return board[row][col];
        }
      }
    }

    // Check diagonal (top-left to bottom-right)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        if (board[row][col] && 
            board[row][col] === board[row + 1][col + 1] &&
            board[row][col] === board[row + 2][col + 2] &&
            board[row][col] === board[row + 3][col + 3]) {
          return board[row][col];
        }
      }
    }

    // Check diagonal (top-right to bottom-left)
    for (let row = 0; row < 3; row++) {
      for (let col = 3; col < 7; col++) {
        if (board[row][col] && 
            board[row][col] === board[row + 1][col - 1] &&
            board[row][col] === board[row + 2][col - 2] &&
            board[row][col] === board[row + 3][col - 3]) {
          return board[row][col];
        }
      }
    }

    return null;
  };

  const dropPiece = (col: number, piece: string) => {
    for (let row = 5; row >= 0; row--) {
      if (!board[row][col]) {
        return { row, col };
      }
    }
    return null;
  };

  const getAIMove = (board: (string | null)[][]) => {
    // Simple AI: try to win, then block, then center, then random
    for (let col = 0; col < 7; col++) {
      if (dropPiece(col, 'O')) {
        const testBoard = board.map(row => [...row]);
        const pos = dropPiece(col, 'O');
        if (pos) {
          testBoard[pos.row][pos.col] = 'O';
          if (checkWinner(testBoard) === 'O') return col;
        }
      }
    }

    // Block player
    for (let col = 0; col < 7; col++) {
      if (dropPiece(col, 'X')) {
        const testBoard = board.map(row => [...row]);
        const pos = dropPiece(col, 'X');
        if (pos) {
          testBoard[pos.row][pos.col] = 'X';
          if (checkWinner(testBoard) === 'X') return col;
        }
      }
    }

    // Prefer center
    if (dropPiece(3, 'O')) return 3;

    // Random valid move
    const validCols = [];
    for (let col = 0; col < 7; col++) {
      if (dropPiece(col, 'O')) validCols.push(col);
    }
    return validCols[Math.floor(Math.random() * validCols.length)];
  };

  useEffect(() => {
    if (!isPlayerTurn && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        const aiCol = getAIMove(board);
        if (aiCol !== undefined) {
          const pos = dropPiece(aiCol, 'O');
          if (pos) {
            const newBoard = board.map(row => [...row]);
            newBoard[pos.row][pos.col] = 'O';
            setBoard(newBoard);
            
            const winner = checkWinner(newBoard);
            if (winner === 'O') {
              setGameStatus('lost');
              onGameComplete(false);
            } else if (newBoard.every(row => row.every(cell => cell !== null))) {
              setGameStatus('draw');
              onGameComplete(false);
            } else {
              setIsPlayerTurn(true);
            }
          }
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, board, gameStatus, onGameComplete]);

  const handleColumnClick = (col: number) => {
    if (!gameStarted) setGameStarted(true);
    if (!isPlayerTurn || gameStatus !== 'playing') return;

    const pos = dropPiece(col, 'X');
    if (!pos) return;

    const newBoard = board.map(row => [...row]);
    newBoard[pos.row][pos.col] = 'X';
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner === 'X') {
      setGameStatus('won');
      onGameComplete(true);
    } else if (newBoard.every(row => row.every(cell => cell !== null))) {
      setGameStatus('draw');
      onGameComplete(false);
    } else {
      setIsPlayerTurn(false);
    }
  };

  const resetGame = () => {
    setBoard(Array(6).fill(null).map(() => Array(7).fill(null)));
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
          Connect Four
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
        <div className="grid grid-cols-7 gap-1 mb-4">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className="aspect-square bg-blue-100 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-700 rounded-full text-lg font-bold hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center justify-center"
                onClick={() => handleColumnClick(colIndex)}
                disabled={!isPlayerTurn || gameStatus !== 'playing'}
              >
                {cell && (
                  <div className={`w-6 h-6 rounded-full ${cell === 'X' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                )}
              </button>
            ))
          )}
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
          {gameStatus === 'playing' && (isPlayerTurn ? "Your turn (Red)" : "AI thinking... (Yellow)")}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectFour;