# Chess Full Stack — Setup Guide

## Project Structure
```
chess_final/
├── Frontend/        React (Vite) — UI + game logic
├── Backend/         Node.js + Express + Socket.io + MongoDB
└── AI_opponent/     Python FastAPI — Minimax + C++ alpha-beta
```

---

## 1. AI Backend (Python — start first)
```bash
cd AI_opponent
pip install fastapi uvicorn pydantic

# Optional: compile C++ engine
g++ -O2 -std=c++17 -o cpp_engine/chess_ai cpp_engine/chess_ai.cpp

uvicorn main:app --reload --port 8000
```

---

## 2. Node.js Backend
```bash
cd Backend
npm install
# Requires MongoDB running locally: mongod
npm start
# Runs on http://localhost:3001
```

**REST APIs:**
| Method | Endpoint       | What it does           |
|--------|----------------|------------------------|
| POST   | /game/save     | Save finished AI game  |
| GET    | /game/history  | Last 20 games          |
| GET    | /game/:id      | Load game by ID        |
| DELETE | /game/:id      | Delete game            |
| GET    | /rooms         | Debug: active rooms    |

**WebSocket events (Socket.io):**
| Emit            | Receive           | Description              |
|-----------------|-------------------|--------------------------|
| create_room     | room_created      | Host creates a room      |
| join_room       | room_joined       | Opponent joins           |
|                 | game_start        | Both players connected   |
| make_move       | opponent_move     | Sync move to opponent    |
| resign          | game_over         | Forfeit game             |
|                 | opponent_left     | Other player disconnected|

---

## 3. Frontend (React)
```bash
cd Frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## How Multiplayer Works
1. Player 1 clicks **Multiplayer → Create Room** → gets a 6-char code (e.g. `A3F9C2`)
2. Player 2 enters the code → **Join Room**
3. Game starts automatically — White moves first
4. Moves sync in real-time via Socket.io
5. Game result saves to MongoDB automatically

---

## Architecture
```
Browser A ──┐
            ├──► Node.js (Socket.io) ──► MongoDB
Browser B ──┘         │
                       └──► (REST) save/load games

Browser ──► FastAPI (Python) ──► AI move (Minimax / C++)
```
