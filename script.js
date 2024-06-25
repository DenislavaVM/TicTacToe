var originalBoard;
const humanPlayer = 'O';
const aiPlayer = 'X';
const winCombos = [
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
    originalBoard = Array.from(Array(9).keys());
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerHTML = '';
        cells[i].style.removeProperty("background-color");
        cells[i].addEventListener('click', handleTurnClick, false);
    }
}

function handleTurnClick(square) {

    if (typeof originalBoard[square.target.id] == 'number') {
        turn(square.target.id, humanPlayer);
        if (!checkWin(originalBoard, humanPlayer) && !checkTie()) {
            turn(bestSpot(), aiPlayer);
        }
    }
}

function turn(squareId, player) {
    // Update the board array and the UI
    originalBoard[squareId] = player;
    document.getElementById(squareId).innerHTML = getSymbolHTML(player);
}

function getSymbolHTML(player) {
    if (player === humanPlayer) {
        return '<span class="material-symbols-outlined" style="font-size: 3rem; color: #B22222;">close</span>';
    } else {
        return '<span class="material-symbols-outlined" style="font-size: 3rem; color: #1E90FF;">circle</span>';
    }
}

function checkWin(board, player) {
    let plays = board.reduce((a, e, i) =>
        (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    for (let [index, win] of winCombos.entries()) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = { index: index, player: player };
            break;
        }
    }
    return gameWon;
}

function gameOver(gameWon) {
    for (let index of winCombos[gameWon.index]) {
        document.getElementById(index).style.backgroundColor =
            gameWon.player == humanPlayer ? "blue" : "red";
    }
    cells.forEach(cell => {
        cell.removeEventListener('click', handleTurnClick, false);
    });
    declareWinner(gameWon.player == humanPlayer ? "You win!" : "You lose.");
}

function declareWinner(who) {
    document.querySelector('.endgame').style.display = "block";
    document.querySelector('.endgame .text').innerText = who;
}

function emptySquares() {
    return originalBoard.filter(s => typeof s == 'number');
}

function bestSpot() {
    return emptySquares()[0];
}

function checkTie() {
    if (emptySquares().length == 0) {
        cells.forEach(cell => {
            cell.style.backgroundColor = "green";
            cell.removeEventListener('click', handleTurnClick, false);
        });
        declareWinner("Tie Game!");
        return true;
    }
    return false;
}