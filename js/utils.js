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

export function minimax(newBoard, player, opponent) {
    const availSpots = emptySquares(newBoard);

    if (checkWin(newBoard, opponent)) return { score: -10 };
    if (checkWin(newBoard, player)) return { score: 10 };
    if (availSpots.length === 0) return { score: 0 };

    let moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        let move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player;

        const result = minimax(newBoard, opponent, player);
        move.score = result.score;

        newBoard[availSpots[i]] = move.index;
        moves.push(move);
    };

    const bestMove = player === opponent
        ? moves.reduce((acc, m) => (m.score < acc.score ? m : acc), { score: 1000 })
        : moves.reduce((acc, m) => (m.score > acc.score ? m : acc), { score: -1000 });

    return bestMove;
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