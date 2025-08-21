import { updateBoardUI, updateSymbolColors, showEndgameMessage, resetUIStats, showErrorModal, highlightDrawBoard } from "./ui.js";
import { playMoveSound, playWinSound, playTieSound } from "./sounds.js";
import { createSymbolNode, getPlayerColors, victoryPatterns } from "./utils.js";

let board, currentPlayer, playerSymbol = "X", computerSymbol = "O", gameMode = "pvc", difficulty = "hard";
let aiWorker = null;
let isProcessing = false;
let gameActive = false;

function attachClickHandlers() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        cell.removeEventListener("click", handleCellClick);
        cell.addEventListener("click", handleCellClick);
    });
};

export function bindGameEvents() {
    document.getElementById("start-game").addEventListener("click", startGameFromHome);
    document.getElementById("reset-button").addEventListener("click", startGame);
    document.getElementById("back-home-button").addEventListener("click", goToHomeScreen);
    document.addEventListener("play-again", () => {
        startGame();
    });
    document.addEventListener("keydown", handleArrowKeys);
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
        aiWorker = new Worker(new URL("./ai.worker.js", import.meta.url), { type: "module" });

        aiWorker.onmessage = (e) => {
            const payload = e.data;
            if (typeof payload === "number") {
                makeMove(payload, computerSymbol);
                postMoveCleanup();
            } else if (payload && payload.error) {
                console.error("AI Worker Error (payload):", payload.error);
                showErrorModal("AI error: " + payload.error);
                isProcessing = false;
            } else {
                console.warn("Invalid move received from worker:", payload);
                showErrorModal("AI returned an invalid response.");
                isProcessing = false;
            }
        };

        aiWorker.onerror = (err) => {
            console.error("AI Worker Error:", err.message || err);
            showErrorModal("An error occurred while calculating the move.");
            isProcessing = false;
        };
    };

    if (gameMode === "pvp" && aiWorker) {
        aiWorker.terminate();
        aiWorker = null;
    };

    document.querySelector(".symbols span:nth-child(1)").textContent = p1 === "X" ? "close" : "circle";
    document.querySelector(".symbols span:nth-child(2)").textContent = p2 === "X" ? "close" : "circle";
    document.getElementById("home-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";

    loadUIStats();
    startGame();
};

function startGame() {
    difficulty = document.getElementById("difficulty").value;
    board = Array.from(Array(9).keys());
    currentPlayer = playerSymbol;
    gameActive = true;
    updateSymbolColors(currentPlayer, playerSymbol, computerSymbol);
    updateBoardUI(board);
    attachClickHandlers();
};

function handleCellClick(e) {
    if (isProcessing) {
        return;
    };

    const index = parseInt(e.currentTarget.id, 10);
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
            console.warn(`makeMove(): No cell found with index ${index}`);
            return;
        };

        cell.innerHTML = "";
        cell.appendChild(createSymbolNode(player, getPlayerColors(), player === playerSymbol));
        cell.disabled = true;
        cell.setAttribute("aria-pressed", "true");
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
        gameActive = false;
        highlightDrawBoard();
        playTieSound();
        showEndgameMessage("Tie Game", null, gameMode, playerSymbol);

        document.querySelectorAll(".cell").forEach(cell => {
            cell.removeEventListener("click", handleCellClick);
            cell.disabled = true;
        });

        return true;
    };
    return false;
};

function endGame(win, winner) {
    gameActive = false;
    playWinSound();
    showEndgameMessage(
        gameMode === "pvp" ? `Player ${winner === playerSymbol ? "1" : "2"} wins!` : winner === playerSymbol ? "You win!" : "You lose.",
        winner,
        gameMode,
        playerSymbol,
        win.index
    );
    document.querySelectorAll(".cell").forEach(cell => {
        cell.removeEventListener("click", handleCellClick);
        cell.disabled = true;
    });
};

function goToHomeScreen() {
    const keepStats = confirm("Do you want to keep your scores?");
    if (!keepStats) {
        localStorage.setItem("player1Score", 0);
        localStorage.setItem("player2Score", 0);
        localStorage.setItem("draws", 0);
    };

    document.getElementById("game-screen").style.display = "none";
    document.getElementById("home-screen").style.display = "flex";

    if (!keepStats) {
        resetUIStats();
    };

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

    if (!aiWorker) {
        console.warn("AI worker is not available; falling back to random move.");
        const available = board.filter(s => typeof s === "number");
        const randomMove = available[Math.floor(Math.random() * available.length)];
        makeMove(randomMove, computerSymbol);
        postMoveCleanup();
        return;
    };

    try {
        aiWorker.postMessage({
            board,
            computer: computerSymbol,
            player: playerSymbol
        });
    } catch (err) {
        console.error("Failed to post message to AI worker:", err);
        showErrorModal("AI processing failed.");
        isProcessing = false;
    };
};

function postMoveCleanup() {
    if (!checkWinner(board, currentPlayer) && !checkTie()) {
        currentPlayer = playerSymbol;
        updateSymbolColors(currentPlayer, playerSymbol, computerSymbol);
    };
    isProcessing = false;
};

function handleArrowKeys(e) {
    const focused = document.activeElement;
    if (!focused.classList.contains("cell")) {
        return;
    };

    const id = parseInt(focused.id);
    if (isNaN(id)) {
        return;
    };

    const row = Math.floor(id / 3);
    const col = id % 3;

    let targetId;

    switch (e.key) {
        case "ArrowUp":
            if (row > 0) targetId = id - 3;
            break;
        case "ArrowDown":
            if (row < 2) targetId = id + 3;
            break;
        case "ArrowLeft":
            if (col > 0) targetId = id - 1;
            break;
        case "ArrowRight":
            if (col < 2) targetId = id + 1;
            break;
        case "Enter":
        case " ":
            focused.click();
            return;
    };

    if (targetId !== undefined) {
        document.getElementById(targetId)?.focus();
        e.preventDefault();
    };
};

window.addEventListener("pagehide", () => {
    if (aiWorker) {
        aiWorker.terminate();
        aiWorker = null;
    }
});