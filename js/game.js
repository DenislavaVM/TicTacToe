import { updateBoardUI, updateSymbolColors, showEndgameMessage, resetUIStats } from "./ui.js";
import { playMoveSound, playWinSound, playTieSound } from "./sounds.js";
import { highlightDrawBoard } from "./ui.js";
import { createSymbolNode, getPlayerColors, victoryPatterns } from "./utils.js";

let board, currentPlayer, playerSymbol = "X", computerSymbol = "O", gameMode = "pvc", difficulty = "hard";
let aiWorker = null;
let isProcessing = false;
const cells = document.querySelectorAll(".cell");

function attachClickHandlers() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        cell.addEventListener("click", handleCellClick);
    });
};

export function bindGameEvents() {
    document.getElementById("start-game").addEventListener("click", startGameFromHome);
    document.querySelector(".button").addEventListener("click", startGame);
    document.getElementById("back-home-button").addEventListener("click", goToHomeScreen);
    document.addEventListener("play-again", () => {
        startGame();
    });
    attachClickHandlers();
};

function startGameFromHome() {
    const p1 = document.getElementById("player1-symbol").value;
    const p2 = document.getElementById("player2-symbol").value;
    if (p1 === p2) {
        return document.dispatchEvent(new CustomEvent("error", { detail: "Players cannot have the same symbol." }));
    }

    gameMode = document.getElementById("game-mode").value;
    playerSymbol = p1;
    computerSymbol = p2;

    if (gameMode === "pvc" && !aiWorker) {
        aiWorker = new Worker("js/ai.worker.js");
    };

    if (gameMode === "pvp" && aiWorker) {
        aiWorker.terminate();
        aiWorker = null;
    };

    document.querySelector(".symbols span:nth-child(1)").textContent = p1 === "X" ? "close" : "circle";
    document.querySelector(".symbols span:nth-child(2)").textContent = p2 === "X" ? "close" : "circle";

    localStorage.setItem("player1Score", 0);
    localStorage.setItem("player2Score", 0);
    localStorage.setItem("draws", 0);

    resetUIStats();
    document.getElementById("home-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";

    startGame();
};

function startGame() {
    difficulty = document.getElementById("difficulty").value;
    board = Array.from(Array(9).keys());
    currentPlayer = playerSymbol;

    updateSymbolColors(currentPlayer, playerSymbol, computerSymbol);
    updateBoardUI(board, handleCellClick);
};

function handleCellClick(e) {
    if (isProcessing) {
        return;
    };

    const index = parseInt(e.target.id);
    if (typeof board[index] !== "number") {
        return;
    };

    isProcessing = true;
    makeMove(index, currentPlayer);
    if (!checkWinner(board, currentPlayer) && !checkTie()) {
        currentPlayer = currentPlayer === playerSymbol ? computerSymbol : playerSymbol;
        updateSymbolColors(currentPlayer, playerSymbol, computerSymbol);

        if (gameMode === "pvc" && currentPlayer === computerSymbol) {
            setTimeout(() => {
                handleComputerMove();
            }, 300);
        } else {
            isProcessing = false;
        }
    } else {
        isProcessing = false;
    }
};

function makeMove(index, player) {
    board[index] = player;
    requestAnimationFrame(() => {
        const cell = document.getElementById(index);
        if (!cell) {
            return;
        };

        cell.innerHTML = "";
        cell.appendChild(createSymbolNode(player, getPlayerColors(), player === playerSymbol));
        playMoveSound();

        const win = checkWinner(board, player);
        if (win) {
            endGame(win, player);
        };
    });
};

function checkWinner(b, player) {
    const plays = b.map((val, idx) => val === player ? idx : -1).filter(idx => idx !== -1);
    for (let [i, combo] of victoryPatterns.entries()) {
        if (combo.every(val => plays.includes(val))) {
            return { index: i, player };
        };
    };
    return null;
};

function checkTie() {
    if (board.every(cell => typeof cell !== "number")) {
        highlightDrawBoard();
        playTieSound();
        showEndgameMessage("Tie Game", null, gameMode, playerSymbol);
        return true;
    };
    return false;
};

function endGame(win, winner) {
    playWinSound();
    showEndgameMessage(
        gameMode === "pvp" ? `Player ${winner === playerSymbol ? "1" : "2"} wins!` : winner === playerSymbol ? "You win!" : "You lose.",
        winner,
        gameMode,
        playerSymbol,
        win.index
    );
    cells.forEach(cell => cell.removeEventListener("click", handleCellClick));
};

function goToHomeScreen() {
    document.getElementById("game-screen").style.display = "none";
    document.getElementById("home-screen").style.display = "flex";
    startGame();
};

async function handleComputerMove() {
    if (difficulty === "easy" && Math.random() < 0.5) {
        const available = board.filter(s => typeof s === "number");
        const randomMove = available[Math.floor(Math.random() * available.length)];
        makeMove(randomMove, computerSymbol);
        postMoveCleanup();
        return;
    };

    if (difficulty === "medium" && Math.random() < 0.2) {
        const available = board.filter(s => typeof s === "number");
        const randomMove = available[Math.floor(Math.random() * available.length)];
        makeMove(randomMove, computerSymbol);
        postMoveCleanup();
        return;
    };

    aiWorker.postMessage({
        board,
        computer: computerSymbol,
        player: playerSymbol
    });

    aiWorker.onmessage = function (e) {
        const move = e.data;
        makeMove(move, computerSymbol);
        postMoveCleanup();
    };
};

function postMoveCleanup() {
    if (!checkWinner(board, currentPlayer) && !checkTie()) {
        currentPlayer = playerSymbol;
        updateSymbolColors(currentPlayer, playerSymbol, computerSymbol);
    };
    isProcessing = false;
};

window.addEventListener("pagehide", () => {
    if (aiWorker) {
        aiWorker.terminate();
        aiWorker = null;
    }
});