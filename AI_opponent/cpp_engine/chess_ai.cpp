/*
 * Chess AI Engine - Aggressive Attacker
 * Uses: Minimax algorithm + Alpha-Beta Pruning (tree pruning DSA)
 * Plays as: Black
 * Strategy: Maximizes material gain + king proximity attacks + center control
 *
 * Board encoding: uppercase = White, lowercase = Black, "" = empty square
 * Input  (stdin): 64 space-separated piece strings, then depth integer
 * Output (stdout): "fromRow fromCol toRow toCol"
 */

#include <iostream>
#include <vector>
#include <string>
#include <climits>
#include <algorithm>
#include <sstream>

// ─────────────────────────────────────────────
// BOARD TYPE
// ─────────────────────────────────────────────
typedef std::vector<std::vector<std::string>> Board;

struct Move {
    int fromRow, fromCol, toRow, toCol;
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
bool isUpper(const std::string& p) {
    return !p.empty() && p[0] >= 'A' && p[0] <= 'Z';
}
bool isLower(const std::string& p) {
    return !p.empty() && p[0] >= 'a' && p[0] <= 'z';
}
bool inBounds(int r, int c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
}

Board applyMove(const Board& board, const Move& m) {
    Board nb = board;
    nb[m.toRow][m.toCol] = nb[m.fromRow][m.fromCol];
    nb[m.fromRow][m.fromCol] = "";
    return nb;
}

// ─────────────────────────────────────────────
// MOVE GENERATORS (Black pieces)
// ─────────────────────────────────────────────
void addSlidingMoves(const Board& b, int row, int col,
                     const std::vector<std::pair<int,int>>& dirs,
                     std::vector<Move>& moves) {
    for (auto [dr, dc] : dirs) {
        int r = row + dr, c = col + dc;
        while (inBounds(r, c)) {
            if (b[r][c].empty()) {
                moves.push_back({row, col, r, c});
            } else {
                if (isUpper(b[r][c]))          // capture white
                    moves.push_back({row, col, r, c});
                break;
            }
            r += dr; c += dc;
        }
    }
}

std::vector<Move> getBlackMoves(const Board& board) {
    std::vector<Move> moves;

    for (int row = 0; row < 8; row++) {
        for (int col = 0; col < 8; col++) {
            const std::string& p = board[row][col];
            if (p.empty() || isUpper(p)) continue;

            // ── PAWN ──
            if (p == "p") {
                // forward
                if (inBounds(row+1, col) && board[row+1][col].empty())
                    moves.push_back({row, col, row+1, col});
                // start double push
                if (row == 1 && board[row+1][col].empty() && board[row+2][col].empty())
                    moves.push_back({row, col, row+2, col});
                // captures
                for (int dc : {-1, 1}) {
                    if (inBounds(row+1, col+dc) && isUpper(board[row+1][col+dc]))
                        moves.push_back({row, col, row+1, col+dc});
                }
            }

            // ── KNIGHT ──
            else if (p == "n") {
                for (auto [dr, dc] : std::vector<std::pair<int,int>>{
                    {-2,-1},{-2,1},{-1,-2},{-1,2},{1,-2},{1,2},{2,-1},{2,1}}) {
                    int r = row+dr, c = col+dc;
                    if (inBounds(r,c) && (board[r][c].empty() || isUpper(board[r][c])))
                        moves.push_back({row, col, r, c});
                }
            }

            // ── BISHOP ──
            else if (p == "b") {
                addSlidingMoves(board, row, col,
                    {{-1,-1},{-1,1},{1,-1},{1,1}}, moves);
            }

            // ── ROOK ──
            else if (p == "r") {
                addSlidingMoves(board, row, col,
                    {{-1,0},{1,0},{0,-1},{0,1}}, moves);
            }

            // ── QUEEN ──
            else if (p == "q") {
                addSlidingMoves(board, row, col,
                    {{-1,0},{1,0},{0,-1},{0,1},{-1,-1},{-1,1},{1,-1},{1,1}}, moves);
            }

            // ── KING ──
            else if (p == "k") {
                for (auto [dr, dc] : std::vector<std::pair<int,int>>{
                    {-1,0},{1,0},{0,-1},{0,1},{-1,-1},{-1,1},{1,-1},{1,1}}) {
                    int r = row+dr, c = col+dc;
                    if (inBounds(r,c) && (board[r][c].empty() || isUpper(board[r][c])))
                        moves.push_back({row, col, r, c});
                }
            }
        }
    }
    return moves;
}

// ─────────────────────────────────────────────
// WHITE MOVE GENERATOR (for legal move filtering)
// ─────────────────────────────────────────────
std::vector<Move> getWhiteMoves(const Board& board) {
    std::vector<Move> moves;

    for (int row = 0; row < 8; row++) {
        for (int col = 0; col < 8; col++) {
            const std::string& p = board[row][col];
            if (p.empty() || isLower(p)) continue;

            if (p == "P") {
                if (inBounds(row-1, col) && board[row-1][col].empty())
                    moves.push_back({row, col, row-1, col});
                if (row == 6 && board[row-1][col].empty() && board[row-2][col].empty())
                    moves.push_back({row, col, row-2, col});
                for (int dc : {-1, 1}) {
                    if (inBounds(row-1, col+dc) && isLower(board[row-1][col+dc]))
                        moves.push_back({row, col, row-1, col+dc});
                }
            }
            else if (p == "N") {
                for (auto [dr, dc] : std::vector<std::pair<int,int>>{
                    {-2,-1},{-2,1},{-1,-2},{-1,2},{1,-2},{1,2},{2,-1},{2,1}}) {
                    int r = row+dr, c = col+dc;
                    if (inBounds(r,c) && (board[r][c].empty() || isLower(board[r][c])))
                        moves.push_back({row, col, r, c});
                }
            }
            else if (p == "B") {
                addSlidingMoves(board, row, col, {{-1,-1},{-1,1},{1,-1},{1,1}}, moves);
            }
            else if (p == "R") {
                addSlidingMoves(board, row, col, {{-1,0},{1,0},{0,-1},{0,1}}, moves);
            }
            else if (p == "Q") {
                addSlidingMoves(board, row, col,
                    {{-1,0},{1,0},{0,-1},{0,1},{-1,-1},{-1,1},{1,-1},{1,1}}, moves);
            }
            else if (p == "K") {
                for (auto [dr, dc] : std::vector<std::pair<int,int>>{
                    {-1,0},{1,0},{0,-1},{0,1},{-1,-1},{-1,1},{1,-1},{1,1}}) {
                    int r = row+dr, c = col+dc;
                    if (inBounds(r,c) && (board[r][c].empty() || isLower(board[r][c])))
                        moves.push_back({row, col, r, c});
                }
            }
        }
    }
    return moves;
}

// ─────────────────────────────────────────────
// CHECK DETECTION
// ─────────────────────────────────────────────
bool isKingInCheck(const Board& board, bool isWhite) {
    std::string king = isWhite ? "K" : "k";
    int kr = -1, kc = -1;
    for (int r = 0; r < 8 && kr == -1; r++)
        for (int c = 0; c < 8; c++)
            if (board[r][c] == king) { kr = r; kc = c; break; }

    if (kr == -1) return true;  // king captured

    auto attacks = isWhite ? getBlackMoves(board) : getWhiteMoves(board);
    for (auto& m : attacks)
        if (m.toRow == kr && m.toCol == kc) return true;
    return false;
}

std::vector<Move> filterLegal(const Board& board,
                               const std::vector<Move>& moves,
                               bool isBlack) {
    std::vector<Move> legal;
    for (auto& m : moves) {
        Board nb = applyMove(board, m);
        if (!isKingInCheck(nb, !isBlack))
            legal.push_back(m);
    }
    return legal;
}

// ─────────────────────────────────────────────
// AGGRESSIVE EVALUATION
// Piece values + king proximity bonus + center control + attack pressure
// ─────────────────────────────────────────────
int pieceValue(const std::string& p) {
    if (p == "p") return 100;  if (p == "P") return -100;
    if (p == "n") return 320;  if (p == "N") return -320;
    if (p == "b") return 330;  if (p == "B") return -330;
    if (p == "r") return 500;  if (p == "R") return -500;
    if (p == "q") return 900;  if (p == "Q") return -900;
    if (p == "k") return 20000; if (p == "K") return -20000;
    return 0;
}

// Bonus for black pieces being close to white king (aggression)
int kingProximityBonus(const Board& board) {
    int wkr = -1, wkc = -1;
    for (int r = 0; r < 8 && wkr == -1; r++)
        for (int c = 0; c < 8; c++)
            if (board[r][c] == "K") { wkr = r; wkc = c; break; }
    if (wkr == -1) return 5000;

    int bonus = 0;
    for (int r = 0; r < 8; r++) {
        for (int c = 0; c < 8; c++) {
            if (isLower(board[r][c]) && board[r][c] != "k") {
                int dist = std::abs(r - wkr) + std::abs(c - wkc);
                bonus += (14 - dist) * 3;  // closer = more bonus
            }
        }
    }
    return bonus;
}

// Center control bonus for black
int centerControlBonus(const Board& board) {
    int bonus = 0;
    int center[4][2] = {{3,3},{3,4},{4,3},{4,4}};
    for (auto& sq : center)
        if (isLower(board[sq[0]][sq[1]])) bonus += 20;
    return bonus;
}

// Bonus for number of squares black is attacking near white king
int attackPressure(const Board& board) {
    int wkr = -1, wkc = -1;
    for (int r = 0; r < 8 && wkr == -1; r++)
        for (int c = 0; c < 8; c++)
            if (board[r][c] == "K") { wkr = r; wkc = c; break; }
    if (wkr == -1) return 0;

    auto blackAttacks = getBlackMoves(board);
    int pressure = 0;
    for (auto& m : blackAttacks) {
        int dist = std::abs(m.toRow - wkr) + std::abs(m.toCol - wkc);
        if (dist <= 2) pressure += 15;  // attacking squares near white king
    }
    return pressure;
}

int evaluate(const Board& board) {
    int score = 0;
    for (int r = 0; r < 8; r++)
        for (int c = 0; c < 8; c++)
            score += pieceValue(board[r][c]);

    score += kingProximityBonus(board);
    score += centerControlBonus(board);
    score += attackPressure(board);
    return score;
}

// ─────────────────────────────────────────────
// MINIMAX + ALPHA-BETA PRUNING
// maximizing = Black's turn
// ─────────────────────────────────────────────
int alphaBeta(const Board& board, int depth, int alpha, int beta, bool maximizing) {
    if (depth == 0) return evaluate(board);

    if (maximizing) {
        auto moves = filterLegal(board, getBlackMoves(board), true);
        if (moves.empty()) return isKingInCheck(board, false) ? -20000 : 0;  // checkmate or stalemate

        int maxEval = INT_MIN;
        for (auto& m : moves) {
            Board nb = applyMove(board, m);
            int val = alphaBeta(nb, depth - 1, alpha, beta, false);
            maxEval = std::max(maxEval, val);
            alpha = std::max(alpha, val);
            if (beta <= alpha) break;  // ── PRUNE ──
        }
        return maxEval;
    } else {
        auto moves = filterLegal(board, getWhiteMoves(board), false);
        if (moves.empty()) return isKingInCheck(board, true) ? 20000 : 0;

        int minEval = INT_MAX;
        for (auto& m : moves) {
            Board nb = applyMove(board, m);
            int val = alphaBeta(nb, depth - 1, alpha, beta, true);
            minEval = std::min(minEval, val);
            beta = std::min(beta, val);
            if (beta <= alpha) break;  // ── PRUNE ──
        }
        return minEval;
    }
}

// ─────────────────────────────────────────────
// MOVE ORDERING: captures first (improves pruning)
// ─────────────────────────────────────────────
void orderMoves(const Board& board, std::vector<Move>& moves) {
    std::sort(moves.begin(), moves.end(), [&](const Move& a, const Move& b) {
        bool aCapture = !board[a.toRow][a.toCol].empty();
        bool bCapture = !board[b.toRow][b.toCol].empty();
        return aCapture > bCapture;
    });
}

Move findBestMove(const Board& board, int depth) {
    auto moves = filterLegal(board, getBlackMoves(board), true);
    orderMoves(board, moves);

    Move best = moves[0];
    int bestVal = INT_MIN;

    for (auto& m : moves) {
        Board nb = applyMove(board, m);
        int val = alphaBeta(nb, depth - 1, INT_MIN, INT_MAX, false);
        if (val > bestVal) {
            bestVal = val;
            best = m;
        }
    }
    return best;
}

// ─────────────────────────────────────────────
// MAIN — reads board from stdin, writes move to stdout
// ─────────────────────────────────────────────
int main() {
    Board board(8, std::vector<std::string>(8, ""));
    int depth;

    // Read 64 tokens for board squares (row-major order)
    for (int r = 0; r < 8; r++) {
        for (int c = 0; c < 8; c++) {
            std::string token;
            std::cin >> token;
            board[r][c] = (token == "." ? "" : token);
        }
    }
    std::cin >> depth;

    Move best = findBestMove(board, depth);
    std::cout << best.fromRow << " " << best.fromCol << " "
              << best.toRow  << " " << best.toCol  << std::endl;
    return 0;
}
