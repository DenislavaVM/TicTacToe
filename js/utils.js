export const victoryPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [6, 4, 2],
];

export function createSymbolNode(player, [color1, color2], isPlayer1) {
    const span = document.createElement("span");
    span.className = "material-symbols-outlined";
    span.style.fontSize = "3rem";
    span.style.color = isPlayer1 ? color1 : color2;
    span.textContent = player === "X" ? "close" : "circle";
    return span;
};

export function getPlayerColors() {
    return [
        document.getElementById("player1-color").value,
        document.getElementById("player2-color").value
    ];
};

export function emptySquares(board) {
    return board.filter(s => typeof s === "number");
};

export function minimax(board, player, opponent, depth = 0, isMaximizing = true, alpha = -Infinity, beta = Infinity) {
    const availSpots = emptySquares(board);
    if (checkWin(board, opponent)) return { score: -10 + depth };
    if (checkWin(board, player)) return { score: 10 - depth };
    if (availSpots.length === 0) return { score: 0 };

    let bestMove;

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let i = 0; i < availSpots.length; i++) {
            const index = availSpots[i];
            board[index] = player;

            const result = minimax(board, player, opponent, depth + 1, false, alpha, beta);

            board[index] = index;
            if (result.score > maxEval) {
                maxEval = result.score;
                bestMove = { index, score: maxEval };
            }

            alpha = Math.max(alpha, result.score);
            if (beta <= alpha) break;
        };
        return bestMove;
    } else {
        let minEval = Infinity;
        for (let i = 0; i < availSpots.length; i++) {
            const index = availSpots[i];
            board[index] = opponent;

            const result = minimax(board, player, opponent, depth + 1, true, alpha, beta);

            board[index] = index;
            if (result.score < minEval) {
                minEval = result.score;
                bestMove = { index, score: minEval };
            };

            beta = Math.min(beta, result.score);
            if (beta <= alpha) break;
        };
        return bestMove;
    };
};

function checkWin(board, player) {
    return victoryPatterns.some(pattern =>
        pattern.every(index => board[index] === player)
    );
};

export function incrementLocalScore(key, selector) {
    const val = parseInt(localStorage.getItem(key) || 0) + 1;
    localStorage.setItem(key, val);
    document.querySelector(selector).textContent = val;
};