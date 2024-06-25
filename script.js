var startingBoard;
const playerSymbol = 'O';
const computerSymbol = 'X';
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

function turn(squareId, player) {

    // Update the board array and the UI
    startingBoard[squareId] = player;
    document.getElementById(squareId).textContent = player;
}
