import React from "react";
import { useChess } from "../features/hooks/useChess";
import Board from "../components/Board/Board";
import { pieceMap } from "../features/utils/pieceMap";
import "../index.css";

function App() {
  const {
    board,
    selected,
    validMoves,
    turn,
    isCheck,
    gameOver,
    reset,
    lastMove,
    capturedWhite,
    capturedBlack,
    history,
    handleClick,
  } = useChess();

  return (
    <div className="app-container">
      {/* ✅ LEFT COLUMN (GROUPED) */}
      <div className="left-panel">
        {/* MOVES */}
        <div className="side-panel">
          <h5>
            Moves <span className="arrow">↓</span>
          </h5>
          <ul className="history">
            {history.map((move, i) => (
              <li key={i}>{move}</li>
            ))}
          </ul>
        </div>

        {/* CAPTURED BY WHITE (shows black pieces) */}
        <div className="side-panel">
          <h5>Captured by White</h5>
          <div className="captured-list">
            {capturedBlack.map((p, i) => (
              <span key={i} className="piece">
                {pieceMap[p]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ CENTER */}
      <div className="game-container">
        <h1 className="title">♟ Chess</h1>
        <h4 className="turn">Turn: {turn}</h4>

        {isCheck && <div className="check">CHECK</div>}
        {gameOver && <div className="game-over">{gameOver}</div>}

        <Board
          board={board}
          selected={selected}
          validMoves={validMoves}
          handleClick={handleClick}
          lastMove={lastMove}
        />

        <button onClick={reset} className="restart-btn">
          Restart Game
        </button>
      </div>

      {/* ✅ RIGHT COLUMN */}
      <div className="right-panel">
        <div className="side-panel">
          <h5>Captured by Black</h5>
          <div className="captured-list">
            {capturedWhite.map((p, i) => (
              <span key={i} className="piece">
                {pieceMap[p]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
