export function playMoveSound() {
    const audio = new Audio("assets/sounds/Player-Moves.mp3");
    audio.play();
};

export function playWinSound() {
    const audio = new Audio("assets/sounds/Winning-Game.mp3");
    audio.play();
};

export function playTieSound() {
    const audio = new Audio("assets/sounds/Tie-Game.mp3");
    audio.play();
};