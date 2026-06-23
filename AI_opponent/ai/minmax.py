from ai.evaluation import evaluate_board, is_king_alive

from ai.move_generator import (
    get_all_black_moves,
    get_all_white_moves,
    apply_move,
    filter_legal_moves
)


def minimax(board, depth, maximizing):
    # STEP 1: KING ALIVE CHECK
    white_alive, black_alive = is_king_alive(board)

    if not white_alive:
        return -9999

    if not black_alive:
        return 9999

    # STEP 2: DEPTH CHECK
    if depth == 0:
        return evaluate_board(board)

    # ================= MAXIMIZING (BLACK) =================
    if maximizing:
        max_eval = float("-inf")

        moves = filter_legal_moves(board, get_all_black_moves(board), False)

        if not moves:
            return evaluate_board(board)

        for move in moves:
            new_board = apply_move(board, move)
            eval = minimax(new_board, depth - 1, False)
            max_eval = max(max_eval, eval)

        return max_eval

    # ================= MINIMIZING (WHITE) =================
    else:
        min_eval = float("inf")

        moves = filter_legal_moves(board, get_all_white_moves(board), True)

        if not moves:
            return evaluate_board(board)

        for move in moves:
            new_board = apply_move(board, move)
            eval = minimax(new_board, depth - 1, True)
            min_eval = min(min_eval, eval)

        return min_eval


def find_best_move(board, depth=2):  # CHANGED: added depth
    best_move = None
    best_value = float("-inf")

    moves = filter_legal_moves(board, get_all_black_moves(board), False)

    for move in moves:
        new_board = apply_move(board, move)

        # CHANGED: use depth instead of fixed 2
        value = minimax(new_board, depth, False)

        if value > best_value:
            best_value = value
            best_move = move

    return best_move