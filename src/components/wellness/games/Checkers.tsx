import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, RotateCcw } from "lucide-react";

interface CheckersProps {
  onGameComplete: (won: boolean) => void;
  timeLimit?: number;
}

type PieceType = 'player' | 'ai' | 'player-king' | 'ai-king' | null;
type BoardType = PieceType[][];

const Checkers = ({ onGameComplete, timeLimit = 300 }: CheckersProps) => {
  const [board, setBoard] = useState<BoardType>([]);
  const [selectedSquare, setSelectedSquare] = useState<{row: number, col: number} | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [possibleMoves, setPossibleMoves] = useState<{row: number, col: number}[]>([]);

  const initializeBoard = () => {
    const newBoard: BoardType = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Place AI pieces (top 3 rows)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = 'ai';
        }
      }
    }
    
    // Place player pieces (bottom 3 rows)
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = 'player';
        }
      }
    }
    
    setBoard(newBoard);
  };

  useEffect(() => {
    initializeBoard();
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

  const isValidSquare = (row: number, col: number) => {
    return row >= 0 && row < 8 && col >= 0 && col < 8 && (row + col) % 2 === 1;
  };

  const getPossibleMoves = (row: number, col: number, piece: PieceType): {row: number, col: number}[] => {
    const moves: {row: number, col: number}[] = [];
    if (!piece) return moves;

    const directions = [];
    if (piece === 'player' || piece === 'player-king') {
      directions.push([-1, -1], [-1, 1]); // Move up
    }
    if (piece === 'ai' || piece === 'ai-king') {
      directions.push([1, -1], [1, 1]); // Move down
    }
    if (piece === 'player-king' || piece === 'ai-king') {
      directions.push([1, -1], [1, 1], [-1, -1], [-1, 1]); // Kings move both ways
    }

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (isValidSquare(newRow, newCol) && !board[newRow][newCol]) {
        moves.push({row: newRow, col: newCol});
      }
      
      // Check for jumps
      const jumpRow = row + dr * 2;
      const jumpCol = col + dc * 2;
      
      if (isValidSquare(jumpRow, jumpCol) && 
          board[newRow][newCol] && 
          !board[jumpRow][jumpCol] &&
          ((piece.includes('player') && board[newRow][newCol]!.includes('ai')) ||
           (piece.includes('ai') && board[newRow][newCol]!.includes('player')))) {
        moves.push({row: jumpRow, col: jumpCol});
      }
    }

    return moves;
  };

  const makeMove = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[fromRow][fromCol];
    
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;
    
    // Check for jumps and remove captured pieces
    const rowDiff = Math.abs(toRow - fromRow);
    if (rowDiff === 2) {
      const midRow = (fromRow + toRow) / 2;
      const midCol = (fromCol + toCol) / 2;
      newBoard[midRow][midCol] = null;
    }
    
    // Promote to king
    if (piece === 'player' && toRow === 0) {
      newBoard[toRow][toCol] = 'player-king';
    }
    if (piece === 'ai' && toRow === 7) {
      newBoard[toRow][toCol] = 'ai-king';
    }
    
    return newBoard;
  };

  const getAIMove = (board: BoardType) => {
    const aiPieces: {row: number, col: number}[] = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col]?.includes('ai')) {
          aiPieces.push({row, col});
        }
      }
    }
    
    // Look for jumps first (captures)
    for (const piece of aiPieces) {
      const moves = getPossibleMoves(piece.row, piece.col, board[piece.row][piece.col]);
      for (const move of moves) {
        if (Math.abs(move.row - piece.row) === 2) {
          return {from: piece, to: move};
        }
      }
    }
    
    // Otherwise, make a regular move
    for (const piece of aiPieces) {
      const moves = getPossibleMoves(piece.row, piece.col, board[piece.row][piece.col]);
      if (moves.length > 0) {
        return {from: piece, to: moves[Math.floor(Math.random() * moves.length)]};
      }
    }
    
    return null;
  };

  useEffect(() => {
    if (!isPlayerTurn && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board);
        if (aiMove) {
          const newBoard = makeMove(aiMove.from.row, aiMove.from.col, aiMove.to.row, aiMove.to.col);
          setBoard(newBoard);
          
          // Check win condition
          const playerPieces = newBoard.flat().filter(piece => piece?.includes('player')).length;
          if (playerPieces === 0) {
            setGameStatus('lost');
            onGameComplete(false);
          } else {
            setIsPlayerTurn(true);
          }
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, board, gameStatus, onGameComplete]);

  const handleSquareClick = (row: number, col: number) => {
    if (!gameStarted) setGameStarted(true);
    if (!isPlayerTurn || gameStatus !== 'playing') return;

    if (selectedSquare) {
      // Try to move
      if (possibleMoves.some(move => move.row === row && move.col === col)) {
        const newBoard = makeMove(selectedSquare.row, selectedSquare.col, row, col);
        setBoard(newBoard);
        
        // Check win condition
        const aiPieces = newBoard.flat().filter(piece => piece?.includes('ai')).length;
        if (aiPieces === 0) {
          setGameStatus('won');
          onGameComplete(true);
        } else {
          setIsPlayerTurn(false);
        }
      }
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else {
      // Select piece
      const piece = board[row][col];
      if (piece?.includes('player')) {
        setSelectedSquare({row, col});
        setPossibleMoves(getPossibleMoves(row, col, piece));
      }
    }
  };

  const resetGame = () => {
    initializeBoard();
    setSelectedSquare(null);
    setPossibleMoves([]);
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

  const getPieceDisplay = (piece: PieceType) => {
    if (!piece) return '';
    if (piece === 'player') return '🔴';
    if (piece === 'ai') return '🔵';
    if (piece === 'player-king') return '👑';
    if (piece === 'ai-king') return '💎';
    return '';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Checkers
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
        <div className="grid grid-cols-8 gap-0 mb-4 border-2 border-border">
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`aspect-square text-lg font-bold border border-border/30 transition-colors
                  ${(rowIndex + colIndex) % 2 === 0 
                    ? 'bg-amber-100 dark:bg-amber-900' 
                    : 'bg-amber-800 dark:bg-amber-950'
                  }
                  ${selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex 
                    ? 'ring-2 ring-primary' 
                    : ''
                  }
                  ${possibleMoves.some(move => move.row === rowIndex && move.col === colIndex) 
                    ? 'bg-green-200 dark:bg-green-800' 
                    : ''
                  }
                  hover:brightness-110
                `}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                disabled={!isPlayerTurn || gameStatus !== 'playing'}
              >
                {getPieceDisplay(piece)}
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
        
        <div className="text-center text-sm text-muted-foreground mt-2">
          {gameStatus === 'playing' && (isPlayerTurn ? "Your turn (🔴)" : "AI thinking... (🔵)")}
        </div>
      </CardContent>
    </Card>
  );
};

export default Checkers;
