import { useState } from "react";
import { initialBoard } from "../constants/initialBoard";
import { moveMap } from "../logic/moveGenerator";
import { isKingInCheck } from "../logic/checkUtils";
import { filterLegalMoves } from "../logic/checkUtils";
import { isCheckmate } from "../logic/checkUtils";
import { pieceMap } from "../utils/pieceMap";

// engine: "standard" → Python minimax  |  "aggressive" → C++ alpha-beta
export const useChess = (difficulty, aiEnabled, engine = "standard") => {
  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState(null);
  const [turn, setTurn] = useState("White");
  const [gameOver, setGameOver] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [capturedWhite, setCapturedWhite] = useState([]);
  const [capturedBlack, setCapturedBlack] = useState([]);
  const [history, setHistory] = useState([]);
  const [aiThinking, setAiThinking] = useState(false);

  const reset = () => {
    setBoard(initialBoard);
    setSelected(null);
    setTurn("White");
    setValidMoves([]);
    setGameOver(null);
    setLastMove(null);
    setCapturedBlack([]);
    setCapturedWhite([]);
    setHistory([]);
    setAiThinking(false);
  };

  const getAiMove = async (board, turn, difficulty) => {
    const endpoint =
      engine === "aggressive"
        ? "http://127.0.0.1:8000/ai-move-aggressive"
        : "http://127.0.0.1:8000/ai-move";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board, turn, difficulty }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("AI error:", err);
    }
  };

  const isCheck = isKingInCheck(board, turn === "White");

  const handleClick = (row, col) => {
    if (gameOver) return;
    if (aiThinking) return;

    const piece = board[row][col];
    const isWhitePiece = piece !== "" && piece === piece.toUpperCase();
    const isBlackPiece = piece !== "" && piece === piece.toLowerCase();

    if (!selected && piece === "") return;

    if (!selected && piece !== "") {
      if (
        (turn === "White" && !isWhitePiece) ||
        (turn === "Black" && !isBlackPiece)
      ) return;

      setSelected({ row, col });
      const generator = moveMap[piece];
      if (generator) {
        let moves = generator(board, row, col, piece);
        moves = filterLegalMoves(board, moves, { row, col }, piece, turn === "White");
        setValidMoves(moves);
      } else {
        setValidMoves([]);
      }
      return;
    }

    if (selected.row === row && selected.col === col) {
      setSelected(null);
      setValidMoves([]);
      return;
    }

    const isValid = validMoves.some((m) => m.row == row && m.col == col);
    if (!isValid) {
      setSelected(null);
      setValidMoves([]);
      return;
    }

    if (selected) {
      const movingPiece = board[selected.row][selected.col];
      const newboard = board.map((r) => [...r]);
      const capturedPiece = newboard[row][col];

      if (capturedPiece !== "") {
        if (capturedPiece === capturedPiece.toUpperCase()) {
          setCapturedWhite((prev) => [...prev, capturedPiece]);
        } else {
          setCapturedBlack((prev) => [...prev, capturedPiece]);
        }
      }

      setHistory((prev) => [
        ...prev,
        `${movingPiece}[${pieceMap[movingPiece]}] (${selected.row},${selected.col}) → (${row},${col})`,
      ]);

      newboard[row][col] = newboard[selected.row][selected.col];
      newboard[selected.row][selected.col] = "";

      setLastMove({ from: { row: selected.row, col: selected.col }, to: { row, col } });

      const nextTurn = turn === "White" ? "Black" : "White";
      const isMate = isCheckmate(newboard, nextTurn === "White");
      if (isMate) setGameOver(`${nextTurn} is in Checkmate!!!!`);

      setBoard(newboard);

      const flat = newboard.flat();
      if (!flat.includes("k")) setGameOver("White wins");
      if (!flat.includes("K")) setGameOver("Black wins");

      const isGameFinished =
        isMate ||
        !newboard.flat().includes("k") ||
        !newboard.flat().includes("K");

      // Save to Node backend when AI game ends
      if (isGameFinished) {
        const winner = isMate ? `${nextTurn} is in Checkmate!`
          : !newboard.flat().includes("k") ? "White wins" : "Black wins";
        fetch("http://localhost:3001/game/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ board: newboard, history, capturedWhite, capturedBlack, winner, difficulty, engine }),
        }).catch(() => {});
      }

      if (aiEnabled && nextTurn === "Black" && !isGameFinished) {
        setAiThinking(true);
        setTimeout(async () => {
          const aiMove = await getAiMove(newboard, "Black", difficulty);
          setAiThinking(false);

          if (!aiMove) return;

          const [fromRow, fromCol] = aiMove.from;
          const [toRow, toCol] = aiMove.to;

          setBoard((prevBoard) => {
            const updatedBoard = prevBoard.map((r) => [...r]);
            const aiPiece = updatedBoard[fromRow][fromCol];
            if (!aiPiece) return prevBoard;

            const aiCaptured = updatedBoard[toRow][toCol];
            if (aiCaptured !== "") {
              if (aiCaptured === aiCaptured.toUpperCase()) {
                setCapturedWhite((prev) => [...prev, aiCaptured]);
              } else {
                setCapturedBlack((prev) => [...prev, aiCaptured]);
              }
            }

            updatedBoard[toRow][toCol] = aiPiece;
            updatedBoard[fromRow][fromCol] = "";

            setHistory((prev) => [
              ...prev,
              `AI:${aiPiece}[${pieceMap[aiPiece]}] (${fromRow},${fromCol}) → (${toRow},${toCol})`,
            ]);

            const flat = updatedBoard.flat();
            if (!flat.includes("k")) setGameOver("White wins");
            if (!flat.includes("K")) setGameOver("Black wins");

            const aiMate = isCheckmate(updatedBoard, true);
            if (aiMate) setGameOver("White is in Checkmate!!!!");

            return updatedBoard;
          });

          setLastMove({ from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } });
          setTurn("White");
        }, 400);
      }

      setSelected(null);
      setValidMoves([]);
      setTurn(nextTurn);
    }
  };

  return {
    board,
    selected,
    validMoves,
    turn,
    handleClick,
    isCheck,
    lastMove,
    capturedWhite,
    capturedBlack,
    history,
    gameOver,
    reset,
    aiThinking,
  };
};
