from ai.move_generator import (
    get_white_pawn_moves,
    get_white_knight_moves,
    get_white_bishop_moves,
    get_white_rook_moves,
    get_white_queen_moves,
    get_white_king_moves,
    get_all_white_moves,
    filter_legal_moves,
    is_in_check
)

from ai.evaluation import evaluate_board


# ================= PIECE TESTS =================

def test_pawn():
    board = [["" for _ in range(8)] for _ in range(8)]
    board[6][0] = "P"

    moves = get_white_pawn_moves(board)
    print("Pawn Moves:", moves)


def test_knight():
    board = [["" for _ in range(8)] for _ in range(8)]
    board[4][4] = "N"

    moves = get_white_knight_moves(board)
    print("Knight Moves:", moves)


def test_bishop():
    board = [["" for _ in range(8)] for _ in range(8)]
    board[4][4] = "B"

    moves = get_white_bishop_moves(board)
    print("Bishop Moves:", moves)


def test_rook():
    board = [["" for _ in range(8)] for _ in range(8)]
    board[4][4] = "R"

    moves = get_white_rook_moves(board)
    print("Rook Moves:", moves)


def test_queen():
    board = [["" for _ in range(8)] for _ in range(8)]
    board[4][4] = "Q"

    moves = get_white_queen_moves(board)
    print("Queen Moves:", moves)


def test_king():
    board = [["" for _ in range(8)] for _ in range(8)]
    board[4][4] = "K"

    moves = get_white_king_moves(board)
    print("King Moves:", moves)


# ================= SYSTEM TESTS =================

def test_check_detection():
    board = [["" for _ in range(8)] for _ in range(8)]
    board[0][4] = "k"
    board[4][4] = "Q"

    print("Black in check:", is_in_check(board, False))


def test_legal_moves():
    board = [["" for _ in range(8)] for _ in range(8)]

    board[7][4] = "K"
    board[0][4] = "k"
    board[1][4] = "r"  # black rook attacking

    moves = get_all_white_moves(board)
    legal = filter_legal_moves(board, moves, True)

    print("All Moves:", moves)
    print("Legal Moves:", legal)


def test_evaluation():
    board = [["" for _ in range(8)] for _ in range(8)]
    board[4][4] = "Q"
    board[0][0] = "q"

    print("Evaluation Score:", evaluate_board(board))


# ================= RUN =================

if __name__ == "__main__":
    print("\n--- PAWN ---")
    test_pawn()

    print("\n--- KNIGHT ---")
    test_knight()

    print("\n--- BISHOP ---")
    test_bishop()

    print("\n--- ROOK ---")
    test_rook()

    print("\n--- QUEEN ---")
    test_queen()

    print("\n--- KING ---")
    test_king()

    print("\n--- CHECK DETECTION ---")
    test_check_detection()

    print("\n--- LEGAL MOVES ---")
    test_legal_moves()

    print("\n--- EVALUATION ---")
    test_evaluation()