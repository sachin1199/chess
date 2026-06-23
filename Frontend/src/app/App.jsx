import React, { useState } from "react";
import { useChess } from "../features/hooks/useChess";
import { useMultiplayer } from "../features/hooks/useMultiplayer";
import Board from "../components/Board/Board";
import { pieceMap } from "../features/utils/pieceMap";
import "../index.css";

// ─── MODE SELECTOR ───────────────────────────────────────────
function ModeSelector({ onSelect }) {
  return (
    <div className="mode-screen">
      <h1 className="title">♟ Chess</h1>
      <p style={{ color: "#aaa", marginBottom: "32px" }}>Choose your game mode</p>
      <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
        <button className="mode-btn" onClick={() => onSelect("ai")}>
          🤖<br /><strong>vs AI</strong><br />
          <span>Play against computer</span>
        </button>
        <button className="mode-btn" onClick={() => onSelect("multi")}>
          👥<br /><strong>Multiplayer</strong><br />
          <span>Play with a friend online</span>
        </button>
      </div>
    </div>
  );
}

// ─── AI GAME ─────────────────────────────────────────────────
function AIGame({ onBack }) {
  const [difficulty, setDifficulty] = useState("easy");
  const [aiEnabled, setAiEnabled]   = useState(true);
  const [engine, setEngine]         = useState("standard");

  const {
    board, selected, validMoves, turn, isCheck,
    gameOver, reset, lastMove, capturedWhite,
    capturedBlack, history, handleClick, aiThinking,
  } = useChess(difficulty, aiEnabled, engine);

  return (
    <div className="app-container">
      {/* LEFT */}
      <div className="left-panel">
        <button onClick={onBack} className="back-btn">← Back</button>
        <div className="side-panel">
          <h5>Moves <span className="arrow">↓</span></h5>
          <ul className="history">
            {history.map((move, i) => (
              <li key={i} style={{ color: move.startsWith("AI:") ? "#e74c3c" : "#ecf0f1" }}>{move}</li>
            ))}
          </ul>
        </div>
        <div className="side-panel">
          <h5>Captured by White</h5>
          <div className="captured-list">
            {capturedBlack.map((p, i) => <span key={i} className="piece">{pieceMap[p]}</span>)}
          </div>
        </div>
      </div>

      {/* CENTER */}
      <div className="game-container">
        <h1 className="title">♟ Chess — vs AI</h1>
        <h4 className="turn">Turn: {turn}</h4>

        <div style={{ marginBottom: "10px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <button onClick={() => setAiEnabled(!aiEnabled)}>
            {aiEnabled ? "AI ON" : "AI OFF"}
          </button>

          <div style={{ display: "flex", gap: "4px" }}>
            <button onClick={() => setEngine("standard")}
              style={{ background: engine === "standard" ? "#769656" : "#555", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>
              🤖 Standard
            </button>
            <button onClick={() => setEngine("aggressive")}
              style={{ background: engine === "aggressive" ? "#c0392b" : "#555", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>
              ⚔️ Aggressive (C++)
            </button>
          </div>
        </div>

        <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "6px" }}>
          {engine === "aggressive" ? "⚔️ C++ Alpha-Beta Engine" : "🤖 Python Minimax Engine"}
        </div>

        {aiThinking && <div style={{ color: "#f39c12", fontSize: "13px", marginBottom: "4px" }}>⏳ AI is thinking...</div>}
        {isCheck   && <div className="check">CHECK</div>}
        {gameOver  && <div className="game-over">{gameOver}</div>}

        <Board board={board} selected={selected} validMoves={validMoves} handleClick={handleClick} lastMove={lastMove} />
        <button onClick={reset} className="restart-btn">Restart Game</button>
      </div>

      {/* RIGHT */}
      <div className="right-panel">
        <div className="side-panel">
          <h5>Captured by Black</h5>
          <div className="captured-list">
            {capturedWhite.map((p, i) => <span key={i} className="piece">{pieceMap[p]}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MULTIPLAYER LOBBY ───────────────────────────────────────
function MultiLobby({ mp, onBack }) {
  const [joinCode, setJoinCode] = useState("");

  return (
    <div className="mode-screen">
      <h1 className="title">♟ Multiplayer</h1>

      {mp.statusMsg && (
        <div className="status-msg">{mp.statusMsg}</div>
      )}

      {mp.status === "idle" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
          <button className="mode-btn wide" onClick={mp.createRoom}>
            ➕ Create Room
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              className="room-input"
              placeholder="Enter room code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button className="restart-btn" onClick={() => mp.joinRoom(joinCode)}>Join</button>
          </div>
          <button onClick={onBack} className="back-btn">← Back</button>
        </div>
      )}

      {mp.status === "waiting" && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", letterSpacing: "6px", color: "#769656", margin: "20px 0" }}>
            {mp.roomId}
          </div>
          <p style={{ color: "#aaa" }}>Share this code with your opponent</p>
          <p style={{ color: "#aaa", marginTop: "10px" }}>⏳ Waiting for opponent to join...</p>
        </div>
      )}
    </div>
  );
}

// ─── MULTIPLAYER GAME ────────────────────────────────────────
function MultiGame({ mp, onBack }) {
  const {
    board, selected, validMoves, turn, isCheck,
    lastMove, capturedWhite, capturedBlack, history, gameOver,
    myColor, roomId, status, handleClick, resign,
  } = mp;

  const isMyTurn = turn === myColor;

  return (
    <div className="app-container">
      {/* LEFT */}
      <div className="left-panel">
        <button onClick={onBack} className="back-btn">← Back</button>
        <div className="side-panel">
          <h5>Moves <span className="arrow">↓</span></h5>
          <ul className="history">
            {history.map((move, i) => (
              <li key={i} style={{ color: move.startsWith("B:") ? "#e74c3c" : "#ecf0f1" }}>{move}</li>
            ))}
          </ul>
        </div>
        <div className="side-panel">
          <h5>Captured by White</h5>
          <div className="captured-list">
            {capturedBlack.map((p, i) => <span key={i} className="piece">{pieceMap[p]}</span>)}
          </div>
        </div>
      </div>

      {/* CENTER */}
      <div className="game-container">
        <h1 className="title">♟ Chess — Multiplayer</h1>

        <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "4px" }}>
          Room: <strong style={{ color: "#769656" }}>{roomId}</strong> &nbsp;|&nbsp; You are <strong style={{ color: myColor === "White" ? "#fff" : "#888" }}>{myColor}</strong>
        </div>

        <h4 className="turn">
          {gameOver ? "" : isMyTurn ? "⬅ Your Turn" : "⏳ Opponent's Turn"}
        </h4>

        {isCheck  && !gameOver && <div className="check">CHECK</div>}
        {gameOver && <div className="game-over">{gameOver}</div>}

        <Board board={board} selected={selected} validMoves={validMoves} handleClick={handleClick} lastMove={lastMove} />

        {status === "playing" && !gameOver && (
          <button onClick={resign} className="restart-btn" style={{ background: "#c0392b" }}>
            Resign
          </button>
        )}
        {gameOver && (
          <button onClick={onBack} className="restart-btn">Back to Menu</button>
        )}
      </div>

      {/* RIGHT */}
      <div className="right-panel">
        <div className="side-panel">
          <h5>Captured by Black</h5>
          <div className="captured-list">
            {capturedWhite.map((p, i) => <span key={i} className="piece">{pieceMap[p]}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState(null); // null | "ai" | "multi"
  const mp = useMultiplayer();

  const handleBack = () => {
    setMode(null);
  };

  if (!mode) return <ModeSelector onSelect={setMode} />;
  if (mode === "ai") return <AIGame onBack={handleBack} />;

  // Multiplayer
  if (mp.status === "playing") return <MultiGame mp={mp} onBack={handleBack} />;
  return <MultiLobby mp={mp} onBack={handleBack} />;
}
