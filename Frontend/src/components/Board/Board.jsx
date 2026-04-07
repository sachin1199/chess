import React from "react";
import { Square } from "../Square/Square";

export default function Board({
  board = [],
  selected = null,
  handleClick = () => {},
  lastMove,
  validMoves,
}) {
  return (
    <div className="board-container  d-flex justify-content-center align-items-center ">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 70px)",
          boxShadow: "0 0 25px rgba(0,0,0,0.6)",
          border: "4px solid #333",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((col, colIndex) => (
            <Square
              key={`${rowIndex}-${colIndex}`}
              piece={col}
              row={rowIndex}
              col={colIndex}
              handleClick={handleClick}
              validMoves={validMoves}
              selected={selected}
              lastMove={lastMove}
            />
          )),
        )}
      </div>
    </div>
  );
}
