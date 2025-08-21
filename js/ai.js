import { emptySquares, minimax } from "./utils.js";

export function getBestMove(board, difficulty, computer, player) {
    if (difficulty === "easy" && Math.random() < 0.5) {
        return randomMove(board);
    };

    if (difficulty === "medium" && Math.random() < 0.2) {
        return randomMove(board);
    };

    if (difficulty === "medium") {
        return minimax(board, computer, player, 0, true, -Infinity, Infinity, 2).index;
    };

    return minimax(board, computer, player).index;
};

function randomMove(board) {
    const available = emptySquares(board);
    return available[Math.floor(Math.random() * available.length)];
};