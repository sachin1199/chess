import { moveMap } from "./moveGenerator";

// finding the position of the king by scanning the whole board
export const findKing = (board, isWhite) => {
  const king = isWhite ? "K" : "k";
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === king) {
        return { row: r, col: c };
      }
    }
  }
};

// getting all opponents moves
export const getAllOpponentsMoves = (board, isWhiteTurn) => {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      let isWhitePiece = piece === piece.toUpperCase();
      if (isWhiteTurn === isWhitePiece) continue;
      let generator = moveMap[piece];
      if (!generator) continue;
      const pieceMoves = generator(board, r, c, piece);
      moves.push(...pieceMoves);
    }
  }
  return moves;
};
//  can someone checkmate
export const isKingInCheck = (board, isWhiteTurn) => {
  const kingPoistion = findKing(board, isWhiteTurn);
  if (!kingPoistion) return false;
  const opponentMoves = getAllOpponentsMoves(board, isWhiteTurn);
  return opponentMoves.some(
    (m) => m.row === kingPoistion.row && m.col === kingPoistion.col,
  );
};
// filter only legal moves that helps to prevent check
export const filterLegalMoves = (
  board,
  moves,
  selected,
  piece,
  isWhiteTurn,
) => {
  const legalMoves = [];
  for (let move of moves) {
    const newBoard = board.map((r) => [...r]);
    newBoard[move.row][move.col] = newBoard[selected.row][selected.col];
    newBoard[selected.row][selected.col] = "";
    const isCheck = isKingInCheck(newBoard, isWhiteTurn);
    if (!isCheck) {
      legalMoves.push(move);
    }
  }
  return legalMoves;
};
// checking after checkmate is there any move availble in the board for the player
export const isCheckmate = (board, isWhiteturn) => {
  const inCheckOrNot = isKingInCheck(board, isWhiteturn);
  if (!inCheckOrNot) return false;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      let piece = board[r][c];
      if (piece === "") continue;
      const isWhite = piece === piece.toUpperCase();
      if (isWhite !== isWhiteturn) continue;
      const generator = moveMap[piece];
      if (!generator) continue;
      // generating the moves for selected piece
      let moves = generator(board, r, c, piece);

      moves = filterLegalMoves(
        board,
        moves,
        { row: r, col: c },
        piece,
        isWhiteturn,
      );
      if (moves.length > 0) return false;
    }
  }
  return true;
};
