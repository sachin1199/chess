import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { initialBoard } from "../constants/initialBoard";
import { moveMap } from "../logic/moveGenerator";
import {
  isKingInCheck,
  filterLegalMoves,
  isCheckmate,
} from "../logic/checkUtils";
import { pieceMap } from "../utils/pieceMap";

const SERVER = "https://chess-iopg.onrender.com";
export const useMultiplayer = () => {
  const socketRef = useRef(null);

  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [turn, setTurn] = useState("White");
  const [lastMove, setLastMove] = useState(null);
  const [capturedWhite, setCapturedWhite] = useState([]);
  const [capturedBlack, setCapturedBlack] = useState([]);
  const [history, setHistory] = useState([]);
  const [gameOver, setGameOver] = useState(null);

  // Multiplayer state
  const [roomId, setRoomId] = useState(null);
  const [myColor, setMyColor] = useState(null);      // "White" | "Black"
  const [status, setStatus] = useState("idle");     // idle | waiting | playing | over
  const [statusMsg, setStatusMsg] = useState("");


  const resetLocal = () => {
    setBoard(initialBoard);
    setSelected(null);
    setValidMoves([]);
    setTurn("White");
    setLastMove(null);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setHistory([]);
    setGameOver(null);
  };

  // 
  useEffect(() => {
    const socket = io(SERVER);
    socketRef.current = socket;

    socket.on("room_created", ({ roomId, color }) => {
      setRoomId(roomId);
      setMyColor(color);
      setStatus("waiting");
      setStatusMsg(
        `Room: ${roomId} — Share this code with your opponent. Waiting...`,
      );
    });

    socket.on("room_joined", ({ roomId, color }) => {
      setRoomId(roomId);
      setMyColor(color);
    });

    socket.on("game_start", () => {
      setStatus("playing");
      setStatusMsg("");
      resetLocal();
    });

    socket.on(
      "opponent_move",
      ({
        board,
        move,
        turn,
        history,
        capturedWhite,
        capturedBlack,
        gameOver,
      }) => {
        setBoard(board);
        setTurn(turn);
        setHistory(history);
        setCapturedWhite(capturedWhite);
        setCapturedBlack(capturedBlack);
        setLastMove(move);
        if (gameOver) {
          setGameOver(gameOver);
          setStatus("over");
        }
      },
    );

    socket.on("opponent_left", () => {
      setStatusMsg("Opponent disconnected.");
      setStatus("over");
      setGameOver("Opponent left the game");
    });

    socket.on("game_over", ({ reason }) => {
      setGameOver(reason);
      setStatus("over");
    });

    socket.on("error", ({ message }) => {
      setStatusMsg(`Error: ${message}`);
    });

    return () => socket.disconnect();
  }, []);

  

  const createRoom = () => socketRef.current?.emit("create_room");

  const joinRoom = (code) =>
    socketRef.current?.emit("join_room", { roomId: code.trim().toUpperCase() });

  const resign = () => {
    if (roomId) socketRef.current?.emit("resign", { roomId });
    setStatus("over");
    setGameOver("Resigned");
  };

  const isCheck = isKingInCheck(board, turn === "White");

  const handleClick = (row, col) => {
    if (gameOver || status !== "playing") return;
    if (turn !== myColor) return; // not your turn

    const piece = board[row][col];
    const isWhitePiece = piece !== "" && piece === piece.toUpperCase();
    const isBlackPiece = piece !== "" && piece === piece.toLowerCase();

    if (!selected && piece === "") return;

    if (!selected && piece !== "") {
      if (
        (turn === "White" && !isWhitePiece) ||
        (turn === "Black" && !isBlackPiece)
      )
        return;
      setSelected({ row, col });
      const generator = moveMap[piece];
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

    if (selected.row === row && selected.col === col) {
      setSelected(null);
      setValidMoves([]);
      return;
    }

    const isValid = validMoves.some((m) => m.row === row && m.col === col);
    if (!isValid) {
      setSelected(null);
      setValidMoves([]);
      return;
    }

    // Apply move
    const movingPiece = board[selected.row][selected.col];
    const newBoard = board.map((r) => [...r]);
    const capturedPiece = newBoard[row][col];

    const newCapturedWhite = [...capturedWhite];
    const newCapturedBlack = [...capturedBlack];

    if (capturedPiece !== "") {
      if (capturedPiece === capturedPiece.toUpperCase())
        newCapturedWhite.push(capturedPiece);
      else newCapturedBlack.push(capturedPiece);
    }

    newBoard[row][col] = newBoard[selected.row][selected.col];
    newBoard[selected.row][selected.col] = "";

    const moveRecord = {
      from: { row: selected.row, col: selected.col },
      to: { row, col },
    };
    const newHistory = [
      ...history,
      `${myColor[0]}:${movingPiece}[${pieceMap[movingPiece]}] (${selected.row},${selected.col})→(${row},${col})`,
    ];

    const nextTurn = turn === "White" ? "Black" : "White";
    const isMate = isCheckmate(newBoard, nextTurn === "White");
    const flat = newBoard.flat();
    let over = null;
    if (isMate) over = `${nextTurn} is in Checkmate!`;
    else if (!flat.includes("k")) over = "White wins";
    else if (!flat.includes("K")) over = "Black wins";

    setBoard(newBoard);
    setTurn(nextTurn);
    setHistory(newHistory);
    setCapturedWhite(newCapturedWhite);
    setCapturedBlack(newCapturedBlack);
    setLastMove(moveRecord);
    setSelected(null);
    setValidMoves([]);
    if (over) {
      setGameOver(over);
      setStatus("over");
    }


    socketRef.current?.emit("make_move", {
      roomId,
      board: newBoard,
      move: moveRecord,
      turn,
      history: newHistory,
      capturedWhite: newCapturedWhite,
      capturedBlack: newCapturedBlack,
      gameOver: over,
    });
  };

  return {
    board,
    selected,
    validMoves,
    turn,
    isCheck,
    lastMove,
    capturedWhite,
    capturedBlack,
    history,
    gameOver,
    roomId,
    myColor,
    status,
    statusMsg,
    createRoom,
    joinRoom,
    resign,
    handleClick,
  };
};
