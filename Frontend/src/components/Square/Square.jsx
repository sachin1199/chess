import React from "react";
import { pieceMap } from "../../features/utils/pieceMap";
export const Square = ({
  row,
  col,
  piece,
  selected,
  validMoves,
  handleClick,
  lastMove,
}) => {
  const isSelected = selected && selected.row === row && selected.col === col;

  // checking do we have any valid move
  const isValid = validMoves?.some(
    (moves) => moves.row == row && moves.col == col,
  );
  //
  const isLight = (row + col) % 2 == 0;
  //
  const isLastMove =
    lastMove &&
    ((lastMove.from.row === row && lastMove.from.col === col) ||
      (lastMove.to.row === row && lastMove.to.col === col));

  return (
    <div
      onClick={() => handleClick(row, col)}
      className="square d-flex justify-content-center align-items-center border"
      style={{
        position: "relative", // ✅ IMPORTANT (for dot positioning)
        height: "70px",
        width: "70px",
        fontSize: "28px",
        cursor: piece ? "pointer" : "default",

        backgroundColor: isSelected
          ? "rgba(246, 246, 105, 0.6)" // soft yellow
          : isLastMove
            ? "rgba(186, 202, 68, 0.5)" // soft green highlight
            : isLight
              ? "#eeeed2" // light square
              : "#769656", // dark square
      }}
    >
      <span
        style={{
          color:
            piece === piece.toUpperCase()
              ? isLight
                ? "#444"
                : "#ffffff"
              : "#111",
          opacity: 0.95,
          textShadow: "0 1px 2px rgba(0,0,0,0.6)",
        }}
      >
        {pieceMap[piece]}
      </span>
      {isValid && (
        <div
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.25)",
            position: "absolute",
          }}
        />
      )}
    </div>
  );
};
