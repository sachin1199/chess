export const getPawnMoves = (board, row, col, piece) => {
  const moves = [];

  const direction = piece === "P" ? -1 : 1;
  const startRow = piece === "P" ? 6 : 1;

  // forwward direction
  if (board[row + direction]?.[col] === "") {
    moves.push({ row: row + direction, col });
    if (row === startRow && board[row + 2 * direction]?.[col] === "") {
      moves.push({ row: row + 2 * direction, col });
    }
  }

  // capure left diagonal
  const left = board[row + direction]?.[col - 1];
  if (
    left &&
    left != "" && //  check if diagonal square contains opponent piece
    ((piece == "P" && left == left.toLowerCase()) || //if the clicked place is upper case P and left has lowercase value
      (piece == "p" && left == left.toUpperCase())) // or the clicked box is white and is in small letters but left has value in uppercase
  ) {
    // only than its a valid move
    moves.push({ row: row + direction, col: col - 1 });
  }

  // capture right diagonal
  const right = board[row + direction]?.[col + 1];
  if (
    right &&
    right &&
    ((piece == "P" && right == right.toLowerCase()) ||
      (piece == "p" && right == right.toUpperCase()))
  ) {
    moves.push({ row: row + direction, col: col + 1 });
  }
  return moves;
};

// _______________________________________________________________________________
// rook moves
export const getRookMoves = (board, row, col, piece) => {
  const moves = [];
  // direction of the rook
  const direction = [
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 0],
  ];
  // getting the direction
  for (let [dr, dc] of direction) {
    let r = row + dr; // for row direction first index of diretion
    let c = col + dc; // for column direction 2nd index of that same array
    // are we inside the board ? or not
    while (board[r]?.[c] !== undefined) {
      const target = board[r][c]; // to check the current stage clicked

      if (target === "") {
        // if the boxes in board are empty 1 at time
        moves.push({ row: r, col: c }); // move till there is availble
      } else {
        const isWhite = piece === piece.toUpperCase();
        const isEnemy =
          (isWhite && target === target.toLowerCase()) ||
          (!isWhite && target === target.toUpperCase());
        if (isEnemy) {
          moves.push({ row: r, col: c });
        }
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return moves;
};
//_______________Bishoop__________________________
export const getBishoopMoves = (board, row, col, piece) => {
  const moves = [];
  const direction = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  for (let [dr, dc] of direction) {
    let r = row + dr;
    let c = col + dc;
    while (board[r]?.[c] !== undefined) {
      let target = board[r][c];
      if (target === "") {
        moves.push({ row: r, col: c });
      } else {
        const isWhite = piece == piece.toUpperCase();
        const isEnemy =
          (isWhite && target === target.toLowerCase()) ||
          (!isWhite && target === target.toUpperCase());
        if (isEnemy) {
          moves.push({ row: r, col: c });
        }
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return moves;
};
//___queen
export const getQueenMovement = (board, row, col, piece) => {
  const rookMoves = getRookMoves(board, row, col, piece);
  const bishoopMoves = getBishoopMoves(board, row, col, piece);
  return [...rookMoves, ...bishoopMoves];
};
// _____________________________________________-

// knight movement

export const getKnightMovement = (board, row, col, piece) => {
  const moves = [];
  const direction = [
    //   bottom left directions
    [-2, -1],
    [-2, 1],
    [-1, 2],
    [-1, -2],
    //   top directions
    [1, 2],
    [1, -2],
    [2, 1],
    [2, -1],
  ];
  for (let [dr, dc] of direction) {
    let r = row + dr;
    let c = col + dc;
    const target = board[r]?.[c];
    if (target === undefined) continue;
    if (target === "") {
      moves.push({ row: r, col: c });
    } else {
      const isWhite = piece === piece.toUpperCase();
      const isEnemy =
        (isWhite && target === target.toLowerCase()) ||
        (!isWhite && target === target.toUpperCase());
      if (isEnemy) {
        moves.push({ row: r, col: c });
      }
    }
  }
  return moves;
};

// king moves
export const getKingMoves = (board, row, col, piece) => {
  const moves = [];
  const direction = [
    [-1, 0],
    [0, -1],
    [0, 1],
    [1, 0],
    [1, -1],
    [1, 1],
    [-1, -1],
    [-1, 1],
  ];
  for (let [dr, dc] of direction) {
    let r = row + dr;
    let c = col + dc;
    let target = board[r]?.[c];
    if (target === undefined) continue;
    if (target === "") {
      moves.push({ row: r, col: c });
    } else {
      const isWhite = piece === piece.toUpperCase();
      const isEnemy =
        (isWhite && target === target.toLowerCase()) ||
        (!isWhite && target === target.toUpperCase());
      if (isEnemy) {
        moves.push({ row: r, col: c });
      }
    }
  }
  return moves;
};

export const moveMap = {
  P: getPawnMoves,
  p: getPawnMoves,
  R: getRookMoves,
  r: getRookMoves,
  B: getBishoopMoves,
  b: getBishoopMoves,
  Q: getQueenMovement,
  q: getQueenMovement,
  N: getKnightMovement,
  n: getKnightMovement,
  K: getKingMoves,
  k: getKingMoves,
};
