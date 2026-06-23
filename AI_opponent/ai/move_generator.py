from copy import deepcopy

# ================= BLACK MOVES =================

def get_black_pawn_moves(board):
    moves = []

    for row in range(8):
        for col in range(8):
            if board[row][col] == "p":

                if row + 1 < 8 and board[row + 1][col] == "":
                    moves.append({"from": [row, col], "to": [row + 1, col]})

                if row + 1 < 8 and col - 1 >= 0:
                    target = board[row + 1][col - 1]
                    if target != "" and target.isupper():
                        moves.append({"from": [row, col], "to": [row + 1, col - 1]})

                if row + 1 < 8 and col + 1 < 8:
                    target = board[row + 1][col + 1]
                    if target != "" and target.isupper():
                        moves.append({"from": [row, col], "to": [row + 1, col + 1]})

    return moves


def get_black_knight_moves(board):
    moves = []
    directions = [
        (-2, -1), (-2, 1),
        (-1, -2), (-1, 2),
        (1, -2), (1, 2),
        (2, -1), (2, 1)
    ]

    for row in range(8):
        for col in range(8):
            if board[row][col] == "n":
                for dr, dc in directions:
                    r, c = row + dr, col + dc
                    if 0 <= r < 8 and 0 <= c < 8:
                        target = board[r][c]
                        if target == "" or target.isupper():
                            moves.append({"from": [row, col], "to": [r, c]})

    return moves


def get_black_bishop_moves(board):
    moves = []
    directions = [(-1, -1), (-1, 1), (1, -1), (1, 1)]

    for row in range(8):
        for col in range(8):
            if board[row][col] == "b":
                for dr, dc in directions:
                    r, c = row + dr, col + dc
                    while 0 <= r < 8 and 0 <= c < 8:
                        target = board[r][c]

                        if target == "":
                            moves.append({"from": [row, col], "to": [r, c]})
                        elif target.isupper():
                            moves.append({"from": [row, col], "to": [r, c]})
                            break
                        else:
                            break

                        r += dr
                        c += dc

    return moves


def get_black_rook_moves(board):
    moves = []
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    for row in range(8):
        for col in range(8):
            if board[row][col] == "r":
                for dr, dc in directions:
                    r, c = row + dr, col + dc
                    while 0 <= r < 8 and 0 <= c < 8:
                        target = board[r][c]

                        if target == "":
                            moves.append({"from": [row, col], "to": [r, c]})
                        elif target.isupper():
                            moves.append({"from": [row, col], "to": [r, c]})
                            break
                        else:
                            break

                        r += dr
                        c += dc

    return moves


def get_black_queen_moves(board):
    return get_black_rook_moves(board) + get_black_bishop_moves(board)


def get_black_king_moves(board):
    moves = []
    directions = [
        (-1, 0), (1, 0),
        (0, -1), (0, 1),
        (-1, -1), (-1, 1),
        (1, -1), (1, 1)
    ]

    for row in range(8):
        for col in range(8):
            if board[row][col] == "k":
                for dr, dc in directions:
                    r, c = row + dr, col + dc
                    if 0 <= r < 8 and 0 <= c < 8:
                        target = board[r][c]
                        if target == "" or target.isupper():
                            moves.append({"from": [row, col], "to": [r, c]})

    return moves


def get_all_black_moves(board):
    return (
        get_black_pawn_moves(board)
        + get_black_knight_moves(board)
        + get_black_bishop_moves(board)
        + get_black_rook_moves(board)
        + get_black_queen_moves(board)
        + get_black_king_moves(board)
    )


# ================= WHITE (TEMP SIMPLE) =================

def get_all_white_moves(board):
    return (
        get_white_pawn_moves(board)
        + get_white_knight_moves(board)
        + get_white_bishop_moves(board)
        + get_white_rook_moves(board)
        + get_white_queen_moves(board)
        + get_white_king_moves(board)

    )

# ================= APPLY =================

def apply_move(board, move):
    new_board = deepcopy(board)

    fr, fc = move["from"]
    tr, tc = move["to"]

    new_board[tr][tc] = new_board[fr][fc]
    new_board[fr][fc] = ""

    return new_board

# 
def is_in_check(board, is_white):
    king = "K" if is_white else "k"
    king_pos = None

    for r in range(8):
        for c in range(8):
            if board[r][c] == king:
                king_pos = (r, c)

    if not king_pos:
        return True  # king missing = checkmate

    opponent_moves = get_all_black_moves(board) if is_white else get_all_white_moves(board)

    for move in opponent_moves:
        if move["to"] == list(king_pos):
            return True

    return False

# 
def filter_legal_moves(board, moves, is_white):
    legal_moves = []

    for move in moves:
        new_board = apply_move(board, move)

        if not is_in_check(new_board, is_white):
            legal_moves.append(move)

    return legal_moves


# 
def get_white_pawn_moves(board):
    moves = []

    for row in range(8):
        for col in range(8):
            if board[row][col] == "P":

                # move forward
                if row - 1 >= 0 and board[row - 1][col] == "":
                    moves.append({
                        "from": [row, col],
                        "to": [row - 1, col]
                    })

                # capture left
                if row - 1 >= 0 and col - 1 >= 0:
                    target = board[row - 1][col - 1]
                    if target != "" and target.islower():
                        moves.append({
                            "from": [row, col],
                            "to": [row - 1, col - 1]
                        })

                # capture right
                if row - 1 >= 0 and col + 1 < 8:
                    target = board[row - 1][col + 1]
                    if target != "" and target.islower():
                        moves.append({
                            "from": [row, col],
                            "to": [row - 1, col + 1]
                        })

    return moves

def get_white_knight_moves(board):
    moves = []

    directions = [
        (-2, -1), (-2, 1),
        (-1, -2), (-1, 2),
        (1, -2), (1, 2),
        (2, -1), (2, 1)
    ]

    for row in range(8):
        for col in range(8):
            if board[row][col] == "N":
                for dr, dc in directions:
                    r, c = row + dr, col + dc

                    if 0 <= r < 8 and 0 <= c < 8:
                        target = board[r][c]

                        if target == "" or target.islower():
                            moves.append({
                                "from": [row, col],
                                "to": [r, c]
                            })

    return moves

# 

def get_white_bishop_moves(board):
    moves = []
    directions = [(-1, -1), (-1, 1), (1, -1), (1, 1)]

    for row in range(8):
        for col in range(8):
            if board[row][col] == "B":
                for dr, dc in directions:
                    r, c = row + dr, col + dc

                    while 0 <= r < 8 and 0 <= c < 8:
                        target = board[r][c]

                        if target == "":
                            moves.append({
                                "from": [row, col],
                                "to": [r, c]
                            })
                        elif target.islower():
                            moves.append({
                                "from": [row, col],
                                "to": [r, c]
                            })
                            break
                        else:
                            break

                        r += dr
                        c += dc

    return moves

def get_white_rook_moves(board):
    moves = []
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    for row in range(8):
        for col in range(8):
            if board[row][col] == "R":
                for dr, dc in directions:
                    r, c = row + dr, col + dc

                    while 0 <= r < 8 and 0 <= c < 8:
                        target = board[r][c]

                        if target == "":
                            moves.append({
                                "from": [row, col],
                                "to": [r, c]
                            })
                        elif target.islower():
                            moves.append({
                                "from": [row, col],
                                "to": [r, c]
                            })
                            break
                        else:
                            break

                        r += dr
                        c += dc

    return moves

def get_white_queen_moves(board):
    moves = []
    directions = [
        (-1, 0), (1, 0), (0, -1), (0, 1),  # rook
        (-1, -1), (-1, 1), (1, -1), (1, 1)  # bishop
    ]

    for row in range(8):
        for col in range(8):
            if board[row][col] == "Q":
                for dr, dc in directions:
                    r, c = row + dr, col + dc

                    while 0 <= r < 8 and 0 <= c < 8:
                        target = board[r][c]

                        if target == "":
                            moves.append({
                                "from": [row, col],
                                "to": [r, c]
                            })
                        elif target.islower():
                            moves.append({
                                "from": [row, col],
                                "to": [r, c]
                            })
                            break
                        else:
                            break

                        r += dr
                        c += dc

    return moves

# 
def get_white_king_moves(board):
    moves = []

    directions = [
        (-1, 0), (1, 0),
        (0, -1), (0, 1),
        (-1, -1), (-1, 1),
        (1, -1), (1, 1)
    ]

    for row in range(8):
        for col in range(8):
            if board[row][col] == "K":
                for dr, dc in directions:
                    r, c = row + dr, col + dc

                    if 0 <= r < 8 and 0 <= c < 8:
                        target = board[r][c]

                        if target == "" or target.islower():
                            moves.append({
                                "from": [row, col],
                                "to": [r, c]
                            })

    return moves