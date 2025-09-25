import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, RotateCcw, HelpCircle } from "lucide-react";

interface MiniSudokuProps {
  onGameComplete: (won: boolean, completionTimeMs?: number) => void;
  timeLimit?: number;
}

const MiniSudoku = ({ onGameComplete, timeLimit = 300 }: MiniSudokuProps) => {
  const [puzzle, setPuzzle] = useState<(number | null)[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [userBoard, setUserBoard] = useState<(number | null)[][]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [invalidMove, setInvalidMove] = useState(false);

  // Generate a simple 4x4 Sudoku puzzle
  const generatePuzzle = () => {
    // Pre-made solutions for 4x4 Sudoku
    const solutions = [
      [
        [1, 2, 3, 4],
        [3, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 1]
      ],
      [
        [2, 1, 4, 3],
        [4, 3, 2, 1],
        [1, 2, 3, 4],
        [3, 4, 1, 2]
      ],
      [
        [3, 4, 1, 2],
        [1, 2, 3, 4],
        [4, 3, 2, 1],
        [2, 1, 4, 3]
      ]
    ];

    const randomSolution = solutions[Math.floor(Math.random() * solutions.length)];
    setSolution(randomSolution);

    // Create puzzle by removing some numbers
    const newPuzzle = randomSolution.map(row => [...row]);
    const cellsToRemove = 8; // Remove 8 numbers out of 16
    
    for (let i = 0; i < cellsToRemove; i++) {
      let row, col;
      do {
        row = Math.floor(Math.random() * 4);
        col = Math.floor(Math.random() * 4);
      } while (newPuzzle[row][col] === null);
      
      newPuzzle[row][col] = null;
    }

    setPuzzle(newPuzzle);
    setUserBoard(newPuzzle.map(row => [...row]));
  };

  useEffect(() => {
    generatePuzzle();
  }, []);

  useEffect(() => {
    if (!gameStarted || gameStatus !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          const completionTime = Date.now() - gameStartTime;
          setGameStatus('lost');
          onGameComplete(false, completionTime);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameStatus, onGameComplete]);

  const checkSolution = (board: (number | null)[][]) => {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (board[row][col] !== solution[row][col]) {
          return false;
        }
      }
    }
    return true;
  };

  const isValidMove = (board: (number | null)[][], row: number, col: number, num: number) => {
    // Check row
    for (let c = 0; c < 4; c++) {
      if (c !== col && board[row][c] === num) return false;
    }
    
    // Check column
    for (let r = 0; r < 4; r++) {
      if (r !== row && board[r][col] === num) return false;
    }
    
    // Check 2x2 box
    const boxRow = Math.floor(row / 2) * 2;
    const boxCol = Math.floor(col / 2) * 2;
    for (let r = boxRow; r < boxRow + 2; r++) {
      for (let c = boxCol; c < boxCol + 2; c++) {
        if ((r !== row || c !== col) && board[r][c] === num) return false;
      }
    }
    
    return true;
  };

  const handleCellSelect = (row: number, col: number) => {
    if (!gameStarted) {
      setGameStarted(true);
      setGameStartTime(Date.now());
    }
    if (gameStatus !== 'playing' || puzzle[row][col] !== null) return;
    
    setSelectedCell({ row, col });
    setInvalidMove(false);
  };

  const handleNumberPlace = (num: number) => {
    if (!selectedCell || gameStatus !== 'playing') {
      setInvalidMove(true);
      setTimeout(() => setInvalidMove(false), 1000);
      return;
    }

    const { row, col } = selectedCell;
    if (puzzle[row][col] !== null) return;

    const newBoard = userBoard.map(r => [...r]);
    
    if (newBoard[row][col] === num) {
      newBoard[row][col] = null;
    } else if (isValidMove(newBoard, row, col, num)) {
      newBoard[row][col] = num;
      setSelectedCell(null); // Clear selection after successful placement
    } else {
      setInvalidMove(true);
      setTimeout(() => setInvalidMove(false), 1000);
      return;
    }

    setUserBoard(newBoard);

    if (checkSolution(newBoard)) {
      const completionTime = Date.now() - gameStartTime;
      setGameStatus('won');
      onGameComplete(true, completionTime);
    }
  };

  const resetGame = () => {
    generatePuzzle();
    setGameStatus('playing');
    setTimeLeft(timeLimit);
    setGameStarted(false);
    setGameStartTime(Date.now());
    setSelectedCell(null);
    setInvalidMove(false);
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
          Mini Sudoku 4x4
        </CardTitle>
        <div className="flex items-center justify-between text-sm">
          <span>Time: {formatTime(timeLeft)}</span>
          <Button variant="ghost" size="sm" onClick={resetGame}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={(timeLeft / timeLimit) * 100} className="w-full" />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <HelpCircle className="h-3 w-3" />
          Click cell to select, then click number 1-4
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-1 mb-4">
          {userBoard.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellSelect(rowIndex, colIndex)}
                className={`aspect-square border-2 rounded-md flex items-center justify-center text-lg font-bold transition-colors
                  ${puzzle[rowIndex][colIndex] !== null 
                    ? 'bg-muted border-muted-foreground text-foreground cursor-not-allowed' 
                    : `bg-background border-border hover:bg-muted/50 cursor-pointer
                       ${selectedCell?.row === rowIndex && selectedCell?.col === colIndex 
                         ? 'border-primary bg-primary/10' 
                         : ''}`
                  }
                  ${(rowIndex === 1 || rowIndex === 2) && (colIndex === 1 || colIndex === 2) ? 'border-primary' : ''}
                `}
              >
                {cell}
              </div>
            ))
          )}
        </div>

        {/* Number selector */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[1, 2, 3, 4].map(num => (
            <Button
              key={num}
              variant={invalidMove ? "destructive" : "outline"}
              className={`aspect-square p-0 transition-colors ${
                selectedCell ? 'hover:bg-primary hover:text-primary-foreground' : ''
              }`}
              onClick={() => handleNumberPlace(num)}
              disabled={gameStatus !== 'playing'}
            >
              {num}
            </Button>
          ))}
        </div>
        
        {invalidMove && (
          <div className="text-center text-destructive text-sm mb-2">
            {!selectedCell ? 'Select a cell first!' : 'Invalid move - number already exists in row, column, or box!'}
          </div>
        )}
        
        {!selectedCell && gameStatus === 'playing' && (
          <div className="text-center text-muted-foreground text-sm mb-2">
            Click on an empty cell to select it
          </div>
        )}
        
        {gameStatus === 'won' && (
          <div className="text-center text-green-600 font-semibold">
            🎉 Puzzle Solved! Earned 1 Wellness Coin!
          </div>
        )}
        {gameStatus === 'lost' && (
          <div className="text-center text-red-600 font-semibold">
            Time's up! Try again!
          </div>
        )}
        
        <div className="text-center text-sm text-muted-foreground mt-2">
          Fill each row, column, and 2x2 box with numbers 1-4
        </div>
      </CardContent>
    </Card>
  );
};

export default MiniSudoku;