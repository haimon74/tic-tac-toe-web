import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styles from '../styles/TicTacToe.module.css';

type Player = 'X' | 'O' | null;
type Board = Player[];
type WinningLine = number[] | null;

const TicTacToe: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [winner, setWinner] = useState<Player>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winningLine, setWinningLine] = useState<WinningLine>(null);

  // Memoize the winning lines as they never change
  const winningLines = useMemo(() => [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontal
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // vertical
    [0, 4, 8], [2, 4, 6] // diagonal
  ], []);

  const checkWinner = useCallback((squares: Board): { winner: Player; line: WinningLine } => {
    for (const line of winningLines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line };
      }
    }
    return { winner: null, line: null };
  }, [winningLines]);

  const isBoardFull = useCallback((squares: Board): boolean => {
    return squares.every(square => square !== null);
  }, []);

  const getComputerMove = useCallback((currentBoard: Board): number => {
    const emptySquares = currentBoard
      .map((square, index) => square === null ? index : null)
      .filter((index): index is number => index !== null);

    if (emptySquares.length === 0) return -1;

    // Try to win
    for (const index of emptySquares) {
      const testBoard = [...currentBoard];
      testBoard[index] = 'O';
      if (checkWinner(testBoard).winner === 'O') {
        return index;
      }
    }

    // Block player from winning
    for (const index of emptySquares) {
      const testBoard = [...currentBoard];
      testBoard[index] = 'X';
      if (checkWinner(testBoard).winner === 'X') {
        return index;
      }
    }

    // Take center if available
    if (currentBoard[4] === null) {
      return 4;
    }

    // Take a random empty square
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
  }, [checkWinner]);

  const handleClick = useCallback((index: number) => {
    if (board[index] || winner || isGameOver) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const { winner: gameWinner, line } = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setWinningLine(line);
      setIsGameOver(true);
      return;
    }

    if (isBoardFull(newBoard)) {
      setIsGameOver(true);
      return;
    }

    // Computer's turn
    setTimeout(() => {
      const computerMove = getComputerMove(newBoard);
      if (computerMove !== -1) {
        const updatedBoard = [...newBoard];
        updatedBoard[computerMove] = 'O';
        setBoard(updatedBoard);

        const { winner: computerWinner, line } = checkWinner(updatedBoard);
        if (computerWinner) {
          setWinner(computerWinner);
          setWinningLine(line);
          setIsGameOver(true);
          return;
        }

        if (isBoardFull(updatedBoard)) {
          setIsGameOver(true);
        }
      }
    }, 500);
  }, [board, winner, isGameOver, checkWinner, isBoardFull, getComputerMove]);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsGameOver(false);
    setWinningLine(null);
  }, []);

  const renderSquare = useCallback((index: number) => {
    const value = board[index];
    const isWinningCell = winningLine?.includes(index);
    return (
      <button
        className={`${styles.square} ${value ? styles[`square${value}`] : ''} ${isWinningCell ? styles.squareWinning : ''}`}
        onClick={() => handleClick(index)}
      >
        {value}
      </button>
    );
  }, [board, winningLine, handleClick]);

  const getStatus = useCallback(() => {
    if (winner) {
      return `Winner: ${winner}`;
    }
    if (isGameOver) {
      return 'Game Over - Draw!';
    }
    return 'Your turn (X)';
  }, [winner, isGameOver]);

  // Memoize the board rows to prevent unnecessary re-renders
  const boardRows = useMemo(() => [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8]
  ], []);

  return (
    <div className={styles.game}>
      <h1 className={styles.title}>Tic Tac Toe</h1>
      <div className={styles.status}>{getStatus()}</div>
      <div className={styles.board}>
        {boardRows.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.boardRow}>
            {row.map(index => renderSquare(index))}
          </div>
        ))}
      </div>
      <button className={styles.resetButton} onClick={resetGame}>
        New Game
      </button>
    </div>
  );
};

export default TicTacToe; 