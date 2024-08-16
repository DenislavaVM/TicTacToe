var startingBoard;
const playerSymbol = "X";
const computerSymbol = "O";
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

resetButton.addEventListener("click", startGame);

startGame();

function startGame() {
    const difficultySelect = document.getElementById("difficulty");
    difficulty = difficultySelect.value;

    document.querySelector(".endgame").style.display = "none";
    startingBoard = Array.from(Array(9).keys());
    currentPlayer = playerSymbol; 
    updateSymbolColors();
    for (let i = 0; i < cells.length; i++) {
        cells[i].textContent = "";
        cells[i].style.removeProperty("background-color");
        cells[i].addEventListener("click", handleTurnClick, false);
    }
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

    document.getElementById('move-sound').play();

    let gameWon = checkWin(startingBoard, currentPlayer);
    if (gameWon) {
        gameOver(gameWon);
    }
}

function getSymbolHTML(currentPlayer) {
    if (currentPlayer === playerSymbol) {
        return '<span class="material-symbols-outlined" style="font-size: 3rem; color: #B22222;">close</span>';
    } else {
        return '<span class="material-symbols-outlined" style="font-size: 3rem; color: #b26a22;">circle</span>';
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
        document.getElementById(index).style.backgroundColor = gameWon.player == playerSymbol ? "#f8dbdb" : "#b26a22";
    }
    for (let index = 0; index < cells.length; index++) {
        cells[index].removeEventListener("click", handleTurnClick, false);
    }

    document.getElementById('win-sound').play();

    declareWinner(gameWon.player == playerSymbol ? "You win!" : "You lose.", gameWon.player);
}

function declareWinner(message, winner) {
    let resultMessage = `${message}`;
    if (winner) {
        resultMessage += `<br>The winner is <span class="winner-symbol">${winner}</span>`;
    }
    document.querySelector(".endgame").style.display = "flex";
    document.querySelector(".endgame .content").innerHTML = resultMessage;
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

        document.getElementById('tie-sound').play();

        declareWinner("Tie Game", null);
        return true;
    }
    return false;
}

function updateSymbolColors() {
    const symbols = document.querySelectorAll(".symbols .material-symbols-outlined");
    if (currentPlayer === playerSymbol) { 
        symbols[0].style.color = "#B22222";
        symbols[1].style.color = "#FFFFFF"; 
    } else { 
        symbols[0].style.color = "#FFFFFF"; 
        symbols[1].style.color = "#b26a22"; 
    }
}

function closeEndgameMessage() {
    document.querySelector(".endgame").style.display = "none";
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
