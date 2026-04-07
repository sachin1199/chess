import {
  getPawnMoves,
  getRookMoves,
  getBishoopMoves,
  getQueenMovement,
  getKnightMovement,
  getKingMoves,
} from "../features/logic/moveGenerator.js";

import {
  isKingInCheck,
  filterLegalMoves,
  isCheckmate,
} from "../features/logic/checkUtils.js";

// helper
const createBoard = () =>
  Array(8)
    .fill("")
    .map(() => Array(8).fill(""));

/* ======================
     PAWN
  ====================== */
describe("Pawn Moves", () => {
  test("initial double move", () => {
    const board = createBoard();
    board[6][3] = "P";

    const moves = getPawnMoves(board, 6, 3, "P");

    expect(moves).toEqual([
      { row: 5, col: 3 },
      { row: 4, col: 3 },
    ]);
  });

  test("blocked forward", () => {
    const board = createBoard();
    board[6][3] = "P";
    board[5][3] = "p";

    const moves = getPawnMoves(board, 6, 3, "P");

    expect(moves).toEqual([]);
  });

  test("capture diagonal", () => {
    const board = createBoard();
    board[6][3] = "P";
    board[5][2] = "p";

    const moves = getPawnMoves(board, 6, 3, "P");

    expect(moves).toContainEqual({ row: 5, col: 2 });
  });

  test("cannot capture same color", () => {
    const board = createBoard();
    board[6][3] = "P";
    board[5][2] = "P";

    const moves = getPawnMoves(board, 6, 3, "P");

    expect(moves).not.toContainEqual({ row: 5, col: 2 });
  });
});

/* ======================
     ROOK
  ====================== */
describe("Rook Moves", () => {
  test("moves in all directions", () => {
    const board = createBoard();
    board[4][4] = "R";

    const moves = getRookMoves(board, 4, 4, "R");

    expect(moves.length).toBeGreaterThan(0);
  });

  test("blocked by same color", () => {
    const board = createBoard();
    board[4][4] = "R";
    board[4][6] = "R";

    const moves = getRookMoves(board, 4, 4, "R");

    expect(moves).not.toContainEqual({ row: 4, col: 6 });
  });

  test("stops after capture", () => {
    const board = createBoard();
    board[4][4] = "R";
    board[4][6] = "p";

    const moves = getRookMoves(board, 4, 4, "R");

    expect(moves).toContainEqual({ row: 4, col: 6 });
    expect(moves).not.toContainEqual({ row: 4, col: 7 });
  });
});

/* ======================
     BISHOP
  ====================== */
describe("Bishop Moves", () => {
  test("moves diagonally", () => {
    const board = createBoard();
    board[4][4] = "B";

    const moves = getBishoopMoves(board, 4, 4, "B");

    expect(moves.length).toBeGreaterThan(0);
  });
});

/* ======================
     KNIGHT
  ====================== */
describe("Knight Moves", () => {
  test("L-shape movement", () => {
    const board = createBoard();
    board[4][4] = "N";

    const moves = getKnightMovement(board, 4, 4, "N");

    expect(moves.length).toBe(8);
  });
});

/* ======================
     QUEEN
  ====================== */
describe("Queen Moves", () => {
  test("combines rook + bishop", () => {
    const board = createBoard();
    board[4][4] = "Q";

    const moves = getQueenMovement(board, 4, 4, "Q");

    expect(moves.length).toBeGreaterThan(0);
  });
});

/* ======================
     KING
  ====================== */
describe("King Moves", () => {
  test("moves one step all directions", () => {
    const board = createBoard();
    board[4][4] = "K";

    const moves = getKingMoves(board, 4, 4, "K");

    expect(moves.length).toBeLessThanOrEqual(8);
  });
});

/* ======================
     CHECK DETECTION
  ====================== */
describe("Check Detection", () => {
  test("king in check by rook", () => {
    const board = createBoard();
    board[7][4] = "K";
    board[0][4] = "r";

    const result = isKingInCheck(board, true);

    expect(result).toBe(true);
  });

  test("king safe", () => {
    const board = createBoard();
    board[7][4] = "K";

    const result = isKingInCheck(board, true);

    expect(result).toBe(false);
  });
});

/* ======================
     FILTER LEGAL MOVES
  ====================== */
describe("Filter Legal Moves", () => {
  test("removes move exposing king", () => {
    const board = createBoard();
    board[7][4] = "K";
    board[6][4] = "R";
    board[0][4] = "r";

    const moves = getRookMoves(board, 6, 4, "R");

    const filtered = filterLegalMoves(
      board,
      moves,
      { row: 6, col: 4 },
      "R",
      true,
    );

    expect(filtered.length).toBeLessThan(moves.length);
  });
});

/* ======================
     CHECKMATE
  ====================== */
describe("Checkmate Detection", () => {
  test("rook checkmate in corner", () => {
    const board = createBoard();

    board[0][0] = "k"; // black king at corner
    board[2][0] = "R"; // white rook covers entire row 2 (blocks row escape)
    board[0][2] = "R"; // white rook covers entire row 0 (blocks col escape)
    board[2][2] = "K"; // white king — not needed but safe support

    const result = isCheckmate(board, false);
    expect(result).toBe(true);
  });

  test("not checkmate if king can escape", () => {
    const board = createBoard();

    board[0][0] = "k";
    board[0][1] = "R";

    const result = isCheckmate(board, false);

    expect(result).toBe(false);
  });

  test("check but block possible", () => {
    const board = createBoard();

    board[0][4] = "k";
    board[7][4] = "R";
    board[3][4] = "p";

    const result = isCheckmate(board, false);

    expect(result).toBe(false);
  });

  test("not in check → not checkmate", () => {
    const board = createBoard();

    board[0][4] = "k";

    const result = isCheckmate(board, false);

    expect(result).toBe(false);
  });
});
