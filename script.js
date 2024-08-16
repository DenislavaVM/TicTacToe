var startingBoard;
let playerSymbol = "X";
let computerSymbol = "O";
const victoryPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2],
];

const cells = document.querySelectorAll(".cell");
const resetButton = document.querySelector(".reset");
let currentPlayer = playerSymbol; 
let difficulty = "hard";

document.getElementById("start-game").addEventListener("click", startGameFromHome);
document.getElementById("back-home-button").addEventListener("click", goToHomeScreen);
resetButton.addEventListener("click", startGame);

window.onload = function() {
    document.querySelector(".endgame").style.display = "none";
    document.querySelector(".winner-announcement").style.display = "none";
    document.querySelector(".message-text").textContent = "";
    document.querySelector(".winner-symbol").textContent = "";
}

function startGameFromHome() {
    const player1Symbol = document.getElementById("player1-symbol").value;
    const player2Symbol = document.getElementById("player2-symbol").value;

    if (player1Symbol === player2Symbol) {
        alert("Players cannot have the same symbol. Please choose different symbols.");
        return;
    }

    playerSymbol = player1Symbol;
    computerSymbol = player2Symbol;

    document.querySelector(".symbols .material-symbols-outlined:nth-child(1)").textContent = player1Symbol === "X" ? "close" : "circle";
    document.querySelector(".symbols .material-symbols-outlined:nth-child(2)").textContent = player2Symbol === "X" ? "close" : "circle";

    localStorage.setItem("player1Score", 0);
    localStorage.setItem("player2Score", 0);
    localStorage.setItem("draws", 0);

    document.querySelector(".score1").textContent = 0;
    document.querySelector(".score2").textContent = 0;
    document.querySelector(".draw").textContent = 0;

    const homeScreen = document.getElementById("home-screen");
    const gameScreen = document.getElementById("game-screen");

    homeScreen.style.display = "none";
    gameScreen.style.display = "block";

    startGame();
}

function startGame() {
    const difficultySelect = document.getElementById("difficulty");
    difficulty = difficultySelect.value;

    let player1Score = localStorage.getItem("player1Score") || 0;
    let player2Score = localStorage.getItem("player2Score") || 0;
    let draws = localStorage.getItem("draws") || 0;

    document.querySelector(".score1").textContent = player1Score;
    document.querySelector(".score2").textContent = player2Score;
    document.querySelector(".draw").textContent = draws;

    document.querySelector(".endgame").classList.remove("show");
    document.querySelector(".winner-announcement").style.display = "none";
    document.querySelector(".message-text").textContent = "";
    document.querySelector(".winner-symbol").textContent = "";

    startingBoard = Array.from(Array(9).keys());
    currentPlayer = playerSymbol; 
    updateSymbolColors();
    for (let i = 0; i < cells.length; i++) {
        cells[i].textContent = "";
        cells[i].style.removeProperty("background-color");
        cells[i].classList.remove("win");
        cells[i].addEventListener("click", handleTurnClick, false);
    }
}

function goToHomeScreen() {
    document.getElementById("game-screen").style.display = "none";
    document.getElementById("home-screen").style.display = "flex";

    document.querySelector(".endgame").style.display = "none";
    document.querySelector(".winner-announcement").style.display = "none";
    document.querySelector(".message-text").textContent = "";
    document.querySelector(".winner-symbol").textContent = "";

    resetBoard();
}

function resetBoard() {
    startingBoard = Array.from(Array(9).keys());
    for (let i = 0; i < cells.length; i++) {
        cells[i].textContent = "";
        cells[i].style.removeProperty("background-color");
        cells[i].classList.remove("win");
        cells[i].removeEventListener("click", handleTurnClick, false);
    }
    currentPlayer = playerSymbol;
}

function handleTurnClick(square) {
    if (typeof startingBoard[square.target.id] == "number") {
        turn(square.target.id, currentPlayer);
        if (!checkWin(startingBoard, currentPlayer) && !checkTie()) {
            currentPlayer = currentPlayer === playerSymbol ? computerSymbol : playerSymbol;
            updateSymbolColors();
            if (currentPlayer === computerSymbol) {
                turn(bestSpot(), computerSymbol);
                if (!checkWin(startingBoard, currentPlayer) && !checkTie()) {
                    currentPlayer = playerSymbol;
                    updateSymbolColors();
                }
            }
        }
    }
}

function turn(squareId, currentPlayer) {
    startingBoard[squareId] = currentPlayer;
    let symbolNode = createHTMLElementFromString(getSymbolHTML(currentPlayer));
    document.getElementById(squareId).innerHTML = "";
    document.getElementById(squareId).appendChild(symbolNode);

    document.getElementById("move-sound").play();

    let gameWon = checkWin(startingBoard, currentPlayer);
    if (gameWon) {
        gameOver(gameWon);
    }
}

function getSymbolHTML(currentPlayer) {
    const player1Color = document.getElementById("player1-color").value;
    const player2Color = document.getElementById("player2-color").value;

    if (currentPlayer === playerSymbol) {
        return `<span class="material-symbols-outlined" style="font-size: 3rem; color: ${player1Color};">${playerSymbol === "X" ? "close" : "circle"}</span>`;
    } else {
        return `<span class="material-symbols-outlined" style="font-size: 3rem; color: ${player2Color};">${computerSymbol === "X" ? "close" : "circle"}</span>`;
    }
}

function createHTMLElementFromString(html) {
    let template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

function checkWin(board, player) {
    let plays = board.reduce((a, element, index) =>
        (element === player) ? a.concat(index) : a, []);
    let gameWon = null;
    for (let [index, win] of victoryPatterns.entries()) {
        if (win.every(element => plays.indexOf(element) > -1)) {
            gameWon = { index: index, player: player };
            break;
        }
    }
    return gameWon;
}

function gameOver(gameWon) {
    for (let index of victoryPatterns[gameWon.index]) {
        document.getElementById(index).classList.add("win");
    }
    for (let index = 0; index < cells.length; index++) {
        cells[index].removeEventListener("click", handleTurnClick, false);
    }

    document.getElementById("win-sound").play();

    declareWinner(gameWon.player == playerSymbol ? "You win!" : "You lose.", gameWon.player);
}

function declareWinner(message, winner) {
    document.querySelector(".message-text").textContent = message;

    if (winner === playerSymbol) {
        let player1Score = parseInt(localStorage.getItem("player1Score") || 0) + 1;
        localStorage.setItem("player1Score", player1Score);
        document.querySelector(".score1").textContent = player1Score;
    } else if (winner === computerSymbol) {
        let player2Score = parseInt(localStorage.getItem("player2Score") || 0) + 1;
        localStorage.setItem("player2Score", player2Score);
        document.querySelector(".score2").textContent = player2Score;
    } else {
        let draws = parseInt(localStorage.getItem("draws") || 0) + 1;
        localStorage.setItem("draws", draws);
        document.querySelector(".draw").textContent = draws;
    }

    if (winner) {
        document.querySelector(".winner-symbol").textContent = winner;
        document.querySelector(".winner-announcement").style.display = "block";
    } else {
        document.querySelector(".winner-announcement").style.display = "none";
    }

    const endgameElement = document.querySelector(".endgame");
    endgameElement.classList.add("show");
    document.querySelector(".message").classList.add("show");
}

function emptySquares(board) {
    return board.filter(s => typeof s == "number");
}

function bestSpot() {
    if (difficulty === "easy") {
        if (Math.random() < 0.5) {
            return randomMove();
        }
    } else if (difficulty === "medium") {
        if (Math.random() < 0.2) {
            return randomMove();
        }
    }

    return minimax(startingBoard, computerSymbol).index;
}

function randomMove() {
    const availableSpots = emptySquares(startingBoard);
    const randomIndex = Math.floor(Math.random() * availableSpots.length);
    return availableSpots[randomIndex];
}

function checkTie() {
    if (emptySquares(startingBoard).length == 0) {
        for (let index = 0; index < cells.length; index++) {
            cells[index].style.backgroundColor = "#D3D3D3"; 
            cells[index].removeEventListener("click", handleTurnClick, false);
        }

        document.getElementById("tie-sound").play();

        declareWinner("Tie Game", null);
        return true;
    }
    return false;
}

function updateSymbolColors() {
    const player1Color = document.getElementById("player1-color").value;
    const player2Color = document.getElementById("player2-color").value;
    const symbols = document.querySelectorAll(".symbols .material-symbols-outlined");
    
    symbols[0].style.color = currentPlayer === playerSymbol ? player1Color : "#FFFFFF";
    symbols[1].style.color = currentPlayer === computerSymbol ? player2Color : "#FFFFFF";
}

function closeEndgameMessage() {
    const endgameElement = document.querySelector(".endgame");
    endgameElement.classList.remove("show");
    startGame();
}

function minimax(board, player) {
    let availSpots = emptySquares(board);

    if (checkWin(board, playerSymbol)) {
        return { score: -10 };
    } else if (checkWin(board, computerSymbol)) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    let moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        let move = {};
        move.index = board[availSpots[i]];
        board[availSpots[i]] = player;

        if (player == computerSymbol) {
            let result = minimax(board, playerSymbol);
            move.score = result.score;
        } else {
            let result = minimax(board, computerSymbol);
            move.score = result.score;
        }

        board[availSpots[i]] = move.index;
        moves.push(move);
    }

    let bestMove;
    if (player === computerSymbol) {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}
