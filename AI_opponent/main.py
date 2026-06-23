from fastapi import FastAPI
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

class GameState(BaseModel):
    board: list
    turn: str
    difficulty: str 


@app.get("/")
def home():
    return {"message": "AI server running"}


@app.post("/ai-move")
def ai_move(state: GameState):
    board = state.board
    difficulty = state.difficulty  

    if difficulty == "easy":
        move = find_best_move(board)

    elif difficulty == "medium":
        move = find_best_move(board, depth=3)   

    elif difficulty == "hard":
        move = find_best_move(board, depth=4)  

    return move