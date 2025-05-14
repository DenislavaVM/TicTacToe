onmessage = function (e) {
    const { board, computer, player } = e.data;
    const result = minimax(board, computer, player);
    postMessage(result.index);
};

function minimax(newBoard, player, opponent) {
    const availSpots = newBoard.filter(s => typeof s === "number");

    if (checkWin(newBoard, opponent)) {
        return { score: -10 };
    };

    if (checkWin(newBoard, player)) {
        return { score: 10 };
    };

    if (availSpots.length === 0) {
        return { score: 0 };
    };

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
    return [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [6, 4, 2]
    ].some(pattern => pattern.every(index => board[index] === player));
};