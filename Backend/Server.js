import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import { randomUUID } from "crypto";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());

// ─── MONGODB ─────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/chess_db";
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// ─── SCHEMA ──────────────────────────────────────────────────
const gameSchema = new mongoose.Schema({
  board:         { type: [[String]], required: true },
  history:       { type: [String],  default: [] },
  capturedWhite: { type: [String],  default: [] },
  capturedBlack: { type: [String],  default: [] },
  winner:        { type: String,    default: null },
  difficulty:    { type: String,    default: "easy" },
  engine:        { type: String,    default: "standard" },
  mode:          { type: String,    default: "ai" },    // "ai" | "multiplayer"
  savedAt:       { type: Date,      default: Date.now },
});
const Game = mongoose.model("Game", gameSchema);

// ─── IN-MEMORY ROOMS ─────────────────────────────────────────
// rooms[roomId] = { players: [socketId, socketId], board, turn, history, ... }
const rooms = {};

function makeRoom(roomId) {
  return {
    roomId,
    players: [],          // [{ id: socketId, color: "White"|"Black" }]
    board: null,          // set when game starts
    turn: "White",
    history: [],
    capturedWhite: [],
    capturedBlack: [],
    gameOver: null,
    started: false,
  };
}

// ─── SOCKET.IO ───────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // ── CREATE ROOM ──────────────────────────────────────────
  socket.on("create_room", () => {
    const roomId = randomUUID().slice(0, 6).toUpperCase(); // e.g. "A3F9C2"
    rooms[roomId] = makeRoom(roomId);
    rooms[roomId].players.push({ id: socket.id, color: "White" });
    socket.join(roomId);
    socket.emit("room_created", { roomId, color: "White" });
    console.log(`Room created: ${roomId}`);
  });

  // ── JOIN ROOM ────────────────────────────────────────────
  socket.on("join_room", ({ roomId }) => {
    const room = rooms[roomId];

    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }
    if (room.players.length >= 2) {
      socket.emit("error", { message: "Room is full" });
      return;
    }

    room.players.push({ id: socket.id, color: "Black" });
    socket.join(roomId);
    socket.emit("room_joined", { roomId, color: "Black" });

    // Both players ready → start game
    room.started = true;
    io.to(roomId).emit("game_start", {
      roomId,
      players: room.players.map(p => ({ color: p.color })),
    });
    console.log(`Game started in room: ${roomId}`);
  });

  // ── MAKE MOVE ────────────────────────────────────────────
  socket.on("make_move", ({ roomId, board, move, turn, history, capturedWhite, capturedBlack, gameOver }) => {
    const room = rooms[roomId];
    if (!room) return;

    // Validate it's this player's turn
    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.color !== turn) return;

    // Update room state
    room.board         = board;
    room.turn          = turn === "White" ? "Black" : "White";
    room.history       = history;
    room.capturedWhite = capturedWhite;
    room.capturedBlack = capturedBlack;
    room.gameOver      = gameOver;

    // Broadcast move to the OTHER player
    socket.to(roomId).emit("opponent_move", {
      board, move, turn: room.turn, history, capturedWhite, capturedBlack, gameOver,
    });

    // If game over, save to DB
    if (gameOver) {
      new Game({
        board,
        history,
        capturedWhite,
        capturedBlack,
        winner: gameOver,
        mode: "multiplayer",
      }).save().catch(console.error);

      // Clean up room after short delay
      setTimeout(() => { delete rooms[roomId]; }, 5000);
    }
  });

  // ── RESIGN ───────────────────────────────────────────────
  socket.on("resign", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    const winner = player?.color === "White" ? "Black wins (resign)" : "White wins (resign)";
    io.to(roomId).emit("game_over", { reason: winner });
    delete rooms[roomId];
  });

  // ── DISCONNECT ───────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
    // Notify opponent if in a room
    for (const [roomId, room] of Object.entries(rooms)) {
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        socket.to(roomId).emit("opponent_left");
        delete rooms[roomId];
        break;
      }
    }
  });
});

// ─── REST ROUTES ─────────────────────────────────────────────

// Save game (AI mode saves from frontend)
app.post("/game/save", async (req, res) => {
  try {
    const { board, history, capturedWhite, capturedBlack, winner, difficulty, engine } = req.body;
    if (!board) return res.status(400).json({ error: "board required" });
    const saved = await new Game({ board, history, capturedWhite, capturedBlack, winner, difficulty, engine, mode: "ai" }).save();
    res.status(201).json({ message: "Game saved", id: saved._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all games (no board payload)
app.get("/game/history", async (req, res) => {
  try {
    const games = await Game.find({}, { board: 0 }).sort({ savedAt: -1 }).limit(20);
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single game
app.get("/game/:id", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: "Not found" });
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete game
app.delete("/game/:id", async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Active rooms (debug)
app.get("/rooms", (req, res) => {
  const summary = Object.entries(rooms).map(([id, r]) => ({
    roomId: id,
    players: r.players.length,
    started: r.started,
  }));
  res.json(summary);
});

app.get("/", (req, res) => res.json({ message: "Chess server running — REST + WebSocket" }));

// ─── START ───────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
