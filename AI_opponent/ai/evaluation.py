def evaluate_board(board):
    piece_values = {
        "p": -1, "n": -3, "b": -3, "r": -5, "q": -9, "k": -100,
        "P": 1, "N": 3, "B": 3, "R": 5, "Q": 9, "K": 100
    }

    score = 0

    for row in board:
        for piece in row:
            if piece != "":
                score += piece_values.get(piece, 0)

    return score
def is_king_alive(board):
    white_king = False
    black_king = False

    for row in board:
        for piece in row:
            if piece == "K":
                white_king = True
            if piece == "k":
                black_king = True

    return white_king, black_king