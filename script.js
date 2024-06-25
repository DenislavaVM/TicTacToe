var startingBoard;
const playerSymbol = 'O';
const computerSymbol = 'X';
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

const cells = document.querySelectorAll('.cell');
startGame();

function startGame() {
    document.querySelector('.endgame').style.display = "none";
    startingBoard = Array.from(Array(9).keys());
    for (let i = 0; i < cells.length; i++) {
        cells[i].textContent = '';
        cells[i].style.removeProperty("background-color");
        cells[i].addEventListener('click', handleTurnClick, false);
    }
}

function handleTurnClick(square) {

    // Handle a turn for the human player
    turn(square.target.id, playerSymbol);
}

function turn(squareId, currentPlayer) {
    // Update the board array and the UI
    startingBoard[squareId] = currentPlayer;
    let symbolNode = createHTMLElementFromString (getSymbolHTML(currentPlayer));
    document.getElementById(squareId).innerHTML = '';
    document.getElementById(squareId).appendChild(symbolNode);
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

function createHTMLElementFromString (html) {
    let template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

function checkWin(board, player) {
    // Collect all the indexes that the player has played in
    let plays = board.reduce((a, element, index) =>
        (element === player) ? a.concat(index) : a, []);
    let gameWon = null;

    // Loop through the winning combinations
    for (let [index, win] of victoryPatterns.entries()) {

        // Check if the player's plays contain all elements of the winning combination
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
       cells[index].removeEventListener('click', handleTurnClick, false);
    }
}