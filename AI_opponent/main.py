import subprocess
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai.minmax import find_best_move

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CPP_ENGINE_PATH = os.path.join(os.path.dirname(__file__), "cpp_engine", "chess_ai")


class GameState(BaseModel):
    board: list
    turn: str
    difficulty: str


def board_to_cpp_input(board: list, depth: int) -> str:
    tokens = []
    for row in board:
        for cell in row:
            tokens.append(cell if cell != "" else ".")
    tokens.append(str(depth))
    return " ".join(tokens)


# ─── STANDARD AI (Python minimax) ───────────────────────────
@app.post("/ai-move")
def ai_move(state: GameState):
    board = state.board
    difficulty = state.difficulty

    if difficulty == "easy":
        move = find_best_move(board, depth=2)
    elif difficulty == "medium":
        move = find_best_move(board, depth=3)
    elif difficulty == "hard":
        move = find_best_move(board, depth=4)
    else:
        move = find_best_move(board, depth=2)

    return move


# ─── AGGRESSIVE AI (C++ engine with alpha-beta pruning) ──────
@app.post("/ai-move-aggressive")
def ai_move_aggressive(state: GameState):
    difficulty = state.difficulty
    depth_map = {"easy": 2, "medium": 3, "hard": 4}
    depth = depth_map.get(difficulty, 3)

    cpp_input = board_to_cpp_input(state.board, depth)

    try:
        result = subprocess.run(
            [CPP_ENGINE_PATH],
            input=cpp_input,
            capture_output=True,
            text=True,
            timeout=15
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="C++ engine timed out")
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="C++ engine binary not found. Run: g++ -O2 -std=c++17 -o cpp_engine/chess_ai cpp_engine/chess_ai.cpp")

    output = result.stdout.strip()
    if not output:
        raise HTTPException(status_code=500, detail="C++ engine returned no move")

    parts = output.split()
    return {
        "from": [int(parts[0]), int(parts[1])],
        "to":   [int(parts[2]), int(parts[3])]
    }


@app.get("/")
def home():
    return {"message": "Chess AI server running — /ai-move (Python) | /ai-move-aggressive (C++)"}