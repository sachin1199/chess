import { useState } from "react";
import { initialBoard } from "../constants/initialBoard";
import { moveMap } from "../logic/moveGenerator";
import { isKingInCheck } from "../logic/checkUtils";
import { filterLegalMoves } from "../logic/checkUtils";
import { isCheckmate } from "../logic/checkUtils";
import { pieceMap } from "../utils/pieceMap";

export const useChess = () => {
  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState(null);
  const [turn, setTurn] = useState("White"); // whoose turn is it
  const [gameOver, setGameOver] = useState(null);

  // check valid moves it is set from generator function that will
  // return the moves and than setValidMoves() those moves
  const [validMoves, setValidMoves] = useState([]);
  // last move
  const [lastMove, setLastMove] = useState(null);
  // capured pieces
  const [capturedWhite, setCapturedWhite] = useState([]);
  const [capturedBlack, setCapturedBlack] = useState([]);

  // history
  const [history, setHistory] = useState([]);
  // restarting the game
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
  };

  //
  const isCheck = isKingInCheck(board, turn === "White");
  //
  const handleClick = (row, col) => {
    if (gameOver) return;
    const piece = board[row][col];
    // selected part is white or not
    const isWhitePiece = piece !== "" && piece === piece.toUpperCase();
    // black or not
    const isBlackPiece = piece !== "" && piece === piece.toLowerCase();

    // empty
    if (!selected && piece === "") {
      return;
    }

    // nothing selected yet so select the clicked part and go back
    if (!selected && piece !== "") {
      if (
        (turn === "White" && !isWhitePiece) ||
        (turn === "Black" && !isBlackPiece)
      ) {
        return;
      }
      setSelected({ row, col });
      const generator = moveMap[piece]; // will get the function from the lookup table of moveGenerator file
      // if there is any move give it
      if (generator) {
        let moves = generator(board, row, col, piece);
        moves = filterLegalMoves(
          board,
          moves,
          { row, col },
          piece,
          turn === "White",
        );
        setValidMoves(moves);
      } else {
        setValidMoves([]);
      }
      return;
    }
    // same place selected
    if (selected.row === row && selected.col === col) {
      setSelected(null);
      setValidMoves([]);
      return;
    }

    // if the moves are availble or not
    const isValid = validMoves.some((m) => m.row == row && m.col == col);
    // if moves are not availble than dont do anything
    if (!isValid) {
      setSelected(null);
      setValidMoves([]);
      return;
    }
    // now comes the 2nd check already selected than open this block
    if (selected) {
      const movingPiece = board[selected.row][selected.col]; // the peace that is captured
      const newboard = board.map((r) => [...r]);
      const capturedPiece = newboard[row][col];
      if (capturedPiece !== "") {
        if (capturedPiece === capturedPiece.toUpperCase()) {
          setCapturedWhite((prev) => [...prev, capturedPiece]);
        } else {
          setCapturedBlack((prev) => [...prev, capturedPiece]);
        }
      }
      // saving the moves
      setHistory((prev) => [
        ...prev,
        `${movingPiece}[${pieceMap[movingPiece]}] (${selected.row},${selected.col}) → (${row},${col})`,
      ]);
      newboard[row][col] = newboard[selected.row][selected.col];
      newboard[selected.row][selected.col] = "";
      // seting the last move
      setLastMove({
        from: { row: selected.row, col: selected.col },
        to: { row, col },
      });
      // checking the next turn
      const nextTurn = turn === "White" ? "Black" : "White";
      // checking wheter the next player is in check after current move or not
      const isCheck = isKingInCheck(newboard, nextTurn === "White");

      // cheking for if the game is over-- checkmate or not
      const isMate = isCheckmate(newboard, nextTurn === "White");
      if (isMate) {
        setGameOver(`${nextTurn} is in Checkmate!!!!`);
      }

      setBoard(newboard);
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
  };
};
