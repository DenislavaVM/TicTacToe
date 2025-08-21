import { createSymbolNode, getPlayerColors, victoryPatterns, incrementLocalScore } from "./utils.js";

let lastFocusedElement = null;
let removeEndgameTrap = null;
let endgameEscHandler = null;

export function initApp() {
    document.querySelector(".endgame")?.classList.remove("show");
    document.querySelector(".message")?.classList.remove("show");
    document.querySelector(".winner-announcement").style.display = "none";
    document.querySelector(".message-text").textContent = "";
    document.querySelector(".winner-symbol").textContent = "";

    const preloadSound = (path) => {
        try {
            const a = new Audio(path);
            a.preload = "auto";
        } catch (err) {
            console.warn(`Failed to preload sound at ${path}:`, err);
        };
    };
    preloadSound("assets/sounds/Player-Moves.mp3");
    preloadSound("assets/sounds/Winning-Game.mp3");
    preloadSound("assets/sounds/Tie-Game.mp3");

    document.addEventListener("error", e => showErrorModal(e.detail));
    document.getElementById("close")?.addEventListener("click", closeEndgameMessage);
    document.getElementById("error-close")?.addEventListener("click", closeErrorModal);
    document.getElementById("play-again-button")?.addEventListener("click", () => {
        closeEndgameMessage();
        document.dispatchEvent(new Event("play-again"));
    });
}

export function closeEndgameMessage() {
    const overlay = document.querySelector(".endgame");
    const dialog = overlay.querySelector(".message");

    overlay.classList.remove("show");
    dialog.classList.remove("show");

    document.body.style.overflow = "";
    if (removeEndgameTrap) {
        removeEndgameTrap();
        removeEndgameTrap = null;
    };

    if (endgameEscHandler) {
        document.removeEventListener("keydown", endgameEscHandler);
        endgameEscHandler = null;
    };

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
    };

    lastFocusedElement = null;
};

function trapFocus(container) {
    const focusable = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusable.length === 0) return () => { };

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function handleKeydown(e) {
        if (e.key !== "Tab") {
            return;
        };

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
            return;
        };

        if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
            return;
        };
    };

    container.addEventListener("keydown", handleKeydown);
    return () => container.removeEventListener("keydown", handleKeydown);
};

function closeErrorModal() {
    document.querySelector(".error-modal").classList.remove("show");
    document.querySelector(".error-modal .message").classList.remove("show");
};

export function updateBoardUI(board) {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell, i) => {
        cell.textContent = "";
        cell.className = "cell";
        cell.disabled = false;
        cell.setAttribute("aria-pressed", "false");
        cell.setAttribute("tabindex", "0");
        cell.setAttribute("aria-label", `Cell ${i + 1}`);
    });
};

export function updateSymbolColors(current, p1, p2) {
    const [p1Color, p2Color] = getPlayerColors();
    const symbols = document.querySelectorAll(".symbols .material-symbols-outlined");
    symbols[0].style.color = current === p1 ? p1Color : "#FFFFFF";
    symbols[1].style.color = current === p2 ? p2Color : "#FFFFFF";
};

export function resetUIStats() {
    document.querySelector(".score1").textContent = "0";
    document.querySelector(".score2").textContent = "0";
    document.querySelector(".draw").textContent = "0";
};

export function showEndgameMessage(msg, winner, mode, player, winIdx = null) {
    const overlay = document.querySelector(".endgame");
    const dialog = overlay.querySelector(".message");
    document.querySelector(".message-text").textContent = msg;

    if (winner) {
        const label = mode === "pvp"
            ? (winner === player ? "Player 1" : "Player 2")
            : (winner === player ? "You" : "Computer");

        document.querySelector(".winner-symbol").textContent = `${label} (${winner})`;
        document.querySelector(".winner-announcement").style.display = "block";

        if (winIdx !== null) {
            victoryPatterns[winIdx].forEach(idx => document.getElementById(idx).classList.add("win"));
        };
    } else {
        document.querySelector(".winner-announcement").style.display = "none";
    };

    overlay.classList.add("show");
    dialog.classList.add("show");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    if (!dialog.getAttribute("aria-label") && !dialog.getAttribute("aria-labelledby")) {
        dialog.setAttribute("aria-label", "Game over dialog");
    };

    lastFocusedElement = document.activeElement;
    const playAgainBtn = document.getElementById("play-again-button");
    (playAgainBtn || dialog).focus();

    document.body.style.overflow = "hidden";
    if (removeEndgameTrap) {
        removeEndgameTrap();
    };

    removeEndgameTrap = trapFocus(dialog);

    if (endgameEscHandler) document.removeEventListener("keydown", endgameEscHandler);
    endgameEscHandler = (e) => {
        if (e.key === "Escape") {
            closeEndgameMessage();
        }
    };
    document.addEventListener("keydown", endgameEscHandler);
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