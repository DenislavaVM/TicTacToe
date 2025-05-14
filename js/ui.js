import { createSymbolNode, getPlayerColors, victoryPatterns, incrementLocalScore } from "./utils.js";

export function initApp() {
    window.onload = () => {
        document.querySelector(".endgame").classList.add("show");
        document.querySelector(".winner-announcement").style.display = "none";
        document.querySelector(".message-text").textContent = "";
        document.querySelector(".winner-symbol").textContent = "";

        const preloadSound = (path) => {
            const a = new Audio(path);
            a.preload = "auto";
        };
        preloadSound("assets/sounds/Player-Moves.mp3");
        preloadSound("assets/sounds/Winning-Game.mp3");
        preloadSound("assets/sounds/Tie-Game.mp3");
    };

    document.addEventListener("error", e => showErrorModal(e.detail));
    document.getElementById("close")?.addEventListener("click", closeEndgameMessage);
    document.getElementById("error-close")?.addEventListener("click", closeErrorModal);
    document.getElementById("play-again-button")?.addEventListener("click", () => {
        closeEndgameMessage();
        document.dispatchEvent(new Event("play-again"));
    });
}

function closeEndgameMessage() {
    document.querySelector(".endgame").classList.remove("show");
    document.querySelector(".message").classList.remove("show");
}

function closeErrorModal() {
    document.querySelector(".error-modal").classList.remove("show");
    document.querySelector(".error-modal .message").classList.remove("show");
}

export function updateBoardUI(board) {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell, i) => {
        cell.textContent = "";
        cell.className = "cell";
        cell.setAttribute("tabindex", "0");
    });
}

export function updateSymbolColors(current, p1, p2) {
    const [p1Color, p2Color] = getPlayerColors();
    const symbols = document.querySelectorAll(".symbols .material-symbols-outlined");
    symbols[0].style.color = current === p1 ? p1Color : "#FFFFFF";
    symbols[1].style.color = current === p2 ? p2Color : "#FFFFFF";
}

export function resetUIStats() {
    document.querySelector(".score1").textContent = "0";
    document.querySelector(".score2").textContent = "0";
    document.querySelector(".draw").textContent = "0";
}

export function showEndgameMessage(msg, winner, mode, player, winIdx = null) {
    const messageBox = document.querySelector(".message");
    document.querySelector(".message-text").textContent = msg;

    if (winner) {
        const label = mode === "pvp" ? (winner === player ? "Player 1" : "Player 2") : (winner === player ? "You" : "Computer");
        document.querySelector(".winner-symbol").textContent = `${label} (${winner})`;
        document.querySelector(".winner-announcement").style.display = "block";
        if (winIdx !== null) {
            victoryPatterns[winIdx].forEach(idx => document.getElementById(idx).classList.add("win"));
        };
    };

    if (!winner) {
        document.querySelector(".winner-announcement").style.display = "none";
    };

    document.querySelector(".endgame").classList.add("show");
    messageBox.classList.add("show");

    updateScore(winner, player);
};

function updateScore(winner, player) {
    if (winner === player) {
        incrementLocalScore("player1Score", ".score1");
    } else if (winner) {
        incrementLocalScore("player2Score", ".score2");
    } else {
        incrementLocalScore("draws", ".draw");
    };
};

export function showErrorModal(message) {
    const modal = document.querySelector(".error-modal");
    const errorText = modal.querySelector(".error-text");
    errorText.textContent = message;
    modal.classList.add("show");
    modal.querySelector(".message").classList.add("show");
};

export function highlightDrawBoard() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        cell.classList.add("draw-highlight");
    });
};